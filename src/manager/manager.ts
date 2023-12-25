import { FieldOptions, StrapiComponentOptions, StrapiEntityOptions } from '../decorator'
import { EntityGenerator } from '../generator/entity.generator'
import { StrapiSchema } from '../generator/strapi-schema.type'
import { StrapiRepository } from '../repository/strapi.repository'
import { StrapiRequestService } from '../service/strapi-request.service'
import { ConnectionConfig, ObjectType } from '../types'
import { importClassesFromDirectories } from '../utils/entity-loader'
import { SchemaValidator } from '../validator/schema.validator'

import { RepositoryManager } from './repository-manager'

export type MetadataOptions = {
  options: StrapiEntityOptions | StrapiComponentOptions
  fields: Record<string, FieldOptions>
}

export class Manager {
  private static metadataStorage = new Map<string, MetadataOptions>()
  private readonly requestService: StrapiRequestService

  constructor(private readonly config: ConnectionConfig) {
    this.requestService = new StrapiRequestService(config)
  }

  static async start(config: ConnectionConfig): Promise<Manager> {
    const manager = new Manager(config)

    const [schemaEntities, paths] = await manager.importEntities()

    const contentTypes = await manager.getContentTypes()

    if (config.synchronize) {
      const components = await manager.getComponents()
      const entityGenerator = new EntityGenerator({ decorate: true })
      entityGenerator.updateAllEntitiesAndComponents(contentTypes, components, paths)
    }

    if (config.validateSchema) {
      SchemaValidator.validate(schemaEntities, contentTypes)
    }

    return manager
  }

  static getEntityMetadata<Entity extends ObjectType>(target: InstanceType<Entity>): MetadataOptions {
    if (!Manager.metadataStorage.has(target.name)) {
      Manager.metadataStorage.set(target.name, { options: {}, fields: {} } as MetadataOptions)
    }
    return Manager.metadataStorage.get(target.name)
  }

  static setEntityMetadata<Entity extends ObjectType>(target: InstanceType<Entity>, options: MetadataOptions) {
    Manager.metadataStorage.set(target.name, options)
  }

  getRepository<Entity extends ObjectType>(target: InstanceType<Entity>): StrapiRepository<InstanceType<Entity>> {
    const { options: entityOptions } = Manager.getEntityMetadata(target)
    let repository = RepositoryManager.getRepository(target)

    if (!repository) {
      repository = new StrapiRepository<InstanceType<Entity>>(entityOptions, this.requestService)
      RepositoryManager.addRepository(target, repository)
    }

    return repository
  }

  async generateEntities() {
    const contentTypes: StrapiSchema[] = await this.getContentTypes()
    const components: StrapiSchema[] = await this.getComponents()

    const entityGenerator = new EntityGenerator({ decorate: true, dryRun: true })

    entityGenerator.generateAllEntitiesAndComponents(contentTypes, components)
  }

  private async importEntities(): Promise<[Function[], string[]]> {
    let dirEntities: string[] = []
    if (typeof this.config.entities === 'string') {
      dirEntities = [this.config.entities]
    } else {
      dirEntities = this.config.entities
    }

    return importClassesFromDirectories(dirEntities)
  }

  private async getContentTypes(): Promise<StrapiSchema[]> {
    let contentTypes = []
    try {
      contentTypes = this.requestService.flatten(await this.requestService.get('content-type-builder/content-types'))
    } catch (error) {
      throw new Error(`Error getting content types. Make sure the accessToken has the correct permissions. - ${error}`)
    }

    return contentTypes
  }

  private async getComponents(): Promise<StrapiSchema[]> {
    let components = []
    try {
      components = this.requestService.flatten(await this.requestService.get('content-type-builder/components'))
    } catch (error) {
      throw new Error(`Error getting components. Make sure the accessToken has the correct permissions. - ${error}`)
    }

    return components
  }
}
