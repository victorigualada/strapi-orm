import { Manager, MetadataOptions } from '../manager/manager'
import { ObjectType } from '../types'
import { FieldType } from '../types/field.type'

export type FieldOptions = {
  type: FieldType
  fieldName?: string
  required?: boolean
  unique?: boolean
  default?: unknown
  enum?: InstanceType<ObjectType>
}

export function Field(): PropertyDecorator

export function Field(type: FieldType): PropertyDecorator

export function Field(options: FieldOptions): PropertyDecorator

export function Field(typeOrOptions?: FieldType | FieldOptions): PropertyDecorator {
  let options: FieldOptions

  if (typeof typeOrOptions === 'string') {
    options = { type: typeOrOptions }
  } else if (!typeOrOptions) {
    options = {} as FieldOptions
  } else {
    options = typeOrOptions
  }

  return (target: InstanceType<ObjectType>, propertyName: string) => {
    const existingMetadata = Manager.getEntityMetadata(target.constructor)

    if (existingMetadata) {
      existingMetadata.fields[propertyName] = options
      return Manager.setEntityMetadata(target.constructor, existingMetadata)
    }

    return Manager.setEntityMetadata(target.constructor, { fields: { [propertyName]: options } } as MetadataOptions)
  }
}
