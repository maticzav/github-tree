import * as fs from 'fs'
import * as path from 'path'
import { mapKeys } from './utils'
import { Tree, utf8 } from './tree'

/**
 * Loads a tree of utf-8 decoded files at paths.
 *
 * @param path
 */
export function loadTreeFromPath(
  root: string,
  ignore: (string | RegExp)[],
): Tree {
  const filePaths = fs.readdirSync(root, { encoding: 'utf-8' })
  const tree = filePaths
    .filter(filePath => !ignore.some(glob => RegExp(glob).test(filePath)))
    .flatMap(filePath => {
      /**
       * Calculates the absolute file path from infomation about where the root is.
       */
      const rootFilePath = path.resolve(root, filePath)
      if (fs.lstatSync(rootFilePath).isDirectory()) {
        return Object.entries(
          mapKeys(loadTreeFromPath(rootFilePath, ignore), key =>
            unshift(filePath, key),
          ),
        )
      } else {
        const file = utf8(fs.readFileSync(rootFilePath, { encoding: 'utf-8' }))
        return [[filePath, file]]
      }
    })

  return Object.fromEntries(tree)
}

/**
 * Adds a folder to the path.
 * @param pre
 * @param path
 */
function unshift(pre: string, path: string): string {
  return [pre, ...path.split('/').filter(Boolean)].join('/')
}
