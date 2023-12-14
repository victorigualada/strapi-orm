export enum HttpMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export type RequestOptions<> = {
  body?: unknown
  headers?: Record<string, string>
  method?: HttpMethods
  query?: object
}

export type ConnectionConfig = {
  baseUrl: string
  accessToken: string
  flatten?: boolean
}
