import { Manager, StrapiRepository } from '../../src'
import { RepositoryManager } from '../../src/manager/repository-manager'
import { StrapiRequestService } from '../../src/service/strapi-request.service'
import { ConnectionConfig, ObjectType, StrapiQuery } from '../../src/types'
import { TestEntity } from '../mock/test.entity'

jest.mock('../../src/service/request.service')

describe('public interface', () => {
  let repository: StrapiRepository<TestEntity>

  beforeEach(() => {
    /*
      We can't hold a reference to the mocked RequestService so we need to instantiate a new Manager and clear the
      repositories map before each test.
      https://jestjs.io/docs/es6-class-mocks#calling-jestmock-with-the-module-factory-parameter
     */
    const manager = new Manager({} as ConnectionConfig)
    RepositoryManager['repositories'] = new Map<string, StrapiRepository<InstanceType<ObjectType>>>()

    repository = manager.getRepository(TestEntity)
  })

  test('StrapiRepository#find calls RequestService#get', async () => {
    // arrange
    // act
    await repository.find()

    // assert
    const requestServiceInstance = (StrapiRequestService as jest.Mock).mock.instances[0]
    expect(requestServiceInstance.get).toHaveBeenCalled()
  })

  test('StrapiRepository#findBy calls RequestService#get with url and query filter', async () => {
    // arrange
    const query: StrapiQuery = { fields: ['*'], filters: { id: { $eq: 2 } }, populate: {} }

    // act
    await repository.findBy({ id: 2 })

    // assert
    const requestServiceInstance = (StrapiRequestService as jest.Mock).mock.instances[0]
    expect(requestServiceInstance.get).toHaveBeenCalledWith(`test`, query)
  })

  test('StrapiRepository#findById calls RequestService#get with url', async () => {
    // arrange
    const id = 1

    // act
    await repository.findOneById(id)

    // assert
    const requestServiceInstance = (StrapiRequestService as jest.Mock).mock.instances[0]
    expect(requestServiceInstance.get).toHaveBeenCalledWith(`test/${id}`)
  })

  test('StrapiRepository#findOneBy calls RequestService#get with url and query filter', async () => {
    // arrange
    const query: StrapiQuery = { fields: ['*'], filters: { id: { $eq: 1 } }, populate: {} }

    // act
    await repository.findOneBy({ id: 1 })

    // assert
    const requestServiceInstance = (StrapiRequestService as jest.Mock).mock.instances[0]
    expect(requestServiceInstance.get).toHaveBeenCalledWith(`test`, query)
  })

  test('StrapiRepository#create calls RequestService#post with entity', async () => {
    // arrange
    const testEntity: TestEntity = { id: 1, createdAt: new Date() }

    // act
    await repository.create(testEntity)

    // assert
    const requestServiceInstance = (StrapiRequestService as jest.Mock).mock.instances[0]
    expect(requestServiceInstance.post).toHaveBeenCalledWith(`test`, testEntity)
  })

  test('StrapiRepository#update calls RequestService#put with partial entity', async () => {
    // arrange
    const id = 1
    const testEntity: Partial<TestEntity> = { createdAt: new Date() }

    // act
    await repository.update(id, testEntity)

    // assert
    const requestServiceInstance = (StrapiRequestService as jest.Mock).mock.instances[0]
    expect(requestServiceInstance.put).toHaveBeenCalledWith(`test/${id}`, testEntity)
  })
})
