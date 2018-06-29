import { readFileSync } from 'fs'

import { newlinePattern } from './constants'

export function getFilepaths(src, relFile, resolve) {
  const imports = src.split(newlinePattern).filter(line => line.startsWith('#import'))
  return imports.map(statement => {
    const importPath = statement.split(/[\s\n]+/g)[1].slice(1, -1)
    return resolve(importPath, relFile)
  })
}

export function getSources(filepath, resolve, acc = []) {
  const importSrc = readFileSync(filepath.replace(/'/g, '')).toString()
  const nestedPaths = getFilepaths(importSrc, filepath, resolve)
  const srcs =
    nestedPaths.length > 0
      ? [
          ...nestedPaths.reduce((srcArr, fp) => [...srcArr, ...getSources(fp, resolve, [])], []),
          importSrc
        ]
      : [importSrc]
  return [...srcs, ...acc]
}
