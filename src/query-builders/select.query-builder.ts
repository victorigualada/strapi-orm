import { FindOptionsWhere, ObjectType, SelectExecuteCallback, StrapiFilter, StrapiQuery, StrapiSort } from '../types'
import { mergeDeep, resolvePopulatedRelation } from '../utils/objects'

export class SelectQueryBuilder<Entity> {
  private readonly selectFields: string[] = []
  private populateFields: Record<string, StrapiQuery> = {}
  private whereFields: Record<string, StrapiFilter> = {}

  constructor(
    private readonly path: string,
    private readonly executeCallback: SelectExecuteCallback,
    fields: string | string[] = '*',
  ) {
    this.selectFields = this.selectFields.concat(fields)
  }

  static create<Entity>(
    path: string,
    execute: SelectExecuteCallback,
    fields: string | string[],
  ): SelectQueryBuilder<Entity> {
    return new SelectQueryBuilder<Entity>(path, execute, fields)
  }

  populate(
    field: string,
    childFields: string | string[] = '*',
    filters?: Record<string, StrapiFilter>,
    sort?: Record<string, StrapiSort>,
  ): SelectQueryBuilder<Entity> {
    const fieldsToPopulate = field.toString().split('.').reverse()

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

  where(field: string, filters: StrapiFilter): SelectQueryBuilder<Entity> {
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

  async getOne<Entity extends ObjectType>(): Promise<InstanceType<Entity>> {
    const response = await this.execute()

    return response ? response[0] : null
  }

  async getMany<Entity extends ObjectType>(): Promise<InstanceType<Entity>[]> {
    return this.execute()
  }

  async execute<Entity extends ObjectType>(): Promise<InstanceType<Entity>> {
    const params = {
      fields: this.selectFields,
      populate: this.populateFields,
      filters: this.whereFields,
    }

    return this.executeCallback<InstanceType<Entity>>(this.path, params)
  }

  setFindOptions<Entity extends ObjectType>(where: FindOptionsWhere<Entity>): SelectQueryBuilder<Entity> {
    Object.keys(where).forEach(key => {
      this.where(key, { $eq: where[key] })
    })
    return this
  }
}
