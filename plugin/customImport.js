import { readFileSync } from 'fs'

import { newlinePattern, importPattern } from './constants'

export function getFilepaths(src, relFile, resolve) {
  return src.split(newlinePattern).reduce(
    (acc, line) => {
      const matches = importPattern.exec(line)
      if (matches) {
        const [, importPath] = matches
        acc.push(resolve(importPath, relFile))
      }
      return acc
    },
    []
  )
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
