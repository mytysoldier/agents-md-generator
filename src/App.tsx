import { useState } from 'react'
import { createGeneratedDraft, suggestCommandLabel } from './features/generation/generator'
import { SECTION_TITLES } from './features/generation/generation-templates'
import { DEFAULT_DOCUMENT_TITLE } from './features/generation/model'
import type { EditedDraft, RuleCategory } from './features/generation/model'

const RULE_CATEGORIES: readonly RuleCategory[] = ['implementation', 'quality', 'git', 'agentWorkflow', 'safety']

function linesToItems(value: string): string[] {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
}

function itemsToLines(items: string[]): string {
  return items.join('\n')
}

function toEditedDraft(projectSummary: string, technologyStack: string, additionalConstraints: string): EditedDraft {
  return {
    ...createGeneratedDraft({ projectSummary, technologyStack: linesToItems(technologyStack), additionalConstraints: linesToItems(additionalConstraints) }),
    kind: 'edited',
  }
}

function App() {
  const [projectSummary, setProjectSummary] = useState('')
  const [technologyStack, setTechnologyStack] = useState('')
  const [additionalConstraints, setAdditionalConstraints] = useState('')
  const [draft, setDraft] = useState<EditedDraft | null>(null)

  function updateDraft(updater: (current: EditedDraft) => EditedDraft) {
    setDraft((current) => current ? updater(current) : current)
  }

  function updateRule(category: RuleCategory, index: number, value: string) {
    updateDraft((current) => ({ ...current, commonRuleGroups: current.commonRuleGroups.map((group) => group.category === category ? { ...group, rules: group.rules.map((rule, ruleIndex) => ruleIndex === index ? value : rule) } : group) }))
  }
  function addRule(category: RuleCategory) {
    updateDraft((current) => ({ ...current, commonRuleGroups: current.commonRuleGroups.map((group) => group.category === category ? { ...group, rules: [...group.rules, ''] } : group) }))
  }
  function removeRule(category: RuleCategory, index: number) {
    updateDraft((current) => ({ ...current, commonRuleGroups: current.commonRuleGroups.map((group) => group.category === category && group.rules.length > 1 ? { ...group, rules: group.rules.filter((_, ruleIndex) => ruleIndex !== index) } : group) }))
  }

  if (draft) return <Editor draft={draft} updateDraft={updateDraft} updateRule={updateRule} addRule={addRule} removeRule={removeRule} onBack={() => setDraft(null)} />

  return <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-12 text-slate-900 sm:px-8 sm:py-16">
    <header className="space-y-5"><p className="text-sm font-semibold tracking-wide text-indigo-700">AGENTS.md GENERATOR</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">プロジェクト用のAGENTS.mdを、迷わず作る。</h1><p className="max-w-2xl text-lg leading-8 text-slate-600">概要だけから安全なたたき台を作り、必要な詳細だけを編集できます。入力内容はブラウザの外へ送信・保存しません。</p></header>
    <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="minimum-input-title">
      <h2 id="minimum-input-title" className="text-xl font-bold">まず、プロジェクトについて教えてください</h2><p className="mt-2 leading-7 text-slate-600">プロジェクト概要だけが必須です。コマンドなどの詳細は、次の画面で必要なものだけ追加できます。</p>
      <form className="mt-6 space-y-6" onSubmit={(event) => { event.preventDefault(); setDraft(toEditedDraft(projectSummary, technologyStack, additionalConstraints)) }}>
        <Field id="project-summary" label="プロジェクト概要" required hint="対象ユーザー、解決する課題、提供するものを自由に入力してください。"><textarea id="project-summary" required value={projectSummary} onChange={(event) => setProjectSummary(event.target.value)} rows={5} className="field" /></Field>
        <Field id="technology-stack" label="技術スタック" hint="任意・1行に1項目。例: TypeScript、React"><textarea id="technology-stack" value={technologyStack} onChange={(event) => setTechnologyStack(event.target.value)} rows={3} className="field" /></Field>
        <Field id="additional-constraints" label="追加で守ってほしいこと" hint="任意・1行に1項目。"><textarea id="additional-constraints" value={additionalConstraints} onChange={(event) => setAdditionalConstraints(event.target.value)} rows={3} className="field" /></Field>
        <button className="primary-button" type="submit">たたき台を作成する</button>
      </form>
    </section>
  </main>
}

function Editor({ draft, updateDraft, updateRule, addRule, removeRule, onBack }: { draft: EditedDraft; updateDraft: (updater: (current: EditedDraft) => EditedDraft) => void; updateRule: (category: RuleCategory, index: number, value: string) => void; addRule: (category: RuleCategory) => void; removeRule: (category: RuleCategory, index: number) => void; onBack: () => void }) {
  return <main className="mx-auto min-h-screen max-w-4xl px-6 py-12 text-slate-900 sm:px-8 sm:py-16">
    <header className="space-y-3"><p className="text-sm font-semibold tracking-wide text-indigo-700">たたき台の確認・編集</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">必要な詳細だけを整えてください</h1><p className="leading-7 text-slate-600">「アプリが補完した内容」と「あなたの入力内容」を区別して表示しています。編集した内容が次の最終出力の根拠になります。</p></header>
    <div className="mt-8 space-y-8">
      <section className="editor-section" aria-labelledby="document-title-heading"><h2 id="document-title-heading" className="section-title">文書の基本情報</h2>
        <Field id="document-title" label="文書タイトル" hint={`空の場合は ${DEFAULT_DOCUMENT_TITLE} を使用します。`}><input id="document-title" value={draft.title} onChange={(event) => updateDraft((current) => ({ ...current, title: event.target.value }))} className="field" /></Field>
        <Field id="edited-project-summary" label="プロジェクトの目的" required><textarea id="edited-project-summary" required value={draft.projectSummary} onChange={(event) => updateDraft((current) => ({ ...current, projectSummary: event.target.value }))} rows={5} className="field" /></Field>
      </section>
      <section className="editor-section" aria-labelledby="project-facts-heading"><h2 id="project-facts-heading" className="section-title">あなたの入力内容</h2><EditableLines label="技術スタック" id="edited-technology-stack" value={draft.technologyStack} onChange={(technologyStack) => updateDraft((current) => ({ ...current, technologyStack }))} /><EditableLines label="追加の制約" id="edited-additional-constraints" value={draft.additionalConstraints} onChange={(additionalConstraints) => updateDraft((current) => ({ ...current, additionalConstraints }))} /></section>
      <section className="editor-section" aria-labelledby="commands-heading"><h2 id="commands-heading" className="section-title">プロジェクトコマンド</h2><p className="section-hint">コマンドは未登録です。実行してよいコマンドが分かる場合だけ追加してください。</p>
        {draft.commands.map((command, index) => <div className="command-row" key={index}><label className="sr-only" htmlFor={`command-${index}`}>コマンド {index + 1}</label><input id={`command-${index}`} value={command.command} placeholder="例: pnpm test" className="field" onChange={(event) => updateDraft((current) => ({ ...current, commands: current.commands.map((item, itemIndex) => itemIndex === index ? { ...item, command: event.target.value, label: suggestCommandLabel(event.target.value) || item.label } : item) }))} /><label className="sr-only" htmlFor={`command-label-${index}`}>用途ラベル {index + 1}</label><input id={`command-label-${index}`} value={command.label} placeholder="用途ラベル（任意）" className="field" onChange={(event) => updateDraft((current) => ({ ...current, commands: current.commands.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item) }))} /><button type="button" className="secondary-button" onClick={() => updateDraft((current) => ({ ...current, commands: current.commands.filter((_, itemIndex) => itemIndex !== index) }))}>削除</button></div>)}
        <button type="button" className="secondary-button mt-4" onClick={() => updateDraft((current) => ({ ...current, commands: [...current.commands, { command: '', label: '' }] }))}>コマンドを追加</button>
      </section>
      <section className="editor-section" aria-labelledby="common-rules-heading"><div className="flex flex-wrap items-center gap-3"><h2 id="common-rules-heading" className="section-title">共通ルール</h2><span className="badge">アプリが補完した内容</span></div><p className="section-hint">各カテゴリは少なくとも1件のルールを残してください。</p><div className="mt-5 space-y-6">{RULE_CATEGORIES.map((category) => { const group = draft.commonRuleGroups.find((item) => item.category === category); if (!group) return null; return <fieldset key={category} className="rule-group"><legend className="font-bold">{SECTION_TITLES[category]}</legend><div className="mt-3 space-y-3">{group.rules.map((rule, index) => <div className="rule-row" key={index}><label className="sr-only" htmlFor={`${category}-rule-${index}`}>{SECTION_TITLES[category]} {index + 1}</label><input id={`${category}-rule-${index}`} value={rule} className="field" onChange={(event) => updateRule(category, index, event.target.value)} /><button type="button" className="secondary-button" disabled={group.rules.length === 1} onClick={() => removeRule(category, index)}>削除</button></div>)}</div><button type="button" className="secondary-button mt-3" onClick={() => addRule(category)}>ルールを追加</button></fieldset> })}</div></section>
      <section className="editor-section" aria-labelledby="technology-rules-heading"><div className="flex flex-wrap items-center gap-3"><h2 id="technology-rules-heading" className="section-title">技術固有ルール</h2><span className="badge">アプリが補完した内容</span></div><p className="section-hint">技術スタックに一致した場合だけ候補を表示します。不要なものは削除できます。</p><div className="mt-4 space-y-3">{draft.technologySpecificRules.map((rule, index) => <div className="rule-row" key={index}><label className="sr-only" htmlFor={`technology-rule-${index}`}>技術固有ルール {index + 1}</label><input id={`technology-rule-${index}`} value={rule} className="field" onChange={(event) => updateDraft((current) => ({ ...current, technologySpecificRules: current.technologySpecificRules.map((item, itemIndex) => itemIndex === index ? event.target.value : item) }))} /><button type="button" className="secondary-button" onClick={() => updateDraft((current) => ({ ...current, technologySpecificRules: current.technologySpecificRules.filter((_, itemIndex) => itemIndex !== index) }))}>削除</button></div>)}</div><button type="button" className="secondary-button mt-3" onClick={() => updateDraft((current) => ({ ...current, technologySpecificRules: [...current.technologySpecificRules, ''] }))}>ルールを追加</button></section>
    </div>
    <div className="mt-10 flex flex-wrap gap-3 border-t border-slate-200 pt-6"><button type="button" className="secondary-button" onClick={onBack}>最小入力に戻る</button><p className="self-center text-sm leading-6 text-slate-600">最終プレビュー・コピー・ダウンロードは次の対応で追加予定です。</p></div>
  </main>
}

function Field({ id, label, hint, required, children }: { id: string; label: string; hint?: string; required?: boolean; children: React.ReactNode }) { return <div className="mt-5"><label className="label" htmlFor={id}>{label}{required && <span className="ml-1 text-rose-700">必須</span>}</label>{hint && <p className="field-hint">{hint}</p>}<div className="mt-2">{children}</div></div> }
function EditableLines({ label, id, value, onChange }: { label: string; id: string; value: string[]; onChange: (value: string[]) => void }) { return <div className="mt-5"><label className="label" htmlFor={id}>{label}</label><p className="field-hint">1行に1項目。追加・修正・削除できます。</p><textarea id={id} value={itemsToLines(value)} onChange={(event) => onChange(linesToItems(event.target.value))} rows={Math.max(3, value.length + 1)} className="field mt-2" /></div> }

export default App
