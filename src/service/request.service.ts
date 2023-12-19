import { ConnectionConfig, HttpMethods, RequestOptions } from '../types'

export abstract class RequestService {
  protected constructor(protected readonly config: ConnectionConfig) {}

  protected abstract getAuthHeaders(): Record<string, string>
  protected abstract handleResponse<Entity>(jsonResponse: unknown): Promise<Entity>
  protected abstract request<Entity>(path: string, requestOptions: RequestOptions): Promise<Entity>

  async get<Entity>(path: string, query?: object): Promise<Entity> {
    const options: RequestOptions = {
      method: HttpMethods.GET,
      query,
    }
    return this.request<Entity>(path, options)
  }

  async post<Entity>(path: string, body?: unknown, query?: object): Promise<Entity> {
    const options: RequestOptions = {
      method: HttpMethods.POST,
      body,
      query,
    }
    return this.request<Entity>(path, options)
  }

  async put<Entity>(path: string, body?: unknown, query?: object): Promise<Entity> {
    const options: RequestOptions = {
      method: HttpMethods.PUT,
      body,
      query,
    }
    return this.request<Entity>(path, options)
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
