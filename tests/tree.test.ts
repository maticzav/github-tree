import {
  getTreeFiles,
  utf8,
  getTreeSubTrees,
  base64,
  encoding,
  content,
} from '../src/tree'

describe('tree:', () => {
  test('getTreeFiles', () => {
    const files = getTreeFiles({
      'index.ts': utf8('Hey'),
      'nested/index.ts': utf8('Not hey!'),
    })

    expect(files).toEqual({ 'index.ts': utf8('Hey') })
  })
  test('getTreeSubTrees', () => {
    const files = getTreeSubTrees({
      'index.ts': utf8('MMM'),
      'nested/index.ts': utf8('Nested!'),
      'other/foo': utf8('file'),
      'other/bar': utf8('ayy'),
    })

    expect(files).toEqual({
      nested: { 'index.ts': utf8('Nested!') },
      other: { foo: utf8('file'), bar: utf8('ayy') },
    })
  })

  test('encoding', () => {
    expect(encoding(utf8(''))).toBe('utf-8')
    expect(encoding(base64(''))).toBe('base64')
  })

  test('content', () => {
    expect(content(utf8('a'))).toBe('a')
    expect(content(base64('b'))).toBe('b')
  })
})
