import { Octokit } from '@octokit/rest'

import { Tree, File, getTreeFiles, getTreeSubTrees } from './tree'
import { Dict, mapEntriesAsync, not } from './utils'

/**
 * Input variables for commit method.
 */
export type CommitInput = {
  owner: string
  repo: string
  message: string
  ref: string
  tree: Tree
}

/**
 * Create a commit to Github using Github API v3.
 *
 * @param github
 * @param CommitInput
 */
export async function commit<O extends Octokit>(
  github: O,
  { owner, repo, message, ref, tree }: CommitInput,
): Promise<Octokit.GitCreateCommitResponse> {
  /**
   * Variables prefixed with g reference values that exist on Github.
   */
  const gTree = await createGhTree(github, { owner, repo }, tree)
  const gRef = await github.git
    .getRef({ owner, repo, ref })
    .then(res => res.data)

  const commit = await github.git
    .createCommit({
      owner,
      repo,
      message,
      tree: gTree.sha,
      parents: [gRef.object.sha],
    })
    .then(res => res.data)

  await github.git
    .updateRef({
      owner,
      repo,
      ref,
      sha: commit.sha,
    })
    .then(res => res.data)

  return commit
}

/**
 * Recursively creates a tree commit by creating blobs and generating
 * trees on folders.
 *
 * @param github
 * @param tree
 */
async function createGhTree(
  github: Octokit,
  { owner, repo }: { owner: string; repo: string },
  tree: Tree,
): Promise<{ sha: string }> {
  /**
   * Uploads blobs and creates subtrees.
   */
  const blobs = await mapEntriesAsync(getTreeFiles(tree), content =>
    createGhBlob(github, { owner, repo }, content),
  )
  const trees = await mapEntriesAsync(getTreeSubTrees(tree), subTree =>
    createGhTree(github, { owner, repo }, subTree),
  )

  return github.git
    .createTree({
      owner,
      repo,
      tree: [
        ...Object.entries(trees).map(([treePath, { sha }]) => ({
          mode: '040000' as const,
          type: 'tree' as const,
          path: treePath,
          sha,
        })),
        ...Object.entries(blobs).map(([filePath, { sha }]) => ({
          mode: '100644' as const,
          type: 'blob' as const,
          path: filePath,
          sha,
        })),
      ],
    })
    .then(res => res.data)
}

/**
 * Creates a Github Blob from a File.
 *
 * @param github
 * @param param1
 * @param file
 */
async function createGhBlob(
  github: Octokit,
  { owner, repo }: { owner: string; repo: string },
  file: File,
): Promise<Octokit.GitCreateBlobResponse> {
  return github.git
    .createBlob({ owner, repo, content: file.content, encoding: file.encoding })
    .then(res => res.data)
}
