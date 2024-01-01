import fs from 'fs'

import { EntityGenerator, GenerationOptions } from '../../src/generator/entity.generator'
import { AttributeType, StrapiSchema } from '../../src/generator/strapi-schema.type'

jest.mock('fs')

describe('EntityGenerator', () => {
  let generator: EntityGenerator

  let writeFileSyncMock: jest.SpyInstance
  let mkdirSyncMock: jest.SpyInstance

  beforeAll(() => {
    writeFileSyncMock = jest.spyOn(fs, 'writeFileSync').mockImplementation()
    mkdirSyncMock = jest.spyOn(fs, 'mkdirSync').mockImplementation()
  })

  beforeEach(() => {
    const options: GenerationOptions = {
      decorate: true,
      dryRun: false,
    }
    generator = new EntityGenerator(options)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it.each`
    entitySuffix
    ${false}
    ${undefined}
    ${'Ent'}
  `(
    'should generate class entity file for content type with correct name when entitySuffix is $entitySuffix',
    ({ entitySuffix }) => {
      // arrange
      const schema: StrapiSchema = {
        uid: 'api::content-type.content-type',
        apiID: 'content-type',
        category: null,
        schema: {
          attributes: {
            name: {
              type: AttributeType.String,
              required: true,
              repeatable: false,
              default: null,
            },
          },
        },
      }

      const expectedClassNameSuffix = entitySuffix
        ? typeof entitySuffix === AttributeType.String || !entitySuffix
          ? entitySuffix
          : 'Entity'
        : ''

      // act
      const options: GenerationOptions = {
        decorate: true,
        dryRun: false,
        entitySuffix,
      }
      generator = new EntityGenerator(options)
      generator.generateClassEntityFile(schema)

      // assert
      expect(writeFileSyncMock).toHaveBeenCalledWith(
        expect.stringContaining('content-type.entity.ts'),
        expect.stringContaining('@StrapiEntity'),
      )
      expect(writeFileSyncMock).toHaveBeenCalledWith(
        expect.stringContaining('content-type.entity.ts'),
        expect.stringContaining(`export class ContentType${expectedClassNameSuffix}`),
      )
      expect(mkdirSyncMock).toHaveBeenCalled()
    },
  )

  it.each`
    componentSuffix
    ${false}
    ${undefined}
    ${'Comp'}
  `(
    'should generate class entity file for content type with correct name when entitySuffix = $entitySuffix',
    ({ componentSuffix }) => {
      // arrange
      const schema: StrapiSchema = {
        uid: 'component.example',
        apiID: 'example',
        category: 'component',
        schema: {
          attributes: {
            name: {
              type: AttributeType.String,
              required: true,
              repeatable: false,
              default: null,
            },
          },
        },
      }

      const expectedClassNameSuffix = componentSuffix
        ? typeof componentSuffix === AttributeType.String || !componentSuffix
          ? componentSuffix
          : 'Component'
        : ''

      // act
      const options: GenerationOptions = {
        decorate: true,
        dryRun: false,
        componentSuffix,
      }
      generator = new EntityGenerator(options)
      generator.generateClassEntityFile(schema)

      // assert
      expect(writeFileSyncMock).toHaveBeenCalledWith(
        expect.stringContaining('component-example.component.ts'),
        expect.stringContaining('@StrapiComponent'),
      )
      expect(writeFileSyncMock).toHaveBeenCalledWith(
        expect.stringContaining('component-example.component.ts'),
        expect.stringContaining(`export class ComponentExample${expectedClassNameSuffix}`),
      )
      expect(mkdirSyncMock).toHaveBeenCalled()
    },
  )

  it('should generate class component file without replacing imports', () => {
    // arrange
    const schema: StrapiSchema = {
      uid: 'component.example',
      apiID: 'example',
      category: 'component',
      schema: {
        attributes: {
          name: {
            type: AttributeType.String,
            required: true,
            repeatable: false,
            default: null,
          },
        },
      },
    }
    const testEntityPath = '../mock/test.entity.ts'
    const existingImport = "import { SomeContentType } from '../some/path'"

    const readFileSyncMock = jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValueOnce("import { SomeContentType } from '../some/path'")

    // act
    generator.generateClassEntityFile(schema, testEntityPath)

    // assert
    expect(readFileSyncMock).toHaveBeenCalledWith(expect.stringMatching(testEntityPath), expect.anything())
    expect(writeFileSyncMock).toHaveBeenCalledWith(
      expect.stringContaining('../mock/test.entity.ts'),
      expect.stringContaining(existingImport),
    )
    expect(writeFileSyncMock).toHaveBeenCalledWith(
      expect.stringContaining('../mock/test.entity.ts'),
      expect.stringContaining('@StrapiComponent'),
    )
  })

  it.each`
    type            | decorator
    ${'boolean'}    | ${"@Field({ type: 'boolean' })\n  attribute1?: boolean"}
    ${'datetime'}   | ${"@Field({ type: 'datetime' })\n  attribute1?: number"}
    ${'integer'}    | ${"@Field({ type: 'integer' })\n  attribute1?: number"}
    ${'biginteger'} | ${"@Field({ type: 'biginteger' })\n  attribute1?: number"}
    ${'decimal'}    | ${"@Field({ type: 'decimal' })\n  attribute1?: number"}
    ${'float'}      | ${"@Field({ type: 'float' })\n  attribute1?: number"}
    ${'number'}     | ${"@Field({ type: 'number' })\n  attribute1?: number"}
    ${'json'}       | ${"@Field({ type: 'json' })\n  attribute1?: string"}
    ${'uid'}        | ${"@Field({ type: 'uid' })\n  attribute1?: string"}
    ${'richtext'}   | ${"@Field({ type: 'richtext' })\n  attribute1?: string"}
    ${'text'}       | ${"@Field({ type: 'text' })\n  attribute1?: string"}
    ${'password'}   | ${"@Field({ type: 'password' })\n  attribute1?: string"}
    ${'email'}      | ${"@Field({ type: 'email' })\n  attribute1?: string"}
    ${'string'}     | ${"@Field({ type: 'string' })\n  attribute1?: string"}
    ${'date'}       | ${"@Field({ type: 'date' })\n  attribute1?: Date"}
  `('should generate correct decorator for attribute type $type', ({ type, decorator }) => {
    // arrange
    const schema: StrapiSchema = {
      uid: 'api::content-type.content-type',
      apiID: 'content-type',
      category: null,
      schema: {
        attributes: {
          attribute1: {
            type,
            required: false,
            repeatable: false,
            default: null,
          },
        },
      },
    }

    // act
    generator.generateClassEntityFile(schema)

    // assert
    expect(writeFileSyncMock).toHaveBeenCalledWith(expect.any(String), expect.stringContaining(decorator))
    expect(mkdirSyncMock).toHaveBeenCalled()
  })

  it('should generate correct decorator for attribute type enumeration', () => {
    // arrange
    const schema: StrapiSchema = {
      uid: 'api::content-type.content-type',
      apiID: 'content-type',
      category: null,
      schema: {
        attributes: {
          enumAttribute: {
            type: AttributeType.Enumeration,
            enum: ['value-1', 'value-2'],
            required: true,
          },
        },
      },
    }

    // act
    generator.generateClassEntityFile(schema)

    // assert
    expect(writeFileSyncMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('content-type-enum-attribute.enum.ts'),
      expect.stringContaining(
        "export enum ContentTypeEnumAttribute {\n  VALUE_1 = 'value-1',\n  VALUE_2 = 'value-2'\n}",
      ),
    )
    expect(writeFileSyncMock).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.stringContaining(
        "@Field({ type: 'enumeration', required: true, enum: 'ContentTypeEnumAttribute' })\n  enumAttribute: ContentTypeEnumAttribute",
      ),
    )
    expect(mkdirSyncMock).toHaveBeenCalled()
  })

  it('should generate correct decorator for attribute type DynamicZone', () => {
    // arrange
    const schema: StrapiSchema = {
      uid: 'api::content-type.content-type',
      apiID: 'content-type',
      category: null,
      schema: {
        attributes: {
          dynamicZoneAttr: {
            type: AttributeType.DynamicZone,
            components: ['example.component1', 'example.component2'],
            required: true,
          },
        },
      },
    }

    // act
    generator.generateClassEntityFile(schema)

    // assert
    expect(writeFileSyncMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining(
        '@DynamicZone({ components: [ExampleComponent1, ExampleComponent2] })\n  dynamicZoneAttr: [ExampleComponent1, ExampleComponent2]',
      ),
    )
    expect(mkdirSyncMock).toHaveBeenCalled()
  })

  it('should generate correct decorator for attribute type Component ', () => {
    // arrange
    const schema: StrapiSchema = {
      uid: 'example.content-type',
      apiID: 'example',
      category: null,
      schema: {
        attributes: {
          componentAttr: {
            type: AttributeType.Component,
            component: 'example.component',
            repeatable: false,
            required: true,
          },
        },
      },
    }

    // act
    generator.generateClassEntityFile(schema)

    // assert
    expect(writeFileSyncMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining(
        "@Component('example.component', { repeatable: false })\n  componentAttr: ExampleComponent",
      ),
    )
    expect(mkdirSyncMock).toHaveBeenCalled()
  })

  it.each`
    decorator        | relationType    | target                      | propertyName             | expectedType
    ${'@OneToOne'}   | ${'oneToOne'}   | ${'example.related-entity'} | ${'relatedEntityAttr'}   | ${'RelatedEntity'}
    ${'@OneToMany'}  | ${'oneToMany'}  | ${'example.related-entity'} | ${'relatedEntitiesAttr'} | ${'RelatedEntity'}
    ${'@ManyToOne'}  | ${'manyToOne'}  | ${'example.related-entity'} | ${'relatedEntityAttr'}   | ${'RelatedEntity'}
    ${'@ManyToMany'} | ${'manyToMany'} | ${'example.related-entity'} | ${'relatedEntitiesAttr'} | ${'RelatedEntity'}
  `(
    'should generate correct decorator for attribute type Relation ($decorator)',
    ({ decorator, relationType, target, propertyName, expectedType }) => {
      // arrange
      const schema: StrapiSchema = {
        uid: 'api::content-type.content-type',
        apiID: 'content-type',
        schema: {
          attributes: {
            [propertyName]: {
              type: AttributeType.Relation,
              relation: relationType,
              inversedBy: 'example',
              target,
              required: true,
            },
          },
        },
      }

      // act
      generator.generateClassEntityFile(schema)

      // assert
      expect(writeFileSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(
          relationType === 'oneToOne'
            ? `${decorator}(() => ${expectedType}`
            : `${decorator}(() => ${expectedType}, (${propertyName}: ${expectedType}) => ${propertyName}.example)`,
        ),
      )
      expect(mkdirSyncMock).toHaveBeenCalled()
    },
  )
})
