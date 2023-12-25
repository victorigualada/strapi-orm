/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectType } from '../types'

export type DynamicZoneOptions = {
  components: ObjectType[]
}

export function DynamicZone(options: DynamicZoneOptions): PropertyDecorator {
  return (target: InstanceType<ObjectType>, propertyName: string) => {}
}
