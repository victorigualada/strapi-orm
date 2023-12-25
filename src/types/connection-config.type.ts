export type ConnectionConfig = {
  baseUrl: string
  accessToken: string
  flatten?: boolean
  validateSchema?: boolean
  synchronize?: boolean
  entities: string | string[]
}
