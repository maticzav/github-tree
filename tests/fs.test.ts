import * as path from 'path'
import { loadTreeFromPath } from '../src/'

describe('utils:', () => {
  test('loadTreeFromPath', () => {
    const tree = loadTreeFromPath(
      path.resolve(__dirname, './__fixtures__/example'),
      ['ignore'],
    )

    expect(tree).toMatchSnapshot()
  })
})
