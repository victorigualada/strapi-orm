import { stringify } from 'qs'

import { ConnectionConfig, RequestOptions } from '../types'

import { RequestServiceInterface } from './request.service.interface'

export class RequestService extends RequestServiceInterface {
  constructor(config: ConnectionConfig) {
    super(config)
  }

  async request<T>(path: string, requestOptions: RequestOptions): Promise<T> {
    const { method, body, query, headers } = requestOptions
    const stringQuery = query ? stringify(query, { encodeValuesOnly: true }) : ''

    const response = await fetch(`${this.config.baseUrl}/${path}?${stringQuery}`, {
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

  handleResponse<T>(jsonResponse: unknown): Promise<T> {
    return this.config.flatten ? this.flatten(jsonResponse) : jsonResponse
  }
}
