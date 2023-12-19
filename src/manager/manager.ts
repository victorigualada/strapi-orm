import { StrapiEntityOptions } from '../decorator/strapi-entity.decorator'
import { StrapiRepository } from '../repository/strapi.repository'
import { StrapiRequestService } from '../service/strapi-request.service'
import { ConnectionConfig, ObjectType } from '../types'

import { RepositoryManager } from './repository-manager'

export class Manager {
  private static metadataStorage = new Map<string, StrapiEntityOptions>()
  private readonly requestService: StrapiRequestService

  constructor(config: ConnectionConfig) {
    this.requestService = new StrapiRequestService(config)
  }

  static getEntityMetadata<Entity extends ObjectType>(target: InstanceType<Entity>) {
    return Manager.metadataStorage.get(target.name)
  }

  static setEntityMetadata<Entity extends ObjectType>(target: InstanceType<Entity>, options: StrapiEntityOptions) {
    Manager.metadataStorage.set(target.name, options)
  }

  getRepository<Entity extends ObjectType>(target: InstanceType<Entity>): StrapiRepository<InstanceType<Entity>> {
    const entityOptions = Manager.getEntityMetadata(target)
    let repository = RepositoryManager.getRepository(target)

    if (!repository) {
      repository = new StrapiRepository<InstanceType<Entity>>(entityOptions, this.requestService)
      RepositoryManager.addRepository(target, repository)
    }

    return repository
  }
}
