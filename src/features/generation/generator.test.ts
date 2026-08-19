import { describe, expect, it } from 'vitest'
import { createGeneratedDraft, formatAgentsMarkdown, suggestCommandLabel } from './generator'

function requiredRuleGroups() {
  return [
    { category: 'implementation', rules: ['実装する'] },
    { category: 'quality', rules: ['確認する'] },
    { category: 'git', rules: ['記録する'] },
    { category: 'agentWorkflow', rules: ['報告する'] },
    { category: 'safety', rules: ['秘密を出さない'] },
  ]
}

describe('たたき台の作成', () => {
  it('固定ルールと一致した技術固有ルールだけをたたき台へ追加する', () => {
    // Arrange
    const input = { projectSummary: ' 作業を支援するWebアプリ ', technologyStack: ['TypeScript', 'React', 'django'] }

    // Act
    const draft = createGeneratedDraft(input)

    // Assert
    expect(draft.projectSummary).toBe('作業を支援するWebアプリ')
    expect(draft.commands).toEqual([])
    expect(draft.commonRuleGroups.map((group) => group.category)).toEqual([
      'implementation', 'quality', 'git', 'agentWorkflow', 'safety',
    ])
    expect(draft.technologySpecificRules).toHaveLength(3)
  })

  it('部分一致で技術固有ルールやコマンド用途を捏造しない', () => {
    // Arrange
    const input = { projectSummary: '概要', technologyStack: ['djangoose'] }

    // Act
    const draft = createGeneratedDraft(input)
    const label = suggestCommandLabel('pnpm run contest')

    // Assert
    expect(draft.technologySpecificRules).toEqual([])
    expect(label).toBe('')
  })

  it('全角のコマンド名から用途を推測しない', () => {
    // Arrange
    const command = 'ｔｅｓｔ'

    // Act
    const label = suggestCommandLabel(command)

    // Assert
    expect(label).toBe('')
  })
})

describe('コマンド用途ラベルの候補', () => {
  it('一致順で最初の用途ラベルを返す', () => {
    // Arrange
    const command = 'pnpm install && pnpm test'

    // Act
    const label = suggestCommandLabel(command)

    // Assert
    expect(label).toBe('依存関係をインストール')
  })
})

describe('AGENTS.mdの整形', () => {
  it('編集済み内容だけを根拠に、任意セクションを省略して決定的に整形する', () => {
    // Arrange
    const draft = {
      title: ' My [Agent] ',
      projectSummary: ' 1行目  \r\n\t2行目 ',
      commands: [{ command: 'pnpm test `unit`', label: ' テスト ' }],
      commonRuleGroups: [
        { category: 'implementation', rules: [' *を避ける* '] },
        { category: 'quality', rules: [' 品質を確認する '] },
        { category: 'git', rules: [' 履歴を確認する '] },
        { category: 'agentWorkflow', rules: [' 結果を報告する '] },
        { category: 'safety', rules: [' 秘密を出さない '] },
      ],
      additionalConstraints: [' 変更は小さく '],
      technologySpecificRules: [' strictを維持する '],
    }

    // Act
    const result = formatAgentsMarkdown(draft)

    // Assert
    expect(result).toBe([
      '# My \\[Agent\\]',
      'このファイルは、このプロジェクトで作業するAIエージェント向けの指示です。',
      '## プロジェクトの目的\n\n1行目\n2行目',
      '## プロジェクトコマンド\n\n- テスト: `` pnpm test `unit` ``',
      '## 実装方針とコーディング規約\n\n- \\*を避ける\\*\n- strictを維持する',
      '## テスト・品質確認\n\n- 品質を確認する',
      '## Git・Pull Request運用\n\n- 履歴を確認する',
      '## AIエージェントの作業手順\n\n- 結果を報告する',
      '## 禁止事項と安全上の制約\n\n- 秘密を出さない\n- 変更は小さく',
    ].join('\n\n') + '\n')
    expect(result).not.toContain('## 技術スタック')
    expect(result).not.toContain('\r')
  })

  it('不正な値でもクラッシュせず、末尾LFを一つだけにする', () => {
    // Arrange
    const invalidDraft = {
      title: 'bad\ntitle',
      projectSummary: '概要',
      commands: [{ command: 'bad\ncommand' }],
      commonRuleGroups: requiredRuleGroups(),
    }

    // Act
    const result = formatAgentsMarkdown(invalidDraft)

    // Assert
    expect(result).toContain('# AGENTS\\.md')
    expect(result).not.toContain('プロジェクトコマンド')
    expect(result).toMatch(/[^\n]\n$/)
    expect(result).not.toMatch(/\n\n\n/)
  })

  it('必須ルールカテゴリが欠ける編集済み内容は生成しない', () => {
    // Arrange
    const incompleteDraft = { projectSummary: '概要', commonRuleGroups: [{ category: 'implementation', rules: ['実装する'] }] }

    // Act / Assert
    expect(() => formatAgentsMarkdown(incompleteDraft)).toThrow('テスト・品質確認')
  })

  it('空のプロジェクト概要を含む編集済み内容は生成しない', () => {
    // Arrange
    const incompleteDraft = { projectSummary: '  ', commonRuleGroups: requiredRuleGroups() }

    // Act / Assert
    expect(() => formatAgentsMarkdown(incompleteDraft)).toThrow('プロジェクトの目的')
  })

  it('多数のバッククォート列を含むコマンドでもクラッシュしない', () => {
    // Arrange
    const command = '`a'.repeat(150_000)
    const draft = { projectSummary: '概要', commands: [{ command, label: '' }], commonRuleGroups: requiredRuleGroups() }

    // Act
    const result = formatAgentsMarkdown(draft)

    // Assert
    expect(result).toContain(`- \`\` ${command} \`\``)
  })
})
