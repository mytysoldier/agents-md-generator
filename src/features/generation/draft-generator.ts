import { DEFAULT_DOCUMENT_TITLE, REQUIRED_RULE_CATEGORIES, normalizeMinimumInput } from './model'
import type { GeneratedDraft, MinimumInput, RuleGroup } from './model'
import { COMMAND_LABELS, COMMON_RULES, TECHNOLOGY_PROFILES } from './generation-templates'

function containsTerm(value: string, alternatives: string): boolean {
  return new RegExp(`(^|[^a-z0-9])(?:${alternatives})(?=$|[^a-z0-9])`, 'i').test(value)
}

function createCommonRuleGroups(): RuleGroup[] {
  return REQUIRED_RULE_CATEGORIES.map((category) => ({ category, rules: [...COMMON_RULES[category]] }))
}

function technologyRules(technologyStack: string[]): string[] {
  const normalizedStack = technologyStack.map((technology) => technology.normalize('NFKC').toLowerCase())
  const rules: string[] = []
  for (const [terms, rule] of TECHNOLOGY_PROFILES) {
    if (normalizedStack.some((technology) => containsTerm(technology, terms)) && !rules.includes(rule)) rules.push(rule)
  }
  return rules
}

export function createGeneratedDraft(value: unknown): GeneratedDraft {
  const input: MinimumInput = normalizeMinimumInput(value)
  return { kind: 'generated', title: DEFAULT_DOCUMENT_TITLE, projectSummary: input.projectSummary, technologyStack: input.technologyStack, commands: [], additionalConstraints: input.additionalConstraints, commonRuleGroups: createCommonRuleGroups(), technologySpecificRules: technologyRules(input.technologyStack) }
}

export function suggestCommandLabel(command: unknown): string {
  if (typeof command !== 'string' || /[\r\n]/.test(command)) return ''
  return COMMAND_LABELS.find(([term]) => containsTerm(command.trim().toLowerCase(), term))?.[1] ?? ''
}
