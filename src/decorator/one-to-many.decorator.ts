/* eslint-disable @typescript-eslint/no-unused-vars */

import { ObjectType } from '../types'

import { InverseSidePropertyCb, PropertyCb } from './many-to-many.decorator'

export function OneToMany(propertyCb: PropertyCb, inverseSideCb?: InverseSidePropertyCb): PropertyDecorator {
  return (target: InstanceType<ObjectType>, propertyName: string) => {}
}
