import { Manager } from '../manager/manager'

export class SchemaValidator {
  static validate(schemaEntities: Function[], contentTypes) {
    schemaEntities.forEach(entity => {
      const entityMetadata = Manager.getEntityMetadata(entity)
      const contentType = contentTypes.find(ct => ct.uid === entityMetadata.options.uid)

      if (!contentType) {
        throw new Error(`Content type ${entityMetadata.options.uid} not found.`)
      }

      if (contentType) {
        const contentTypeFields = contentType.schema.attributes
        const contentTypeFieldNames = Object.getOwnPropertyNames(contentTypeFields)

        Object.keys(entityMetadata.fields).forEach(field => {
          if (!contentTypeFieldNames.includes(field)) {
            throw new Error(
              `In entity ${entity.name}, field '${field}' does not exist in content type ${entityMetadata.options.uid}.`,
            )
          }
          if (entityMetadata.fields[field].type !== contentTypeFields[field].type) {
            throw new Error(
              `In entity ${entity.name}, field '${field}: ${entityMetadata.fields[field].type}' mismatches '${contentTypeFields[field].type}' type defined for content type ${entityMetadata.options.uid}.`,
            )
          }
        })
      }
    })
  }
}
