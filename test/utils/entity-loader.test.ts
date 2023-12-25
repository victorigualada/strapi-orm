// src/importClasses.test.ts
import path from 'path'

import { importClassesFromDirectories } from '../../src/utils/entity-loader'

describe('importClassesFromDirectories', () => {
  it('should load classes from directories', async () => {
    const directories = [path.join(__dirname, '..', '**', '*.entity.ts')]
    const [classes, files] = await importClassesFromDirectories(directories)

    expect(classes).toHaveLength(1)
    expect(files).toHaveLength(1)
  })

  it('should handle empty directories', async () => {
    const directories: string[] = []
    const [classes, files] = await importClassesFromDirectories(directories)

    expect(classes).toHaveLength(0)
    expect(files).toHaveLength(0)
  })

  it('should handle non-existent directories', async () => {
    const nonExistentDirectory = path.join(__dirname, 'non-existent-directory')
    const [classes, files] = await importClassesFromDirectories([nonExistentDirectory])

    expect(classes).toHaveLength(0)
    expect(files).toHaveLength(0)
  })

  it('should handle directories with no matching files', async () => {
    const emptyDirectory = path.join(__dirname, 'empty-directory')
    const [classes, files] = await importClassesFromDirectories([emptyDirectory])

    expect(classes).toHaveLength(0)
    expect(files).toHaveLength(0)
  })

  // You can add more test cases as needed
})
