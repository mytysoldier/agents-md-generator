import type { EditedDraft } from '../../model'

interface ProjectDetailsProps {
  draft: EditedDraft
  onChange: React.Dispatch<React.SetStateAction<EditedDraft>>
}

function linesToItems(value: string): string[] {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
}

function EditableLines({ label, id, value, onChange }: { label: string; id: string; value: string[]; onChange: (value: string[]) => void }) {
  return (
    <div className="mt-5">
      <label className="label" htmlFor={id}>{label}</label>
      <p className="field-hint">1行に1項目。追加・修正・削除できます。</p>
      <textarea id={id} value={value.join('\n')} onChange={(event) => onChange(linesToItems(event.target.value))} rows={Math.max(3, value.length + 1)} className="field mt-2" />
    </div>
  )
}

export function ProjectDetails({ draft, onChange }: ProjectDetailsProps) {
  return (
    <section className="editor-section" aria-labelledby="project-facts-heading">
      <h2 id="project-facts-heading" className="section-title">あなたの入力内容</h2>
      <EditableLines label="技術スタック" id="edited-technology-stack" value={draft.technologyStack} onChange={(technologyStack) => onChange((current) => ({ ...current, technologyStack }))} />
      <EditableLines label="追加の制約" id="edited-additional-constraints" value={draft.additionalConstraints} onChange={(additionalConstraints) => onChange((current) => ({ ...current, additionalConstraints }))} />
    </section>
  )
}
