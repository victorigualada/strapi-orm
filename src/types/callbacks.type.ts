import { ObjectType } from './object.types'

export type SelectExecuteCallback = <T extends ObjectType>(path: string, params: object) => Promise<InstanceType<T>>
