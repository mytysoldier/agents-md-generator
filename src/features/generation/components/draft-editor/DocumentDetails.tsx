import { useState } from 'react'
import { DEFAULT_DOCUMENT_TITLE } from '../../model'
import type { EditedDraft } from '../../model'
import { Field } from '../form/Field'

interface DocumentDetailsProps {
  draft: EditedDraft
  onChange: React.Dispatch<React.SetStateAction<EditedDraft>>
  titleRef: React.RefObject<HTMLInputElement | null>
  projectSummaryRef: React.RefObject<HTMLTextAreaElement | null>
}

export function DocumentDetails({ draft, onChange, titleRef, projectSummaryRef }: DocumentDetailsProps) {
  const [projectSummaryError, setProjectSummaryError] = useState('')

  function updateProjectSummary(value: string) {
    if (!value.trim()) {
      setProjectSummaryError('プロジェクトの目的を入力してください。')
      return
    }
    setProjectSummaryError('')
    onChange((current) => ({ ...current, projectSummary: value }))
  }

  return (
    <section className="editor-section" aria-labelledby="document-title-heading">
      <h2 id="document-title-heading" className="section-title">文書の基本情報</h2>
      <Field id="document-title" label="文書タイトル" hint={`空の場合は ${DEFAULT_DOCUMENT_TITLE} を使用します。`}>
        <input ref={titleRef} id="document-title" value={draft.title} onChange={(event) => onChange((current) => ({ ...current, title: event.target.value }))} className="field" />
      </Field>
      <Field id="edited-project-summary" label="プロジェクトの目的" required>
        <textarea ref={projectSummaryRef} id="edited-project-summary" required value={draft.projectSummary} onChange={(event) => updateProjectSummary(event.target.value)} rows={5} className="field" aria-invalid={Boolean(projectSummaryError)} aria-describedby={projectSummaryError ? 'edited-project-summary-error' : undefined} />
      </Field>
      {projectSummaryError && <p id="edited-project-summary-error" className="text-sm text-rose-700" role="alert">{projectSummaryError}</p>}
    </section>
  )
}
