/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */
import path from 'path'

import { globSync } from 'glob'

import { isObject } from './objects'

/**
 * Loads all exported classes from the given directory.
 */
export async function importClassesFromDirectories(
  //logger: Logger,
  directories: string[],
  formats = ['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts'],
): Promise<[Function[], string[]]> {
  const logger = console
  const logLevel = 'info'
  const classesNotFoundMessage = 'No classes were found using the provided glob pattern: '
  const classesFoundMessage = 'All classes found using provided glob pattern'

  function loadFileClasses(exported: any, allLoaded: Function[]) {
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
    return allDirs.concat(globSync(normalPath))
  }, [] as string[])

  if (directories.length > 0 && allFiles.length === 0) {
    logger.log(logLevel, `${classesNotFoundMessage} "${directories}"`)
  } else if (allFiles.length > 0) {
    logger.log(logLevel, `${classesFoundMessage} "${directories}" : "${allFiles}"`)
  }
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
