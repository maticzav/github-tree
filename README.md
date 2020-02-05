# 🐙 github-tree

[![test status](https://github.com/maticzav/github-tree/workflows/test/badge.svg)](https://github.com/maticzav/github-tree)
[![npm version](https://badge.fury.io/js/github-tree.svg)](https://badge.fury.io/js/github-tree)

> Github API commits made easy peasy.

## Overview

This library helps you create commits to Github using a simple API that abstracts away core git functionality.

<!-- bannerbot -->

## Installation

```bash
yarn add github-tree
```

## How to use it?

It's very simple! There's a `commit` method that takes `Octokit` instance as an argument and a handful of other inputs, including `tree`, that represent your next commit.

> :warning: Note that the current state of `github-tree` doesn't support partial commits. Every folder you make in a tree wipes all existing data out.

```ts
import { Octokit } from '@octokit/rest'
import fs from 'fs'
import { commit, utf8, base64 } from 'github-tree'

const tree = {
  'README.md': utf8(`# A cool README!`),
  'src/index.ts': base64(fs.readFileSync('/path.ts', { encoding: 'base64' })),
}

await commit({
  owner: 'maticzav',
  repo: 'label-sync',
  message: 'Additions from our server',
  ref: 'heads/master',
  tree,
})
```

This will create one file in the repository root - `README.md` - and one in folder `src` - `index.ts`.

---

It is common that you want to commit more files during a particular commit. Perhaps even a whole repository setup! In case you need such functionality, there's a `loadTreeFromPath` method that can help you load files from your file system and convert them into a `Tree`.

```ts
import { commit, loadTreeFromPath } from 'github-tree'

const tree = loadTreeFromPath(PATH_TO_TREE, [
  'ignored_folders',
  'node_nodules',
  /.*regex./,
])

// ...

await commit(_, {
  tree,
})
```

## Other methods

```ts
/* Tree */

type Tree = { [path: string]: File }

/**
 * Creates an utf-8 encoded file.
 */
export function utf8(content: string): File

/**
 * Creates a base64 encoded file.
 */
export function base64(content: string): File

/* Github */

/**
 * Input variables for commit method.
 */
export type CommitInput = {
  /**
   * Name of the owner of the repository.
   */
  owner: string
  /**
   * Name of the repository.
   */
  repo: string
  /**
   * Message of a commit.
   */
  message: string
  /**
   * Make sure that your ref follows heads/<ref> format.
   */
  ref: string
  /**
   * Your files.
   */
  tree: Tree
}

/**
 * Create a commit to Github using Github API v3.
 */
async function commit(
  github: Octokit,
  commit: CommitInput,
): Promise<Octokit.GitCreateCommitResponse>

/* Utility functions */

/**
 * Loads a tree of utf-8 decoded files at paths.
 */
function loadTreeFromPath(root: string, ignore: (string | RegExp)[]): Tree

/**
 * Lets you map files asynchornously.
 */
async function mapFiles(
  tree: Tree,
  fn: (file: File, path: string) => Promise<File>,
): Promise<Tree>

/**
 * Lets you manipulate file paths.
 */
function mapPaths(tree: Tree, fn: (path: string, file: File) => string): Tree
```

## License

MIT @ Matic Zavadlal
