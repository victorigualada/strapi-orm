import { ObjectType, SelectExecuteCallback, StrapiFilter, StrapiQuery, StrapiSort } from '../types'
import mergeDeep, { resolvePopulatedRelation } from '../utils/objects'

export class SelectQueryBuilder<T> {
  private selectFields: string[] = []
  private populateFields: Record<string, StrapiQuery> = {}
  private whereFields: Record<string, StrapiFilter> = {}

  constructor(
    private readonly path: string,
    private readonly executeCallback: SelectExecuteCallback,
    fields: string | string[] = '*',
  ) {
    this.selectFields = this.selectFields.concat(fields)
  }

  static create<T extends ObjectType>(
    path: string,
    execute: SelectExecuteCallback,
    fields: string | string[],
  ): SelectQueryBuilder<InstanceType<T>> {
    return new SelectQueryBuilder(path, execute, fields)
  }

  populate(
    field: string,
    childFields: string | string[] = '*',
    filters?: Record<string, StrapiFilter>,
    sort?: Record<string, StrapiSort>,
  ): SelectQueryBuilder<T> {
    const fieldsToPopulate = field.split('.').reverse()

    fieldsToPopulate.reduce(
      (acc, curr, index, array) => {
        if (index === 0) {
          // If it's the last field in the chain, just append the fields, filters and sort
          acc[curr] = {
            fields: childFields,
            filters: { ...filters },
            sort: { ...sort },
          }
        } else {
          // If it's not the last field in the chain, append the child field and the previous fields
          const alreadyPopulatedRelation: StrapiQuery = resolvePopulatedRelation(array, this.populateFields)
          const child = array[index - 1]
          acc[curr] = {
            fields: alreadyPopulatedRelation?.fields,
            populate: { ...alreadyPopulatedRelation?.populate, [child]: acc[child] },
            filters: alreadyPopulatedRelation?.filters,
            sort: alreadyPopulatedRelation?.sort,
          }
          delete acc[child]
        }

        if (index === array.length - 1) {
          this.populateFields = mergeDeep(this.populateFields, acc)
        }

        return acc
      },
      { ...this.populateFields },
    )
    return this
  }

  where(field: string, filters: StrapiFilter): SelectQueryBuilder<T> {
    const fieldsToFilter = field.split('.').reverse()
    fieldsToFilter.reduce(
      (acc, curr, index, array) => {
        if (index === 0) {
          // If it's the last field in the chain, just append the filters
          acc[curr] = { ...filters }
        } else {
          // If it's not the last field in the chain, append the child field and the previous fields
          const child = array[index - 1]
          acc[curr] = { [child]: acc[child] }
          delete acc[child]
        }

        if (index === array.length - 1) {
          this.whereFields = mergeDeep(this.whereFields, acc)
        }

        return acc
      },
      { ...this.whereFields },
    )
    return this
  }

  async getOne<T extends ObjectType>(): Promise<InstanceType<T>> {
    const response = await this.execute()

    return response[0]
  }

  async getMany<T extends ObjectType>(): Promise<InstanceType<T>[]> {
    return this.execute()
  }

  async execute<T extends ObjectType>(): Promise<InstanceType<T>> {
    const params = {
      fields: this.selectFields,
      populate: this.populateFields,
      filters: this.whereFields,
    }

    return this.executeCallback<InstanceType<T>>(this.path, params)
  }
}
