import { Octokit } from '@octokit/rest'
import * as nock from 'nock'
import * as path from 'path'

import { commit, loadTreeFromPath, CommitInput } from '../src'

describe('github:', () => {
  beforeAll(() => {
    nock.disableNetConnect()
  })

  afterAll(() => {
    nock.enableNetConnect()
  })

  test(
    'commit',
    async () => {
      expect.assertions(5)

      const params: CommitInput = {
        owner: 'maticzav',
        repo: 'github-tree',
        message: 'My test commit!',
        ref: 'heads/master',
        tree: loadTreeFromPath(
          path.resolve(__dirname, './__fixtures__/example'),
          [],
        ),
      }

      /* Mocks */

      let blobs: { [sha: number]: string } = {}

      const createBlobEndpoint = jest.fn().mockImplementation((uri, body) => {
        const sha = Object.keys(blobs).length
        blobs[sha] = body.content
        return { url: 'url', sha }
      })

      let trees: { [sha: number]: string } = {}

      const createTreeEndpoint = jest.fn().mockImplementation((uri, body) => {
        const sha = Object.keys(trees).length
        trees[sha] = body.tree
        return { sha: sha, url: 'url', tree: body.tree }
      })

      const parentSha = Math.floor(Math.random() * 1000).toString()

      const getRefEndpoint = jest.fn().mockImplementation((uri, body) => {
        return { object: { sha: parentSha } }
      })

      const commitSha = Math.floor(Math.random() * 1000).toString()

      const createCommitEndpoint = jest.fn().mockImplementation((uri, body) => {
        expect(body.parents).toEqual([parentSha])
        expect(body.message).toBe(params.message)
        return { sha: commitSha }
      })

      const updateRefEndpoint = jest.fn().mockImplementation((uri, body) => {
        expect(body.sha).toBe(commitSha)
        return { object: { sha: '' } }
      })

      /* Mocks */

      nock('https://api.github.com')
        .post('/repos/maticzav/github-tree/git/blobs')
        .reply(200, createBlobEndpoint)
        .persist()

      nock('https://api.github.com')
        .post('/repos/maticzav/github-tree/git/trees')
        .reply(200, createTreeEndpoint)
        .persist()

      nock('https://api.github.com')
        .get('/repos/maticzav/github-tree/git/ref/heads/master')
        .reply(200, getRefEndpoint)

      nock('https://api.github.com')
        .post('/repos/maticzav/github-tree/git/commits')
        .reply(200, createCommitEndpoint)

      nock('https://api.github.com')
        .patch('/repos/maticzav/github-tree/git/refs/heads/master')
        .reply(200, updateRefEndpoint)

      const octokit = new Octokit({})
      await commit(octokit, params)

      /* Tests */

      expect(blobs).toMatchSnapshot()
      expect(trees).toMatchSnapshot()
    },
    5 * 60 * 1000,
  )
})
