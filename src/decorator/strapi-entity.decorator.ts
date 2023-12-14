import { Manager } from '../manager/manager'
import { ObjectType } from '../types'

export type StrapiEntityOptions = {
  path: string
}

export function StrapiEntity(path: string): ClassDecorator

export function StrapiEntity(options: StrapiEntityOptions): ClassDecorator

export function StrapiEntity(pathOrOptions?: string | StrapiEntityOptions): ClassDecorator {
  let options = pathOrOptions

  if (typeof pathOrOptions === 'string') {
    options = { path: pathOrOptions }
  }

  return (target: InstanceType<ObjectType>) => {
    return Manager.setEntityMetadata(target, options as StrapiEntityOptions)
  }
}
