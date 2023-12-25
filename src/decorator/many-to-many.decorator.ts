/* eslint-disable @typescript-eslint/no-unused-vars */

import { ObjectType } from '../types'

export type PropertyCb = () => ObjectType
export type InverseSidePropertyCb = (type: InstanceType<ObjectType>) => InstanceType<ObjectType>

export function ManyToMany(propertyCb: PropertyCb, inverseSideCb?: InverseSidePropertyCb): PropertyDecorator {
  return (target: InstanceType<ObjectType>, propertyName: string) => {}
}
