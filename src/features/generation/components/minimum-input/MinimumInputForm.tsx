import { useRef, useState } from 'react'
import { createGeneratedDraft } from '../../generator'
import type { EditedDraft } from '../../model'
import { Field } from '../form/Field'
import { StaticInformation } from '../../../../components/StaticInformation'

export interface MinimumInputValues {
  projectSummary: string
  technologyStack: string
  additionalConstraints: string
}

interface MinimumInputFormProps {
  initialValues: MinimumInputValues
  onCreateDraft: (draft: EditedDraft, values: MinimumInputValues) => void
}

function linesToItems(value: string): string[] {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
}

export function MinimumInputForm({ initialValues, onCreateDraft }: MinimumInputFormProps) {
  const [projectSummary, setProjectSummary] = useState(initialValues.projectSummary)
  const [technologyStack, setTechnologyStack] = useState(initialValues.technologyStack)
  const [additionalConstraints, setAdditionalConstraints] = useState(initialValues.additionalConstraints)
  const [projectSummaryError, setProjectSummaryError] = useState('')
  const projectSummaryRef = useRef<HTMLTextAreaElement>(null)

  function createDraft() {
    const generatedDraft = createGeneratedDraft({ projectSummary, technologyStack: linesToItems(technologyStack), additionalConstraints: linesToItems(additionalConstraints) })
    if (!generatedDraft.projectSummary) {
      setProjectSummaryError('プロジェクト概要を入力してください。')
      projectSummaryRef.current?.focus()
      return
    }
    setProjectSummaryError('')
    onCreateDraft({ ...generatedDraft, kind: 'edited' }, { projectSummary, technologyStack, additionalConstraints })
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-12 text-slate-900 sm:px-8 sm:py-16">
      <header className="space-y-5">
        <p className="text-sm font-semibold tracking-wide text-indigo-700">AGENTS.md GENERATOR</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">プロジェクト用のAGENTS.mdを、迷わず作る。</h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">概要だけから安全なたたき台を作り、必要な詳細だけを編集できます。入力内容はブラウザの外へ送信・保存しません。</p>
      </header>
      <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="minimum-input-title">
        <h2 id="minimum-input-title" className="text-xl font-bold">まず、プロジェクトについて教えてください</h2>
        <p className="mt-2 leading-7 text-slate-600">プロジェクト概要だけが必須です。コマンドなどの詳細は、次の画面で必要なものだけ追加できます。</p>
        <form className="mt-6 space-y-6" onSubmit={(event) => { event.preventDefault(); createDraft() }}>
          <Field id="project-summary" label="プロジェクト概要" required hint="対象ユーザー、解決する課題、提供するものを自由に入力してください。">
            <textarea ref={projectSummaryRef} id="project-summary" required value={projectSummary} onChange={(event) => { setProjectSummary(event.target.value); setProjectSummaryError('') }} rows={5} className="field" placeholder="例: 個人開発者がタスクを登録・整理し、日々の作業を管理できるWebアプリ" aria-invalid={Boolean(projectSummaryError)} aria-describedby={projectSummaryError ? 'project-summary-error' : undefined} />
          </Field>
          {projectSummaryError && <p id="project-summary-error" className="text-sm text-rose-700" role="alert">{projectSummaryError}</p>}
          <Field id="technology-stack" label="技術スタック" hint="任意・1行に1項目。例: TypeScript、React">
            <textarea id="technology-stack" value={technologyStack} onChange={(event) => setTechnologyStack(event.target.value)} rows={3} className="field" />
          </Field>
          <Field id="additional-constraints" label="追加で守ってほしいこと" hint="任意・1行に1項目。例: 秘密情報をコミットしない、変更後はテストを実行する">
            <textarea id="additional-constraints" value={additionalConstraints} onChange={(event) => setAdditionalConstraints(event.target.value)} rows={3} className="field" />
          </Field>
          <button className="primary-button" type="submit">たたき台を作成する</button>
        </form>
      </section>
      <StaticInformation />
    </main>
  )
}
