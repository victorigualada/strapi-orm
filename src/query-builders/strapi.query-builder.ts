import { RequestServiceInterface } from '../service/request.service.interface'
import { ObjectType, SelectExecuteCallback } from '../types'

import { SelectQueryBuilder } from './select.query-builder'

export class StrapiQueryBuilder<T> {
  constructor(
    private readonly path: string,
    private readonly requestService: RequestServiceInterface,
  ) {}

  static create<T extends ObjectType>(path: string, requestService: RequestServiceInterface): StrapiQueryBuilder<T> {
    return new StrapiQueryBuilder<T>(path, requestService)
  }

  select(fields: string | string[]): SelectQueryBuilder<T> {
    const executeCallback: SelectExecuteCallback = this.requestService.get.bind(this.requestService)
    return SelectQueryBuilder.create<T>(this.path, executeCallback, fields)
  }

  insert(): StrapiQueryBuilder<T> {
    throw new Error('Not implemented')
  }
}
