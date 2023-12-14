import { StrapiFilter } from './filter.type'
import { StrapiPopulate } from './populate.types'
import { StrapiSort } from './sort.type'

export type StrapiQuery = {
  fields?: string | string[]
  populate?: Record<string, StrapiPopulate>
  filters?: Record<string, StrapiFilter>
  sort?: Record<string, StrapiSort>
}
