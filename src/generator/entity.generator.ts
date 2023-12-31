import fs from 'fs'
import path from 'path'

import { FieldOptions } from '../decorator'

import { AttributeType, RelationType, StrapiAttribute, StrapiSchema } from './strapi-schema.type'

export type GenerationOptions = {
  decorate?: boolean
  dryRun?: boolean
  componentSuffix?: string | boolean
  entitySuffix?: string | boolean
}

const ORM_DECORATORS = [
  '@StrapiEntity',
  '@StrapiComponent',
  '@Field',
  '@Component',
  '@DynamicZone',
  '@OneToOne',
  '@OneToMany',
  '@ManyToOne',
  '@ManyToMany',
]

const packageName = '@vicodes/strapi-orm'

export class EntityGenerator {
  private static readonly COMPONENT_SUFFIX = 'Component'
  private static readonly ENTITY_SUFFIX = 'Entity'

  constructor(private readonly options: GenerationOptions) {
    this.options = {
      decorate: false,
      dryRun: false,
      ...options,
      componentSuffix: options.componentSuffix
        ? typeof options.componentSuffix === 'string' || !options.componentSuffix
          ? options.componentSuffix
          : EntityGenerator.COMPONENT_SUFFIX
        : '',
      entitySuffix: options.entitySuffix
        ? typeof options.entitySuffix === 'string' || !options.entitySuffix
          ? options.entitySuffix
          : EntityGenerator.ENTITY_SUFFIX
        : '',
    }
  }

  generateClassEntityFile(schema: StrapiSchema, filePath?: string): void {
    if (this.options.dryRun) return
    if (['admin', 'upload'].includes(schema.plugin)) return

    const generationPath = 'generated'

    const enumPath = path.resolve(`./${generationPath}/enums`)
    const entityPath = path.resolve(`./${generationPath}/entities`)
    const componentPath = path.resolve(`./${generationPath}/components`)

    const existingImports = filePath
      ? fs
          .readFileSync(filePath, { encoding: 'utf-8' })
          .split('\n')
          .filter(line => line.startsWith('import'))
      : null

    const [classEntity, enums] = this.generateClassEntity(schema, existingImports)
    if (!classEntity) return

    // Components and Entities might have multiple enums
    if (enums.length) {
      fs.mkdirSync(enumPath, { recursive: true })
      enums.forEach(enumStr => {
        const enumName = enumStr.split(' ')[2]
        fs.writeFileSync(path.join(enumPath, `${this.pascalToKebab(enumName)}.enum.ts`), enumStr)
      })
    }

    // It's a Component
    if (schema.category) {
      if (!filePath) {
        fs.mkdirSync(componentPath, { recursive: true })
      }
      fs.writeFileSync(
        filePath || path.join(componentPath, `${this.dotNotationToKebab(schema.uid)}.component.ts`),
        classEntity,
      )
      return
    }

    // It's an Entity
    if (!filePath) {
      fs.mkdirSync(entityPath, { recursive: true })
    }
    fs.writeFileSync(filePath || path.join(entityPath, `${schema.apiID}.entity.ts`), classEntity)
  }

  generateAllEntitiesAndComponents(contentTypes: StrapiSchema[], components: StrapiSchema[]): void {
    contentTypes.forEach(this.generateClassEntityFile.bind(this))
    components.forEach(this.generateClassEntityFile.bind(this))
  }

  updateAllEntitiesAndComponents(contentTypes: StrapiSchema[], components: StrapiSchema[], paths: string[]): void {
    contentTypes.forEach(schema => {
      const path = paths.find(p => p.includes(`/${schema.apiID}.entity.ts`))
      this.generateClassEntityFile(schema, path)
    })
    components.forEach(schema => {
      const path = paths.find(p => p.includes(`/${schema.uid}.component.ts`))
      this.generateClassEntityFile(schema, path)
    })
  }

  private isAlreadyImported(lines: string[], importStatement: string): boolean {
    return !!lines.find(line => line.includes(importStatement.split(' from')[0]))
  }

  private toCamelCase(str: string): string {
    return str.replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''))
  }

  private toPascalCase(str: string): string {
    const camelCase = this.toCamelCase(str)
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
  }

  private toKebab(str: string): string {
    return str
      .replace(/[_.]/g, '-')
      .replace(/[A-Z]/g, (match, offset) => (offset > 0 ? `-${match.toLowerCase()}` : match.toLowerCase()))
  }

  private pascalToKebab(str: string): string {
    return str.replace(/[A-Z]/g, (match, offset) => (offset > 0 ? `-${match.toLowerCase()}` : match.toLowerCase()))
  }

  private dotNotationToKebab(str: string): string {
    return str.replace(/\./g, '-')
  }

  private dotNotationToPascalCase(str: string): string {
    return this.toPascalCase(str.replace(/\./g, '-'))
  }

  private sanitizeKey(key: string): string {
    // Replace invalid characters with underscores
    return key.replace(/[^a-zA-Z0-9_$]/g, '_')
  }

  private getApiIdFromTarget(attribute: StrapiAttribute): string {
    return attribute.target?.split('.').pop() || ''
  }

  private getCollectionNameFromUid(uid: string): string {
    return uid.split('.').pop() || ''
  }

  private toClassType(attribute: StrapiAttribute): string {
    const targetApiID = this.getApiIdFromTarget(attribute)
    return this.toPascalCase(targetApiID) + this.options.entitySuffix
  }

  private getPropertyDecorators(lines: string[]): Set<string> {
    return new Set<string>(
      lines
        .filter(line => ORM_DECORATORS.some(d => line.includes(d)))
        .map(decorator => decorator.match(/@(\w+)/)?.[1] || ''),
    )
  }

  private getFilePath(attribute: StrapiAttribute, propertyName: string, parentSchemaIsComponent: boolean): string {
    if (attribute.type === 'relation') {
      const fileName = attribute.target ? this.getApiIdFromTarget(attribute) : propertyName
      return parentSchemaIsComponent
        ? `../entities/${this.toKebab(fileName)}.entity`
        : `./${this.toKebab(fileName)}.entity`
    }

    if (attribute.type === 'component') {
      return parentSchemaIsComponent
        ? `./${this.toKebab(attribute.component)}.component`
        : `../components/${this.toKebab(attribute.component)}.component`
    }

    return ''
  }

  private getTypeAnnotation(uid: string, attribute: StrapiAttribute, propertyName: string): string {
    switch (attribute.type) {
      case AttributeType.Boolean:
        return 'boolean'
      case AttributeType.DateTime:
      case AttributeType.Integer:
      case AttributeType.BigInteger:
      case AttributeType.Decimal:
      case AttributeType.Float:
      case AttributeType.Number:
        return 'number'
      case AttributeType.Email:
      case AttributeType.Password:
      case AttributeType.Text:
      case AttributeType.RichText:
      case AttributeType.UID:
      case AttributeType.Json:
      case AttributeType.String:
        return 'string'
      case AttributeType.Date:
        return 'Date'
      case AttributeType.Media:
        return '{ url: string }'
      case AttributeType.Enumeration:
        return `${this.toPascalCase(this.getCollectionNameFromUid(uid))}${this.toPascalCase(propertyName)}`
      case AttributeType.Component:
        return `${this.dotNotationToPascalCase(attribute.component)}${this.options.componentSuffix}`
      case AttributeType.Relation:
        return this.toClassType(attribute)
      case AttributeType.DynamicZone:
        return `[${attribute.components
          .map(c => `${this.dotNotationToPascalCase(c)}${this.options.componentSuffix}`)
          .join(', ')}]`
      default:
        return ''
    }
  }

  private mapRelationTypeToDecorator(
    relationType: string,
    target: string,
    propertyName: string,
    attribute: StrapiAttribute,
  ): string | null {
    const targetApiID = target.split('.').pop()
    const targetClassName = this.toPascalCase(targetApiID) + this.options.entitySuffix

    const inversed = [
      this.toCamelCase(propertyName),
      attribute.inversedBy ? this.toCamelCase(attribute.inversedBy) : '',
    ].join('.')

    const propertyType = this.toPascalCase(targetClassName)
    const property = this.toCamelCase(propertyName)

    switch (relationType) {
      case RelationType.OneToOne:
        return `@OneToOne(() => ${propertyType})`
      case RelationType.OneToMany:
        return `@OneToMany(() => ${propertyType}${
          attribute.inversedBy ? `, (${property}: ${propertyType}) => ${inversed}` : ''
        })`
      case RelationType.ManyToOne:
        return `@ManyToOne(() => ${propertyType}${
          attribute.inversedBy ? `, (${property}: ${propertyType}) => ${inversed}` : ''
        })`
      case RelationType.ManyToMany:
        return `@ManyToMany(() => ${propertyType}${
          attribute.inversedBy ? `, (${property}: ${propertyType}) => ${inversed}` : ''
        })`
      default:
        return null
    }
  }

  private convertToDecorators(attribute: StrapiAttribute, propertyName: string, typeAnnotation: string): string[] {
    if (attribute.type === AttributeType.Component) {
      const { component, repeatable } = attribute
      return [`@Component('${component}', { repeatable: ${repeatable} })`]
    }

    if (attribute.type === AttributeType.Relation) {
      const { relation, target } = attribute
      const relationDecorator = this.mapRelationTypeToDecorator(relation, target, propertyName, attribute)
      return [`${relationDecorator}`]
    }

    if (attribute.type === AttributeType.DynamicZone) {
      return [
        `@DynamicZone({ components: [${attribute.components
          .map(c => `${this.dotNotationToPascalCase(c)}${this.options.componentSuffix}`)
          .join(', ')}] })`,
      ]
    }

    const { type, required, unique, default: defaultValue } = attribute
    let fieldOptions: Partial<FieldOptions> = {
      type,
      required,
      unique,
      default: defaultValue,
    }

    if (type === AttributeType.Enumeration) {
      fieldOptions = {
        ...fieldOptions,
        enum: typeAnnotation,
      }
    }

    return [
      `@Field({ ${Object.entries(fieldOptions)
        .map(([key, value]) => {
          if (!value) return null
          const valueStr = typeof value === 'boolean' || key === 'enum' ? value : `'${value}'`

          return `${this.toCamelCase(key)}: ${valueStr}`
        })
        .filter(Boolean)
        .join(', ')} })`,
    ]
  }

  private generateEnum(uid: string, attribute: StrapiAttribute, propertyName: string): string {
    const { enum: enumValues } = attribute
    const enumName = `${this.toPascalCase(this.getCollectionNameFromUid(uid))}${this.toPascalCase(propertyName)}`
    const enumValuesStr = enumValues
      .map((value: string) => `  ${this.sanitizeKey(value.toUpperCase())} = '${value}'`)
      .join(',\n')
    return `export enum ${enumName} {\n${enumValuesStr}\n}`
  }

  private generateClassName(isComponent: boolean, uid: string, apiID: string): string {
    return isComponent
      ? `${this.dotNotationToPascalCase(uid)}${this.options.componentSuffix}`
      : `${this.toPascalCase(apiID)}${this.options.entitySuffix}`
  }

  private generateClassEntity(schema: StrapiSchema, existingImports: string[]): [string, string[]] {
    const {
      uid,
      apiID,
      plugin,
      category,
      schema: { attributes },
    } = schema

    const isComponent = !!category

    const className = this.generateClassName(isComponent, uid, apiID)
    const path = apiID // Use apiID as the path directly
    const pluginStr = plugin ? `  plugin: '${plugin}',\n` : ''

    const enums = []
    const lines = []
    if (existingImports) {
      lines.push(...existingImports)
    }

    if (this.options.decorate) {
      if (isComponent) {
        lines.push(`@StrapiComponent({`)
        lines.push(`  uid: '${uid}',`)
        lines.push(`})`)
      } else {
        lines.push(`@StrapiEntity({`)
        lines.push(`  path: '${path}',`)
        pluginStr && lines.push(pluginStr)
        lines.push(`})`)
      }
    }

    lines.push(`export class ${className} {`)

    for (const [propertyName, attribute] of Object.entries(attributes)) {
      const optional = attribute.required ? '' : '?'
      const array =
        attribute.repeatable ||
        (attribute.type === AttributeType.Relation && attribute.relation?.toLowerCase().includes('many'))
          ? '[]'
          : ''
      const typeAnnotation = this.getTypeAnnotation(uid, attribute, propertyName)
      const decorators = this.options.decorate ? this.convertToDecorators(attribute, propertyName, typeAnnotation) : []

      if (attribute.type === AttributeType.Relation || attribute.type === AttributeType.Component) {
        if (this.getApiIdFromTarget(attribute) === apiID) continue // Skip self reference

        const filePath = this.getFilePath(attribute, propertyName, isComponent)
        const importStatement = `import { ${typeAnnotation} } from '${filePath}'`

        if (!this.isAlreadyImported(lines, importStatement)) {
          lines.splice(0, 0, importStatement)
        }
      }

      if (attribute.type === AttributeType.DynamicZone) {
        attribute.components.forEach(component => {
          const filePath = `../components/${this.toKebab(component)}.component`
          const importStatement = `import { ${this.dotNotationToPascalCase(component)}${
            this.options.componentSuffix
          } } from '${filePath}'`

          if (!this.isAlreadyImported(lines, importStatement)) {
            lines.splice(0, 0, importStatement)
          }
        })
      }

      if (attribute.type === AttributeType.Enumeration) {
        enums.push(this.generateEnum(uid, attribute, propertyName))

        const enumName = `${this.toPascalCase(this.getCollectionNameFromUid(uid))}${this.toPascalCase(propertyName)}`
        const importStatement = `import { ${enumName} } from '../enums/${this.pascalToKebab(enumName)}.enum'`

        if (!this.isAlreadyImported(lines, importStatement)) {
          lines.splice(0, 0, importStatement)
        }
      }

      lines.push(...decorators.map(decorator => `  ${decorator}`))
      lines.push(`  ${this.toCamelCase(propertyName)}${optional}: ${typeAnnotation}${array}\n`)
    }

    const propertyDecorators = this.getPropertyDecorators(lines)
    if (propertyDecorators.size) {
      if (!lines.some(l => l.includes(`from '${packageName}'`))) {
        lines.splice(0, 0, `import { ${Array.from(propertyDecorators).join(', ')} } from '${packageName}'`)
      }
    }

    return [lines.join('\n').concat('}'), enums]
  }
}
