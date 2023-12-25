export type StrapiType =
  | 'string'
  | 'text'
  | 'richtext'
  | 'email'
  | 'password'
  | 'integer'
  | 'biginteger'
  | 'decimal'
  | 'float'
  | 'number'
  | 'date'
  | 'datetime'
  | 'media'
  | 'json'
  | 'boolean'
  | 'enumeration'
  | 'uid'
  | 'component'
  | 'relation'
  | 'dynamiczone'

export type StrapiAttribute = {
  type: StrapiType
  minLength?: number
  unique?: boolean
  configurable?: boolean
  required?: boolean
  default?: unknown
  enum?: string[]
  relation?: string
  target?: string
  inversedBy?: string
  private?: boolean
  repeatable?: boolean
  component?: string
  components?: string[]
  mappedBy?: string
  targetAttribute?: string
  displayName?: string
  customField?: string
}

export type StrapiSchema = {
  uid: string
  plugin?: string // Content-Types might have a plugin
  category?: string // Components will have a category
  apiId?: string // Components will have a 'apiId' instead of 'apiID'
  apiID: string
  schema: {
    draftAndPublish?: boolean
    displayName?: string
    singularName?: string
    pluralName?: string
    description?: string
    kind?: string
    collectionName?: string
    attributes: {
      [propertyName: string]: StrapiAttribute
    }
    visible?: boolean
  }
}
