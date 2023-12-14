import { StrapiQueryBuilder } from '../query-builders/strapi.query-builder'
import { RequestServiceInterface } from '../service/request.service.interface'
import { ObjectType } from '../types'

interface StrapiEntityOptions {
  path: string
}

export class StrapiRepository<T> {
  constructor(
    private readonly entityOptions: StrapiEntityOptions,
    private readonly requestService: RequestServiceInterface,
  ) {}

  createQueryBuilder<T extends ObjectType>(): StrapiQueryBuilder<InstanceType<T>> {
    return StrapiQueryBuilder.create<InstanceType<T>>(this.entityOptions.path, this.requestService)
  }

  find(): Promise<T> {
    return this.requestService.get<T>(this.entityOptions.path)
  }

  findById(id: unknown): Promise<T> {
    return this.requestService.get<T>(this.entityOptions.path + '/' + id)
  }

  create(entity: T): Promise<T> {
    return this.requestService.post<T>(this.entityOptions.path, entity)
  }

  update(id: unknown, entity: Partial<T>): Promise<T> {
    return this.requestService.put<T>(this.entityOptions.path + '/' + id, entity)
  }
}
