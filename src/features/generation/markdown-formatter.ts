import { REQUIRED_RULE_CATEGORIES, normalizeEditedDraft } from './model'
import type { EditedDraft, ProjectCommand, RuleCategory } from './model'
import { INTRODUCTION, SECTION_TITLES } from './generation-templates'

function escapeMarkdown(value: string): string { return value.replace(/\\/g, '\\\\').replace(/[`~=*_{}[\]()<>#+\-.!|&]/g, '\\$&') }
function formatList(items: string[]): string { return items.map((item) => `- ${escapeMarkdown(item)}`).join('\n') }
function formatCommand(command: ProjectCommand): string {
  let longestBacktickRun = 0
  for (const match of command.command.matchAll(/`+/g)) longestBacktickRun = Math.max(longestBacktickRun, match[0].length)
  const delimiter = '`'.repeat(longestBacktickRun + 1)
  return `- ${command.label ? `${escapeMarkdown(command.label)}: ` : ''}${delimiter} ${command.command} ${delimiter}`
}
function rulesForCategory(draft: EditedDraft, category: RuleCategory): string[] {
  const rules = draft.commonRuleGroups.find((candidate) => candidate.category === category)?.rules ?? []
  if (category === 'implementation') return [...rules, ...draft.technologySpecificRules]
  return category === 'safety' ? [...rules, ...draft.additionalConstraints] : rules
}

function assertRequiredRuleGroups(draft: EditedDraft): void {
  for (const category of REQUIRED_RULE_CATEGORIES) {
    const rules = draft.commonRuleGroups.find((group) => group.category === category)?.rules ?? []
    if (rules.length === 0) {
      throw new Error(`必須ルールカテゴリ「${SECTION_TITLES[category]}」には1件以上のルールが必要です。`)
    }
  }
}

export function formatAgentsMarkdown(value: unknown): string {
  const draft = normalizeEditedDraft(value)
  assertRequiredRuleGroups(draft)
  const sections = [`# ${escapeMarkdown(draft.title)}`, INTRODUCTION, `## プロジェクトの目的\n\n${escapeMarkdown(draft.projectSummary)}`]
  if (draft.technologyStack.length > 0) sections.push(`## 技術スタック\n\n${formatList(draft.technologyStack)}`)
  if (draft.commands.length > 0) sections.push(`## プロジェクトコマンド\n\n${draft.commands.map(formatCommand).join('\n')}`)
  for (const category of REQUIRED_RULE_CATEGORIES) {
    const rules = rulesForCategory(draft, category)
    if (rules.length > 0) sections.push(`## ${SECTION_TITLES[category]}\n\n${formatList(rules)}`)
  }
  return `${sections.join('\n\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n').trimEnd()}\n`
}
