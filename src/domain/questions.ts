export const questionIds = [
  'project.name',
  'project.summary',
  'technology.stack',
  'commands.project',
  'project.constraints',
] as const

export type QuestionId = (typeof questionIds)[number]
export type QuestionInputKind = 'text' | 'textarea' | 'list' | 'command-list'

export type Answers = {
  'project.name': string
  'project.summary': string
  'technology.stack': string[]
  'commands.project': string[]
  'project.constraints': string[]
}

export type AnswerValue = Answers[QuestionId]

type BaseQuestionDefinition<Id extends QuestionId, Kind extends QuestionInputKind> = {
  id: Id
  kind: Kind
  label: string
  description: string
  required: boolean
  maxLength?: number
  maxItems?: number
  initialValue: Answers[Id]
  visibleWhen?: (answers: Answers) => boolean
}

export type QuestionDefinition =
  | BaseQuestionDefinition<'project.name', 'text'>
  | BaseQuestionDefinition<'project.summary', 'textarea'>
  | BaseQuestionDefinition<'technology.stack', 'list'>
  | BaseQuestionDefinition<'commands.project', 'command-list'>
  | BaseQuestionDefinition<'project.constraints', 'list'>

export const emptyAnswers = (): Answers => ({
  'project.name': '',
  'project.summary': '',
  'technology.stack': [],
  'commands.project': [],
  'project.constraints': [],
})

export const questions: readonly QuestionDefinition[] = [
  {
    id: 'project.name',
    kind: 'text',
    label: 'プロジェクト名',
    description: 'AGENTS.md の対象名。例: 在庫管理Web',
    required: true,
    maxLength: 100,
    initialValue: '',
  },
  {
    id: 'project.summary',
    kind: 'textarea',
    label: '何を作るプロジェクトですか？',
    description: '対象ユーザー、解決する課題、提供するものを短く入力する。',
    required: true,
    maxLength: 1000,
    initialValue: '',
  },
  {
    id: 'technology.stack',
    kind: 'list',
    label: '技術スタック',
    description: '言語、フレームワーク、主要ライブラリを1行ずつ入力する。',
    required: true,
    maxItems: 20,
    initialValue: [],
  },
  {
    id: 'commands.project',
    kind: 'command-list',
    label: 'プロジェクトで使うコマンド',
    description: 'install、dev、lint、test、buildなど、使用してよいコマンドを1行ずつ入力する。用途はAGENTS.mdの生成時に補う。',
    required: true,
    maxItems: 10,
    initialValue: [],
  },
  {
    id: 'project.constraints',
    kind: 'list',
    label: '追加で守ってほしいこと',
    description: 'プロジェクト固有の禁止事項や注意だけを1行ずつ入力する。',
    required: false,
    maxItems: 10,
    initialValue: [],
  },
]

export function normalizeAnswers(value: unknown): Answers {
  const source = isRecord(value) ? value : {}

  return {
    'project.name': normalizeText(source['project.name']),
    'project.summary': normalizeTextarea(source['project.summary']),
    'technology.stack': normalizeList(source['technology.stack']),
    'commands.project': normalizeCommandList(source['commands.project']),
    'project.constraints': normalizeList(source['project.constraints']),
  }
}

export function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/[\s\r\n]+/gu, ' ') : ''
}

export function normalizeTextarea(value: unknown): string {
  if (typeof value !== 'string') return ''

  const lines = value
    .replace(/\r\n?/gu, '\n')
    .split('\n')
    .map((line) => line.replace(/^[\t ]+/u, '').replace(/[\t ]+$/u, ''))

  while (lines[0] === '') lines.shift()
  while (lines.at(-1) === '') lines.pop()

  return lines.join('\n')
}

export function normalizeList(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return unique(value.map(normalizeText).filter(Boolean))
}

export function normalizeCommandList(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return unique(value.map(normalizeCommand).filter(Boolean))
}

function normalizeCommand(value: unknown): string {
  return typeof value === 'string' && !/[\r\n]/u.test(value) ? value.trim() : ''
}

function unique(values: string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) === index)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
