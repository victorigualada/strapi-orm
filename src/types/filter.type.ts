export type StrapiFilter = {
  $eq?: string | number | boolean
  $ne?: string | number | boolean
  $in?: string[] | number[]
  $nin?: string[] | number[]
  $lt?: string | number
  $lte?: string | number
  $gt?: string | number
  $gte?: string | number
}
