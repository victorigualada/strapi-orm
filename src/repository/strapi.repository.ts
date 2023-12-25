import { StrapiComponentOptions } from '../decorator/strapi-component.decorator'
import { StrapiQueryBuilder } from '../query-builders/strapi.query-builder'
import { RequestService } from '../service/request.service'
import { FindOptionsWhere, ObjectType } from '../types'

interface StrapiEntityOptions {
  path: string
}

export class StrapiRepository<Entity> {
  constructor(
    private readonly entityOptions: StrapiEntityOptions | StrapiComponentOptions,
    private readonly requestService: RequestService,
  ) {}

  createQueryBuilder<Entity extends ObjectType>(): StrapiQueryBuilder<InstanceType<Entity>> {
    return StrapiQueryBuilder.create<InstanceType<Entity>>(this.entityOptions.path, this.requestService)
  }

  find(): Promise<Entity> {
    return this.requestService.get<Entity>(this.entityOptions.path)
  }

  findBy(where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]): Promise<Entity[]> {
    return this.createQueryBuilder().select('*').setFindOptions(where).getMany()
  }

  findOneBy(where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]): Promise<Entity | null> {
    return this.createQueryBuilder().select('*').setFindOptions(where).getOne()
  }

  findOneById(id: unknown): Promise<Entity> {
    return this.requestService.get<Entity>(this.entityOptions.path + '/' + id)
  }

  create(entity: Entity): Promise<Entity> {
    return this.requestService.post<Entity>(this.entityOptions.path, entity)
  }

  update(id: unknown, entity: Partial<Entity>): Promise<Entity> {
    return this.requestService.put<Entity>(this.entityOptions.path + '/' + id, entity)
  }
}
