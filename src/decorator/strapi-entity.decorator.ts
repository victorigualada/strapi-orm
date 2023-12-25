import { Manager, MetadataOptions } from '../manager/manager'
import { ObjectType } from '../types'

export type StrapiEntityOptions = {
  path: string
  uid?: string
  plugin?: string
}

export function StrapiEntity(path: string): ClassDecorator

export function StrapiEntity(options: StrapiEntityOptions): ClassDecorator

export function StrapiEntity(pathOrOptions?: string | StrapiEntityOptions): ClassDecorator {
  let options: StrapiEntityOptions

  if (typeof pathOrOptions === 'string') {
    options = {
      path: pathOrOptions,
      uid: `api::${pathOrOptions}.${pathOrOptions}`,
    }
  } else {
    options = pathOrOptions

    if (pathOrOptions.plugin) {
      options.uid = options.uid || `plugin::${pathOrOptions.plugin}.${pathOrOptions.path}`
    }
  }

  return (target: InstanceType<ObjectType>) => {
    const existingMetadata = Manager.getEntityMetadata(target)

    if (existingMetadata) {
      existingMetadata.options = options
      return Manager.setEntityMetadata(target, existingMetadata)
    }
    return Manager.setEntityMetadata(target, { options } as MetadataOptions)
  }
}
