import { useState } from 'react'
import { DraftEditor } from './features/generation/components/draft-editor/DraftEditor'
import { MinimumInputForm } from './features/generation/components/minimum-input/MinimumInputForm'
import type { MinimumInputValues } from './features/generation/components/minimum-input/MinimumInputForm'
import type { EditedDraft } from './features/generation/model'

const EMPTY_MINIMUM_INPUT: MinimumInputValues = { projectSummary: '', technologyStack: '', additionalConstraints: '' }

function App() {
  const [draft, setDraft] = useState<EditedDraft | null>(null)
  const [minimumInput, setMinimumInput] = useState<MinimumInputValues>(EMPTY_MINIMUM_INPUT)

  function returnToMinimumInput(editedDraft: EditedDraft) {
    setMinimumInput({
      projectSummary: editedDraft.projectSummary,
      technologyStack: editedDraft.technologyStack.join('\n'),
      additionalConstraints: editedDraft.additionalConstraints.join('\n'),
    })
    setDraft(null)
  }

  if (draft) {
    return <DraftEditor draft={draft} onBack={returnToMinimumInput} />
  }

  return <MinimumInputForm initialValues={minimumInput} onCreateDraft={(nextDraft, values) => { setMinimumInput(values); setDraft(nextDraft) }} />
}

export default App
