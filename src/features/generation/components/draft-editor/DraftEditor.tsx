import { useRef, useState } from 'react'
import type { EditedDraft, RuleCategory } from '../../model'
import { CommandsEditor } from './CommandsEditor'
import { CommonRulesEditor } from './CommonRulesEditor'
import { DocumentDetails } from './DocumentDetails'
import { ProjectDetails } from './ProjectDetails'
import { StaticInformation } from '../../../../components/StaticInformation'

interface DraftEditorProps {
  draft: EditedDraft
  onBack: (draft: EditedDraft) => void
  onGenerate: (draft: EditedDraft) => void
}

export function DraftEditor({ draft: initialDraft, onBack, onGenerate }: DraftEditorProps) {
  const [draft, setDraft] = useState(initialDraft)
  const [generationError, setGenerationError] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)
  const projectSummaryRef = useRef<HTMLTextAreaElement>(null)
  const generationErrorRef = useRef<HTMLParagraphElement>(null)

  function updateRule(category: RuleCategory, index: number, value: string) {
    setDraft((current) => ({
      ...current,
      commonRuleGroups: current.commonRuleGroups.map((group) => group.category === category
        ? {
            ...group,
            rules: !value.trim()
              ? group.rules[index].trim() && group.rules.filter((item) => item.trim()).length === 1
                ? group.rules
                : group.rules.filter((_, ruleIndex) => ruleIndex !== index)
              : group.rules.map((rule, ruleIndex) => ruleIndex === index ? value : rule),
          }
        : group),
    }))
  }

  function addRule(category: RuleCategory) {
    setDraft((current) => ({
      ...current,
      commonRuleGroups: current.commonRuleGroups.map((group) => group.category === category
        ? { ...group, rules: [...group.rules, ''] }
        : group),
    }))
  }

  function removeRule(category: RuleCategory, index: number) {
    setDraft((current) => ({
      ...current,
      commonRuleGroups: current.commonRuleGroups.map((group) => group.category === category
        && !(group.rules[index].trim() && group.rules.filter((rule) => rule.trim()).length === 1)
        ? { ...group, rules: group.rules.filter((_, ruleIndex) => ruleIndex !== index) }
        : group),
    }))
  }

  function generate() {
    if (/\r|\n/.test(draft.title)) {
      setGenerationError('文書タイトルは改行を含めずに入力してください。')
      titleRef.current?.focus()
      return
    }
    if (!draft.projectSummary.trim()) {
      setGenerationError('プロジェクトの目的を入力してください。')
      projectSummaryRef.current?.focus()
      return
    }

    try {
      setGenerationError('')
      onGenerate(draft)
    } catch {
      setGenerationError('AGENTS.mdを生成できませんでした。入力内容を確認して、もう一度お試しください。')
      requestAnimationFrame(() => generationErrorRef.current?.focus())
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12 text-slate-900 sm:px-8 sm:py-16">
      <header className="space-y-3">
        <p className="text-sm font-semibold tracking-wide text-indigo-700">たたき台の確認・編集</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">必要な詳細だけを整えてください</h1>
        <p className="leading-7 text-slate-600">「アプリが補完した内容」と「あなたの入力内容」を区別して表示しています。編集した内容が次の最終出力の根拠になります。</p>
      </header>
      <div className="mt-8 space-y-8">
        <DocumentDetails draft={draft} onChange={setDraft} titleRef={titleRef} projectSummaryRef={projectSummaryRef} />
        <ProjectDetails draft={draft} onChange={setDraft} />
        <CommandsEditor commands={draft.commands} onChange={(commands) => setDraft((current) => ({ ...current, commands }))} />
        <CommonRulesEditor
          groups={draft.commonRuleGroups}
          onRuleChange={updateRule}
          onAddRule={addRule}
          onRemoveRule={removeRule}
          technologySpecificRules={draft.technologySpecificRules}
          technologySpecificRuleSources={draft.technologySpecificRuleSources ?? draft.technologySpecificRules}
          removedTechnologySpecificRuleSources={draft.removedTechnologySpecificRuleSources ?? []}
          onTechnologySpecificRulesChange={(technologySpecificRules, technologySpecificRuleSources, removedTechnologySpecificRuleSources) => setDraft((current) => ({ ...current, technologySpecificRules, technologySpecificRuleSources, removedTechnologySpecificRuleSources }))}
        />
      </div>
      <div className="mt-10 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
        <button type="button" className="secondary-button" onClick={() => onBack(draft)}>最小入力に戻る</button>
        <button type="button" className="primary-button" onClick={generate}>AGENTS.mdを生成する</button>
      </div>
      {generationError && <p ref={generationErrorRef} className="mt-4 text-sm leading-6 text-rose-700" role="alert" tabIndex={-1}>{generationError}</p>}
      <StaticInformation />
    </main>
  )
}
