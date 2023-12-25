import { Manager, MetadataOptions } from '../manager/manager'
import { ObjectType } from '../types'

export type StrapiComponentOptions = {
  uid: string
  path?: string
  category?: string
}

export function StrapiComponent(): ClassDecorator

export function StrapiComponent(path: string): ClassDecorator

export function StrapiComponent(options: StrapiComponentOptions): ClassDecorator

export function StrapiComponent(pathOrOptions?: string | StrapiComponentOptions): ClassDecorator {
  let options: StrapiComponentOptions

  if (typeof pathOrOptions === 'string') {
    const [category, path] = pathOrOptions.split('.')
    options = {
      uid: pathOrOptions,
      path,
      category,
    }
  } else {
    options = pathOrOptions

    if (!pathOrOptions.path) {
      const [category, path] = pathOrOptions.uid.split('.')
      options.path = path
      options.category = category
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
