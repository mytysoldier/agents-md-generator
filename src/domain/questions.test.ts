import { describe, expect, it } from 'vitest'
import { emptyAnswers, normalizeAnswers, normalizeCommandList, normalizeList, normalizeText, normalizeTextarea, questionIds, questions } from './questions'

describe('question data model', () => {
  it('defines every question from the specification in display order', () => {
    expect(questions.map((question) => question.id)).toEqual(questionIds)
    expect(questions.filter((question) => question.required)).toHaveLength(4)
    expect(questions.find((question) => question.id === 'project.constraints')?.initialValue).toEqual([])
  })

  it('provides a fresh, empty answer value for every question', () => {
    const first = emptyAnswers()
    const second = emptyAnswers()

    first['technology.stack'].push('TypeScript')

    expect(second).toEqual({
      'project.name': '',
      'project.summary': '',
      'technology.stack': [],
      'commands.project': [],
      'project.constraints': [],
    })
  })

  it('normalizes single-line text and multiline text according to their input kinds', () => {
    expect(normalizeText('  React\n\t Vite  ')).toBe('React Vite')
    expect(normalizeTextarea('\r\n  first  \r\n\tsecond\t\r\n\r\n')).toBe('first\nsecond')
  })

  it('removes empty and duplicate list entries while preserving order', () => {
    expect(normalizeList(['  TypeScript ', '', 'React', 'TypeScript', 1])).toEqual(['TypeScript', 'React'])
  })

  it('accepts commands only, rejects malformed commands, and safely falls back for malformed answer data', () => {
    expect(normalizeCommandList([
      ' pnpm test ',
      'npm\ntest',
      'pnpm test',
      '',
    ])).toEqual(['pnpm test'])

    expect(normalizeAnswers({
      'project.name': 42,
      'project.summary': ['invalid'],
      'technology.stack': 'React',
      'commands.project': ['pnpm build'],
      'project.constraints': [null, '  本番データを使わない  '],
    })).toEqual({
      'project.name': '',
      'project.summary': '',
      'technology.stack': [],
      'commands.project': ['pnpm build'],
      'project.constraints': ['本番データを使わない'],
    })
  })
})
