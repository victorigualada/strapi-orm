export enum AttributeType {
  String = 'string',
  Text = 'text',
  RichText = 'richtext',
  Email = 'email',
  Password = 'password',
  Integer = 'integer',
  BigInteger = 'biginteger',
  Decimal = 'decimal',
  Float = 'float',
  Number = 'number',
  Date = 'date',
  DateTime = 'datetime',
  Media = 'media',
  Json = 'json',
  Boolean = 'boolean',
  Enumeration = 'enumeration',
  UID = 'uid',
  Component = 'component',
  Relation = 'relation',
  DynamicZone = 'dynamiczone',
}

export enum RelationType {
  OneToOne = 'oneToOne',
  OneToMany = 'oneToMany',
  ManyToOne = 'manyToOne',
  ManyToMany = 'manyToMany',
}

export type StrapiAttribute = {
  type: AttributeType
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
