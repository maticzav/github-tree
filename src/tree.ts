import * as path from 'path'

import { Dict, not, mapEntriesAsync, mapKeys } from './utils'

/**
 * Represents a Github file/folder structure.
 */
export type Tree = { [path: string]: File }

export type File = { content: string; encoding: 'utf-8' | 'base64' }

/* Accessors, Getters, Helpers */

/**
 * Returns the content of a file.
 * @param file
 */
export function content(file: File): string {
  return file.content
}

/**
 * Returns the encoding of a file.
 * @param file
 */
export function encoding(file: File): File['encoding'] {
  return file.encoding
}

/**
 * Lets you map files asynchornously.
 *
 * @param tree
 * @param fn
 */
export async function mapFiles(
  tree: Tree,
  fn: (file: File, path: string) => Promise<File>,
): Promise<Tree> {
  /* istanbul ignore next */
  return mapEntriesAsync(tree, fn)
}

/**
 * Lets you manipulate file paths.
 *
 * @param tree
 * @param fn
 */
export function mapPaths(
  tree: Tree,
  fn: (path: string, file: File) => string,
): Tree {
  /* istanbul ignore next */
  return mapKeys(tree, fn)
}

/**
 * Creates an utf-8 encoded file.
 *
 * @param content
 */
export function utf8(content: string): File {
  return { content, encoding: 'utf-8' }
}

/**
 * Creates a base64 encoded file.
 *
 * @param content
 */
export function base64(content: string): File {
  return { content, encoding: 'base64' }
}

/**
 * Returns the files that are not nested.
 * @param tree
 */
export function getTreeFiles(tree: Tree): Dict<File> {
  return Object.fromEntries(
    Object.keys(tree)
      .filter(isFileInThisFolder)
      .map(name => [name, tree[name]]),
  )
}

/**
 * Returns a dictionary of remaining subtrees.
 * @param tree
 */
export function getTreeSubTrees(tree: Tree): Dict<Tree> {
  return Object.keys(tree)
    .filter(not(isFileInThisFolder))
    .reduce<Dict<Tree>>((acc, filepath) => {
      const [subTree, newFilepath] = shiftPath(filepath)
      if (!acc.hasOwnProperty(subTree)) {
        acc[subTree] = {}
      }
      acc[subTree][newFilepath] = tree[filepath]
      return acc
    }, {})
}

/**
 * Shifts path by one.
 * Returns the shifted part as first argument and remaining part as second.
 *
 * @param filepath
 */
function shiftPath(filepath: string): [string, string] {
  const [dir, ...dirs] = filepath.split('/').filter(Boolean)
  return [dir, dirs.join('/')]
}

/**
 * Determines whether a path references a direct file
 * or a file in the nested folder.
 *
 * "/src/index.ts" -> false
 * "/index.ts" -> true
 * "index.ts" -> true
 *
 * @param filePath
 */
function isFileInThisFolder(filePath: string): boolean {
  return ['.', '/'].includes(path.dirname(filePath))
}
