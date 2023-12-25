import { StrapiQuery } from '../types'

export function isObjectOrArray(item) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

export function mergeDeep(target, source) {
  const output = Object.assign({}, target)
  if (isObjectOrArray(target) && isObjectOrArray(source)) {
    Object.keys(source).forEach(key => {
      if (isObjectOrArray(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] })
        else output[key] = mergeDeep(target[key], source[key])
      } else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }
  return output
}

export function resolvePopulatedRelation(array: string[], obj: StrapiQuery): StrapiQuery {
  const path = [...array]
    .reverse()
    .slice(0, array.length - 1)
    .join('.')
  return path.split('.').reduce(function (prev, curr) {
    return prev[curr] || prev.populate[curr]
  }, obj)
}

export function isObject(val: unknown): val is NonNullable<unknown> {
  return val !== null && typeof val === 'object'
}
