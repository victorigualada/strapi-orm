import { StrapiEntity } from '../../src'

@StrapiEntity('test')
export class TestEntity {
  id: number
  createdAt: Date
}
