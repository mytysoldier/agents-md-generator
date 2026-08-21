import { DEFAULT_DOCUMENT_TITLE } from '../../model'
import type { EditedDraft } from '../../model'
import { Field } from '../form/Field'

interface DocumentDetailsProps {
  draft: EditedDraft
  onChange: React.Dispatch<React.SetStateAction<EditedDraft>>
}

export function DocumentDetails({ draft, onChange }: DocumentDetailsProps) {
  return (
    <section className="editor-section" aria-labelledby="document-title-heading">
      <h2 id="document-title-heading" className="section-title">文書の基本情報</h2>
      <Field id="document-title" label="文書タイトル" hint={`空の場合は ${DEFAULT_DOCUMENT_TITLE} を使用します。`}>
        <input id="document-title" value={draft.title} onChange={(event) => onChange((current) => ({ ...current, title: event.target.value }))} className="field" />
      </Field>
      <Field id="edited-project-summary" label="プロジェクトの目的" required>
        <textarea id="edited-project-summary" required value={draft.projectSummary} onChange={(event) => onChange((current) => ({ ...current, projectSummary: event.target.value }))} rows={5} className="field" />
      </Field>
    </section>
  )
}
