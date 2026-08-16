import { describe, expect, it } from 'vitest'
import { emptyEditedDraft, normalizeEditedDraft, normalizeMinimumInput } from './model'

describe('最小入力の正規化', () => {
  it('必須の概要を保持し、任意項目を空配列として扱う', () => {
    // Arrange
    const input = { projectSummary: '  在庫を管理する\r\nWebアプリ  ' }

    // Act
    const result = normalizeMinimumInput(input)

    // Assert
    expect(result).toEqual({
      projectSummary: '在庫を管理する\nWebアプリ',
      technologyStack: [],
      additionalConstraints: [],
    })
  })

  it('不正な値を安全な空値へフォールバックし、有効な任意項目を切り詰めない', () => {
    // Arrange
    const technologies = Array.from({ length: 21 }, (_, index) => ` tech-${index} `)
    const input = { projectSummary: 42, technologyStack: technologies, additionalConstraints: 'not a list' }

    // Act
    const result = normalizeMinimumInput(input)

    // Assert
    expect(result).toEqual({
      projectSummary: '',
      technologyStack: technologies.map((item) => item.trim()),
      additionalConstraints: [],
    })
  })

  it('概要の行末から半角空白とタブだけを除去する', () => {
    // Arrange
    const input = { projectSummary: ' \t\u3000概要\u3000\t \n\t次の行 ' }

    // Act
    const result = normalizeMinimumInput(input)

    // Assert
    expect(result.projectSummary).toBe('　概要　\n次の行')
  })
})

describe('編集済みたたき台の正規化', () => {
  it('編集可能なコマンド用途ラベルとルールグループを保持する', () => {
    // Arrange
    const input = {
      title: ' AGENTS.md ',
      projectSummary: '概要',
      commands: [{ command: ' pnpm test ', label: ' テスト ' }],
      commonRuleGroups: [{ category: 'quality', rules: [' テストを実行する '] }],
      technologySpecificRules: [' strict を維持する '],
    }

    // Act
    const result = normalizeEditedDraft(input)

    // Assert
    expect(result).toEqual({
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

  it('不正な値を除外する', () => {
    // Arrange
    const input = {
      title: 'two\nlines',
      projectSummary: null,
      commands: [{ command: 'valid' }, { command: 'bad\ncommand' }, 'bad'],
      commonRuleGroups: [{ category: 'unknown', rules: ['ignored'] }, { category: 'git', rules: [null, ' keep '] }],
      technologySpecificRules: ['\n', 3],
    }

    // Act
    const result = normalizeEditedDraft(input)

    // Assert
    expect(result).toEqual({
      ...emptyEditedDraft(),
      commands: [{ command: 'valid', label: '' }],
      commonRuleGroups: [{ category: 'git', rules: ['keep'] }],
    })
  })

  it('空または不正なタイトルをAGENTS.mdへ補完する', () => {
    // Arrange
    const emptyTitle = { title: '   ' }
    const invalidTitle = { title: 'invalid\ntitle' }

    // Act
    const emptyTitleResult = normalizeEditedDraft(emptyTitle)
    const invalidTitleResult = normalizeEditedDraft(invalidTitle)

    // Assert
    expect(emptyTitleResult.title).toBe('AGENTS.md')
    expect(invalidTitleResult.title).toBe('AGENTS.md')
  })

  it('オブジェクトではない外部値を空のたたき台へフォールバックする', () => {
    // Arrange
    const input = ['not', 'a', 'draft']

    // Act
    const result = normalizeEditedDraft(input)

    // Assert
    expect(result).toEqual(emptyEditedDraft())
  })
})
