import { RequestService } from '../service/request.service'
import { ObjectType, SelectExecuteCallback } from '../types'

import { SelectQueryBuilder } from './select.query-builder'

export class StrapiQueryBuilder<Entity> {
  constructor(
    private readonly path: string,
    private readonly requestService: RequestService,
  ) {}

  static create<Entity extends ObjectType>(path: string, requestService: RequestService): StrapiQueryBuilder<Entity> {
    return new StrapiQueryBuilder<Entity>(path, requestService)
  }

  select(fields: string | string[]): SelectQueryBuilder<Entity> {
    const executeCallback: SelectExecuteCallback = this.requestService.get.bind(this.requestService)
    return SelectQueryBuilder.create<Entity>(this.path, executeCallback, fields)
  }

  insert(): StrapiQueryBuilder<Entity> {
    throw new Error('Not implemented')
  }
}
