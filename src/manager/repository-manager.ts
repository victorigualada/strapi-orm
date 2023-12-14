import { StrapiRepository } from '../repository/strapi.repository'
import { ObjectType } from '../types'

export class RepositoryManager {
  private static repositories = new Map<string, StrapiRepository<InstanceType<ObjectType>>>()

  static addRepository<Entity extends ObjectType>(entity: Entity, repository: StrapiRepository<Entity>): void {
    const repositoryToken = `${entity.name}Repository`

    if (!this.repositories.has(repositoryToken)) {
      this.repositories.set(repositoryToken, repository)
    }
  }

  static getRepository<Entity extends ObjectType>(entity: Entity): StrapiRepository<Entity> {
    const repositoryToken = `${entity.name}Repository`

    if (!this.repositories.has(repositoryToken)) {
      return null
    }

    return this.repositories.get(repositoryToken)
  }
}
