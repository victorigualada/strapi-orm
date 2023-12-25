import { stringify } from 'qs'

import { ConnectionConfig, RequestOptions } from '../types'

import { RequestService } from './request.service'

export class StrapiRequestService extends RequestService {
  constructor(config: ConnectionConfig) {
    super(config)
  }

  async request<Entity>(path: string, requestOptions: RequestOptions): Promise<Entity> {
    const { method, body, query, headers } = requestOptions
    const stringQuery = query ? stringify(query, { encodeValuesOnly: true }) : ''

    const url = `${this.config.baseUrl}/${path}?${stringQuery}`.replace(/([^:]\/)\/+/g, '$1')

    const response = await fetch(new URL(url), {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...headers,
      },
    })

    const text = await response.text()

    try {
      const json = JSON.parse(text)

      if (!response.ok) {
        throw new Error(json.error || json.message)
      }

      return this.handleResponse(json)
    } catch (error) {
      throw new Error(text)
    }
  }

  getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.accessToken}`,
    }
  }

  handleResponse<Entity>(jsonResponse: unknown): Promise<Entity> {
    return this.config.flatten ? this.flatten(jsonResponse) : jsonResponse
  }
}
