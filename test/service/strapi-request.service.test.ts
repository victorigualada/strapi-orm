import { StrapiRequestService } from '../../src/service/strapi-request.service'
import { ConnectionConfig, HttpMethods } from '../../src/types'

const setFetchMock = (json: unknown, ok: boolean = true, text?: string): void => {
  global.fetch = jest.fn().mockImplementation((_input: RequestInfo | URL, _init?: RequestInit | undefined) => {
    return Promise.resolve({
      ok,
      json: () => json,
      text: () => text || (JSON.stringify(json) as unknown as Promise<string>),
    } as Response)
  })
}

describe('StrapiRequestService', () => {
  let service: StrapiRequestService

  beforeAll(() => {
    const config: ConnectionConfig = { baseUrl: 'https://example.com', accessToken: 'token', entities: '' }
    service = new StrapiRequestService(config)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('interface high level functions', () => {
    it('service#get should make request successfully', async () => {
      // arrange
      const expectedResponse = { data: 'response' }
      setFetchMock(expectedResponse)

      // act
      const result = await service.get('/path')

      // assert
      expect(result).toEqual(expectedResponse)
      expect(fetch).toHaveBeenCalledWith(new URL('https://example.com/path?'), {
        method: HttpMethods.GET,
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
        }),
      })
    })

    it('service#post should make request successfully', async () => {
      // arrange
      const requestBody = { key: 'value' }
      const expectedResponse = { data: 'response' }
      setFetchMock(expectedResponse)

      // act
      const result = await service.post('/path', requestBody)

      // assert
      expect(result).toEqual(expectedResponse)
      expect(fetch).toHaveBeenCalledWith(new URL('https://example.com/path?'), {
        method: HttpMethods.POST,
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
        }),
        body: JSON.stringify(requestBody),
      })
    })

    it('service#put should make request successfully', async () => {
      // arrange
      const requestBody = { key: 'value' }
      const expectedResponse = { data: 'response' }
      setFetchMock(expectedResponse)

      // act
      const result = await service.put('/path', requestBody)

      // assert
      expect(result).toEqual(expectedResponse)
      expect(fetch).toHaveBeenCalledWith(new URL('https://example.com/path?'), {
        method: HttpMethods.PUT,
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
        }),
        body: JSON.stringify(requestBody),
      })
    })
  })

  describe('service#request', () => {
    it.each`
      method              | requestData         | expectedResponse
      ${HttpMethods.GET}  | ${undefined}        | ${{ data: 'response' }}
      ${HttpMethods.POST} | ${{ key: 'value' }} | ${{ key: 'value' }}
      ${HttpMethods.PUT}  | ${{ key: 'value' }} | ${{ key: 'value' }}
    `('should make a $method request successfully', async ({ method, requestData, expectedResponse }) => {
      // arrange
      setFetchMock(expectedResponse)

      // act
      const result = await service.request('/path', { method, body: requestData })

      // assert
      expect(result).toEqual(expectedResponse)
      expect(fetch).toHaveBeenCalledWith(new URL('https://example.com/path?'), {
        method,
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
        }),
        body: JSON.stringify(requestData),
      })
    })

    it('should handle error in a request', async () => {
      // arrange
      const expectedResponse = { error: 'Not Found' }
      setFetchMock(expectedResponse, false)

      // act
      // assert
      await expect(service.request('/non-existent', { method: HttpMethods.GET })).rejects.toThrow('Not Found')
    })

    it('should handle error parsing response', async () => {
      // arrange
      const invalidJsonResponse = 'invalid-json'
      setFetchMock(invalidJsonResponse, true, invalidJsonResponse)

      // act
      // assert
      await expect(
        service.request('/path', {
          method: HttpMethods.GET,
        }),
      ).rejects.toThrow('invalid-json')
    })
  })

  describe('flattening', () => {
    let service: StrapiRequestService

    beforeAll(() => {
      const config: ConnectionConfig = {
        baseUrl: 'https://example.com',
        accessToken: 'token',
        entities: '',
        flatten: true,
      }
      service = new StrapiRequestService(config)
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should flatten an object', async () => {
      // arrange
      const fetchResponse = {
        data: [
          {
            id: '123',
            attributes: {
              name: 'John',
              age: 30,
            },
          },
          {
            id: '456',
            attributes: {
              name: 'Jane',
              age: 25,
            },
          },
        ],
      }
      setFetchMock(fetchResponse)

      // act
      const result = await service.request('/path', { method: HttpMethods.GET })

      // assert
      expect(result).toEqual([
        { id: '123', name: 'John', age: 30 },
        { id: '456', name: 'Jane', age: 25 },
      ])
    })
  })
})
