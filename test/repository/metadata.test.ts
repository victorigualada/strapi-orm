import { Manager, StrapiRepository } from '../../src'
import { ConnectionConfig } from '../../src/types'
import { TestEntity } from '../mock/test.entity'

jest.mock('../../src/repository/strapi.repository')

describe('StrapiRepository', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  test('is constructed with entity metadata', () => {
    // arrange
    const expectedEntityOptions = {
      path: 'test',
      plugin: 'my-plugin',
      uid: 'plugin::my-plugin.test',
    }
    const manager = new Manager({} as ConnectionConfig)

    // act
    const repository = manager.getRepository(TestEntity)

    // assert
    expect(repository).toBeDefined()
    expect(StrapiRepository).toHaveBeenCalledWith(expectedEntityOptions, expect.anything())

    // We clear the StrapiRepository mock so that we can test the public interface
    jest.unmock('../../src/repository/strapi.repository')
  })
})
