import { ObjectType } from './object.types'

export type SelectExecuteCallback = <Entity extends ObjectType>(
  path: string,
  params: object,
) => Promise<InstanceType<Entity>>
