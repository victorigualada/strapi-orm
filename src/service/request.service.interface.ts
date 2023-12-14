import { ConnectionConfig, HttpMethods, RequestOptions } from '../types'

export abstract class RequestServiceInterface {
  protected constructor(protected readonly config: ConnectionConfig) {}

  protected abstract getAuthHeaders(): Record<string, string>
  protected abstract handleResponse<T>(jsonResponse: unknown): Promise<T>
  protected abstract request<T>(path: string, requestOptions: RequestOptions): Promise<T>

  async get<T>(path: string, query?: object): Promise<T> {
    const options: RequestOptions = {
      method: HttpMethods.GET,
      query,
    }
    return this.request<T>(path, options)
  }

  async post<T>(path: string, body?: unknown, query?: object): Promise<T> {
    const options: RequestOptions = {
      method: HttpMethods.POST,
      body,
      query,
    }
    return this.request<T>(path, options)
  }

  async put<T>(path: string, body?: unknown, query?: object): Promise<T> {
    const options: RequestOptions = {
      method: HttpMethods.PUT,
      body,
      query,
    }
    return this.request<T>(path, options)
  }

  protected flattenArray(obj) {
    return obj.map(e => this.flatten(e))
  }

  protected flattenData(obj) {
    return this.flatten(obj.data)
  }

  protected flattenAttrs(obj) {
    const attrs = {}
    for (const key in obj.attributes) {
      attrs[key] = this.flatten(obj.attributes[key])
    }
    return {
      id: obj.id,
      ...attrs,
    }
  }

  protected flatten(obj) {
    if (Array.isArray(obj)) {
      return this.flattenArray(obj)
    }
    if (obj && obj.data) {
      return this.flattenData(obj)
    }
    if (obj && obj.attributes) {
      return this.flattenAttrs(obj)
    }
    return obj
  }
}
