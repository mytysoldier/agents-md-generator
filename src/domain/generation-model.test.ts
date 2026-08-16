import { describe, expect, it } from 'vitest'
import { emptyEditedDraft, normalizeEditedDraft, normalizeMinimumInput } from './generation-model'

describe('normalizeMinimumInput', () => {
  it('keeps the required summary while treating the other form fields as optional', () => {
    expect(normalizeMinimumInput({ projectSummary: '  在庫を管理する\r\nWebアプリ  ' })).toEqual({
      projectSummary: '在庫を管理する\nWebアプリ',
      technologyStack: [],
      additionalConstraints: [],
    })
  })

  it('falls back safely for malformed values without truncating optional lists', () => {
    const technologies = Array.from({ length: 21 }, (_, index) => ` tech-${index} `)

    expect(normalizeMinimumInput({ projectSummary: 42, technologyStack: technologies, additionalConstraints: 'not a list' })).toEqual({
      projectSummary: '',
      technologyStack: technologies.map((item) => item.trim()),
      additionalConstraints: [],
    })
  })

  it('keeps valid input without applying character limits', () => {
    const summary = '概要'.repeat(600)

    expect(normalizeMinimumInput({ projectSummary: summary })).toEqual({
      projectSummary: summary,
      technologyStack: [],
      additionalConstraints: [],
    })
  })

  it('removes only half-width spaces and tabs from summary line boundaries', () => {
    expect(normalizeMinimumInput({ projectSummary: ' \t\u3000概要\u3000\t \n\t次の行 ' }).projectSummary).toBe('　概要　\n次の行')
  })
})

describe('normalizeEditedDraft', () => {
  it('preserves editable command labels and rule groups', () => {
    expect(normalizeEditedDraft({
      title: ' AGENTS.md ',
      projectSummary: '概要',
      commands: [{ command: ' pnpm test ', label: ' テスト ' }],
      commonRuleGroups: [{ category: 'quality', rules: [' テストを実行する '] }],
      technologySpecificRules: [' strict を維持する '],
    })).toEqual({
      kind: 'edited',
      title: 'AGENTS.md',
      projectSummary: '概要',
      technologyStack: [],
      commands: [{ command: 'pnpm test', label: 'テスト' }],
      additionalConstraints: [],
      commonRuleGroups: [{ category: 'quality', rules: ['テストを実行する'] }],
      technologySpecificRules: ['strict を維持する'],
    })
  })

  it('removes malformed values instead of throwing', () => {
    expect(normalizeEditedDraft({
      title: 'two\nlines',
      projectSummary: null,
      commands: [{ command: 'valid' }, { command: 'bad\ncommand' }, 'bad'],
      commonRuleGroups: [{ category: 'unknown', rules: ['ignored'] }, { category: 'git', rules: [null, ' keep '] }],
      technologySpecificRules: ['\n', 3],
    })).toEqual({
      ...emptyEditedDraft(),
      commands: [{ command: 'valid', label: '' }],
      commonRuleGroups: [{ category: 'git', rules: ['keep'] }],
    })
  })

  it('defaults an empty or invalid title to AGENTS.md', () => {
    expect(normalizeEditedDraft({ title: '   ' }).title).toBe('AGENTS.md')
    expect(normalizeEditedDraft({ title: 'invalid\ntitle' }).title).toBe('AGENTS.md')
  })

  it('returns an empty draft for non-object external values', () => {
    expect(normalizeEditedDraft(['not', 'a', 'draft'])).toEqual(emptyEditedDraft())
  })
})
