export const REQUIRED_RULE_CATEGORIES = [
  'implementation',
  'quality',
  'git',
  'agentWorkflow',
  'safety',
] as const

export const DEFAULT_DOCUMENT_TITLE = 'AGENTS.md'

export type RuleCategory = (typeof REQUIRED_RULE_CATEGORIES)[number]

export interface MinimumInput {
  projectSummary: string
  technologyStack: string[]
  additionalConstraints: string[]
}

export interface ProjectCommand {
  command: string
  label: string
  /** UI state that distinguishes an explicit label edit from an automatic suggestion. */
  labelIsManual?: true
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
  /** Generated profile identity for each technology-specific rule; null means user-added. */
  technologySpecificRuleSources?: Array<string | null>
  /** Generated profiles whose rules were explicitly removed by the user. */
  removedTechnologySpecificRuleSources?: string[]
}

export type GeneratedDraft = DraftContents & { kind: 'generated' }

/** The only document shape accepted as the source of the final Markdown. */
export type EditedDraft = DraftContents & { kind: 'edited' }

/** Safely converts untrusted editable-document values to the confirmed-draft model. */
export function normalizeEditedDraft(value: unknown): EditedDraft {
  return normalizeEditedDraftValue(value, DEFAULT_DOCUMENT_TITLE, REQUIRED_RULE_CATEGORIES)
}

export { normalizeMinimumInput }

export function emptyEditedDraft(): EditedDraft {
  return {
    kind: 'edited',
    title: DEFAULT_DOCUMENT_TITLE,
    projectSummary: '',
    technologyStack: [],
    commands: [],
    additionalConstraints: [],
    commonRuleGroups: [],
    technologySpecificRules: [],
  }
}
import { normalizeEditedDraft as normalizeEditedDraftValue, normalizeMinimumInput } from './normalizers'
