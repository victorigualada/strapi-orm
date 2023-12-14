import { Manager } from '../src'

import { TestEntity } from './mock/test.entity'

describe('test', () => {
  test('test', async () => {
    const manager = new Manager({
      baseUrl: 'http://localhost:1337/api',
      accessToken:
        '5f121e999d2d9ea8d9811c5b905d15faabf5fa1818d98629ee7b244c2e18d1adffc2b4d76f823fd38fb95f31f961a941e4ce1ac2df836fa42b6bd48be9d71ca3264e4b944100a70376bc44a26e3c573b1ba10178ada6cd3434c72f57acfe731c94864130e161391215832f2a9d05dccddff58d3f3c358e9785f751a875fb708e',
      flatten: false,
    })

    const respository = manager.getRepository(TestEntity)

    const users = await respository
      .createQueryBuilder()
      .select(['*'])
      .populate('asd')
      .populate('clinicianData.photography')
      .getMany()

    console.log(users[0].clinicianData)
  })
})
