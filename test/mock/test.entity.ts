import { Field, StrapiEntity } from '../../src'

@StrapiEntity({
  path: 'test',
  plugin: 'my-plugin',
})
export class TestEntity {
  @Field({ type: 'number' })
  id: number

  createdAt: Date
}
