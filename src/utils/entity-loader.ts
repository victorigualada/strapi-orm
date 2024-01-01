import path from 'path'

import { glob } from 'glob'

import { isObject } from './objects'

/**
 * Loads all exported classes from the given directory.
 */
export async function importClassesFromDirectories(
  directories: string[],
  formats = ['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts'],
): Promise<[Function[], string[]]> {
  function loadFileClasses(exported: Function | Array<unknown> | Object, allLoaded: Function[]) {
    if (typeof exported === 'function') {
      allLoaded.push(exported)
    } else if (Array.isArray(exported)) {
      exported.forEach((i: unknown) => loadFileClasses(i, allLoaded))
    } else if (isObject(exported)) {
      Object.keys(exported).forEach(key => loadFileClasses(exported[key], allLoaded))
    }
    return allLoaded
  }

  const allFiles = directories.reduce((allDirs, dir) => {
    const normalPath = path.normalize(dir)
    return allDirs.concat(glob.sync(normalPath))
  }, [] as string[])

  const dirPromises = allFiles
    .filter(file => {
      const dtsExtension = file.substring(file.length - 5, file.length)
      return formats.indexOf(path.extname(file)) !== -1 && dtsExtension !== '.d.ts'
    })
    .map(async file => {
      return require(path.resolve(file))
    })

  const dirs = await Promise.all(dirPromises)

  return [loadFileClasses(dirs, []), allFiles]
}
