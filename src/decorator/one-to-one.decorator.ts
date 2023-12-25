/* eslint-disable @typescript-eslint/no-unused-vars */

import { ObjectType } from '../types'

import { PropertyCb } from './many-to-many.decorator'

export function OneToOne(propertyCb: PropertyCb): PropertyDecorator {
  return (target: InstanceType<ObjectType>, propertyName: string) => {}
}
