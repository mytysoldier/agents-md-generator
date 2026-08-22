import type { EditedDraft, MinimumInput, ProjectCommand, RuleCategory, RuleGroup } from './model'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeSingleLine(value: unknown): string {
  if (typeof value !== 'string' || /[\r\n]/.test(value)) {
    return ''
  }

  return value.trim()
}

function normalizeTitle(value: unknown, defaultTitle: string): string {
  return normalizeSingleLine(value) || defaultTitle
}

function normalizeMultiline(value: unknown): string {
  if (typeof value !== 'string') {
    return ''
  }

  return value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/^[ \t]+|[ \t]+$/g, ''))
    .join('\n')
    .replace(/^\n+|\n+$/g, '')
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => normalizeSingleLine(item))
    .filter((item) => item.length > 0)
}

function normalizeCommand(value: unknown): ProjectCommand | null {
  if (!isRecord(value)) {
    return null
  }

  const command = normalizeSingleLine(value.command)
  if (!command) {
    return null
  }

  return {
    command,
    label: normalizeSingleLine(value.label),
    ...(value.labelIsManual === true ? { labelIsManual: true as const } : {}),
  }
}

function normalizeRuleGroup(value: unknown, requiredCategories: readonly RuleCategory[]): RuleGroup | null {
  if (!isRecord(value) || !requiredCategories.includes(value.category as RuleCategory)) {
    return null
  }

  return {
    category: value.category as RuleCategory,
    rules: normalizeStringList(value.rules),
  }
}

function normalizeTechnologyRuleSources(value: unknown, rules: string[]): Array<string | null> | undefined {
  if (!Array.isArray(value)) return undefined
  return rules.map((_, index) => typeof value[index] === 'string' ? normalizeSingleLine(value[index]) : null)
}

export function normalizeMinimumInput(value: unknown): MinimumInput {
  if (!isRecord(value)) {
    return { projectSummary: '', technologyStack: [], additionalConstraints: [] }
  }

  return {
    projectSummary: normalizeMultiline(value.projectSummary),
    technologyStack: normalizeStringList(value.technologyStack),
    additionalConstraints: normalizeStringList(value.additionalConstraints),
  }
}

export function normalizeEditedDraft(
  value: unknown,
  defaultTitle: string,
  requiredCategories: readonly RuleCategory[],
): EditedDraft {
  if (!isRecord(value)) {
    return emptyEditedDraft(defaultTitle)
  }

  const commands = Array.isArray(value.commands)
    ? value.commands.map(normalizeCommand).filter((command): command is ProjectCommand => command !== null)
    : []
  const commonRuleGroups = Array.isArray(value.commonRuleGroups)
    ? value.commonRuleGroups.map((group) => normalizeRuleGroup(group, requiredCategories)).filter((group): group is RuleGroup => group !== null)
    : []
  const technologySpecificRules = normalizeStringList(value.technologySpecificRules)
  const technologySpecificRuleSources = normalizeTechnologyRuleSources(value.technologySpecificRuleSources, technologySpecificRules)
  const removedTechnologySpecificRuleSources = normalizeStringList(value.removedTechnologySpecificRuleSources)

  return {
    kind: 'edited',
    title: normalizeTitle(value.title, defaultTitle),
    projectSummary: normalizeMultiline(value.projectSummary),
    technologyStack: normalizeStringList(value.technologyStack),
    commands,
    additionalConstraints: normalizeStringList(value.additionalConstraints),
    commonRuleGroups,
    technologySpecificRules,
    ...(technologySpecificRuleSources ? { technologySpecificRuleSources } : {}),
    ...(removedTechnologySpecificRuleSources.length > 0 ? { removedTechnologySpecificRuleSources } : {}),
  }
}

function emptyEditedDraft(defaultTitle: string): EditedDraft {
  return {
    kind: 'edited',
    title: defaultTitle,
    projectSummary: '',
    technologyStack: [],
    commands: [],
    additionalConstraints: [],
    commonRuleGroups: [],
    technologySpecificRules: [],
  }
}
