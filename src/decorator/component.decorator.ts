/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectType } from '../types'

export type ComponentOptions = {
  repeatable?: boolean
}

export function Component(component: string, options: ComponentOptions): PropertyDecorator {
  return (target: InstanceType<ObjectType>, propertyName: string) => {}
}
