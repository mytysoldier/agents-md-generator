export const REQUIRED_RULE_CATEGORIES = [
  'implementation',
  'quality',
  'git',
  'agentWorkflow',
  'safety',
] as const

export type RuleCategory = (typeof REQUIRED_RULE_CATEGORIES)[number]

export interface MinimumInput {
  projectSummary: string
  technologyStack: string[]
  additionalConstraints: string[]
}

export interface ProjectCommand {
  command: string
  label: string
}

export interface RuleGroup {
  category: RuleCategory
  rules: string[]
}

/**
 * The app-created document shown before a user edits it.  It intentionally
 * remains distinct from both the minimum form input and the confirmed draft.
 */
interface DraftContents {
  title: string
  projectSummary: string
  technologyStack: string[]
  commands: ProjectCommand[]
  additionalConstraints: string[]
  commonRuleGroups: RuleGroup[]
  technologySpecificRules: string[]
}

export type GeneratedDraft = DraftContents & { kind: 'generated' }

/** The only document shape accepted as the source of the final Markdown. */
export type EditedDraft = DraftContents & { kind: 'edited' }

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

function normalizeMultiline(value: unknown): string {
  if (typeof value !== 'string') {
    return ''
  }

  return value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim()
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

  return { command, label: normalizeSingleLine(value.label) }
}

function normalizeRuleGroup(value: unknown): RuleGroup | null {
  if (!isRecord(value) || !REQUIRED_RULE_CATEGORIES.includes(value.category as RuleCategory)) {
    return null
  }

  return {
    category: value.category as RuleCategory,
    rules: normalizeStringList(value.rules),
  }
}

/** Safely converts untrusted initial-form values to the minimum-input model. */
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

/** Safely converts untrusted editable-document values to the confirmed-draft model. */
export function normalizeEditedDraft(value: unknown): EditedDraft {
  if (!isRecord(value)) {
    return emptyEditedDraft()
  }

  const commands = Array.isArray(value.commands)
    ? value.commands.map(normalizeCommand).filter((command): command is ProjectCommand => command !== null)
    : []
  const commonRuleGroups = Array.isArray(value.commonRuleGroups)
    ? value.commonRuleGroups.map(normalizeRuleGroup).filter((group): group is RuleGroup => group !== null)
    : []

  return {
    kind: 'edited',
    title: normalizeSingleLine(value.title),
    projectSummary: normalizeMultiline(value.projectSummary),
    technologyStack: normalizeStringList(value.technologyStack),
    commands,
    additionalConstraints: normalizeStringList(value.additionalConstraints),
    commonRuleGroups,
    technologySpecificRules: normalizeStringList(value.technologySpecificRules),
  }
}

export function emptyEditedDraft(): EditedDraft {
  return {
    kind: 'edited',
    title: '',
    projectSummary: '',
    technologyStack: [],
    commands: [],
    additionalConstraints: [],
    commonRuleGroups: [],
    technologySpecificRules: [],
  }
}
