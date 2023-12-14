import { Manager, StrapiRepository } from '../../src'
import { RequestService } from '../../src/service/request.service'
import { ConnectionConfig } from '../../src/types/request.types'
import { TestEntity } from '../mock/test.entity'

jest.mock('../../src/service/request.service')

describe('public interface', () => {
  let repository: StrapiRepository<TestEntity>

  beforeEach(() => {
    const manager = new Manager({} as ConnectionConfig)
    repository = manager.getRepository(TestEntity)
  })

  test('StrapiRepository#find calls RequestService#get', async () => {
    // arrange
    // act
    await repository.find()

    // assert
    const requestServiceInstance = (RequestService as jest.Mock).mock.instances[0]
    expect(requestServiceInstance.get).toHaveBeenCalled()
  })

  test('StrapiRepository#findById calls RequestService#get with url', async () => {
    // arrange
    const id = 1

    // act
    await repository.findById(id)

    // assert
    const requestServiceInstance = (RequestService as jest.Mock).mock.instances[0]
    expect(requestServiceInstance.get).toHaveBeenCalledWith(`test/${id}`)
  })

  test('StrapiRepository#create calls RequestService#post with entity', async () => {
    // arrange
    const testEntity: TestEntity = { id: 1, createdAt: new Date() }

    // act
    await repository.create(testEntity)

    // assert
    const requestServiceInstance = (RequestService as jest.Mock).mock.instances[0]
    expect(requestServiceInstance.post).toHaveBeenCalledWith(`test`, testEntity)
  })

  test('StrapiRepository#update calls RequestService#put with partial entity', async () => {
    // arrange
    const id = 1
    const testEntity: Partial<TestEntity> = { createdAt: new Date() }

    // act
    await repository.update(id, testEntity)

    // assert
    const requestServiceInstance = (RequestService as jest.Mock).mock.instances[0]
    expect(requestServiceInstance.put).toHaveBeenCalledWith(`test/${id}`, testEntity)
  })
})
