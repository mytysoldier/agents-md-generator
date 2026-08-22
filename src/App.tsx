import { useState } from 'react'
import { DraftEditor } from './features/generation/components/draft-editor/DraftEditor'
import { MinimumInputForm } from './features/generation/components/minimum-input/MinimumInputForm'
import type { MinimumInputValues } from './features/generation/components/minimum-input/MinimumInputForm'
import type { EditedDraft } from './features/generation/model'

const EMPTY_MINIMUM_INPUT: MinimumInputValues = { projectSummary: '', technologyStack: '', additionalConstraints: '' }

function hasSameItems(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((item, index) => item === right[index])
}

function App() {
  const [draft, setDraft] = useState<EditedDraft | null>(null)
  const [savedDraft, setSavedDraft] = useState<EditedDraft | null>(null)
  const [minimumInput, setMinimumInput] = useState<MinimumInputValues>(EMPTY_MINIMUM_INPUT)

  function returnToMinimumInput(editedDraft: EditedDraft) {
    setMinimumInput({
      projectSummary: editedDraft.projectSummary,
      technologyStack: editedDraft.technologyStack.join('\n'),
      additionalConstraints: editedDraft.additionalConstraints.join('\n'),
    })
    setSavedDraft(editedDraft)
    setDraft(null)
  }

  function createDraft(nextDraft: EditedDraft, values: MinimumInputValues) {
    const draftToEdit = savedDraft
      ? {
          ...savedDraft,
          projectSummary: nextDraft.projectSummary,
          technologyStack: nextDraft.technologyStack,
          additionalConstraints: nextDraft.additionalConstraints,
          technologySpecificRules: hasSameItems(savedDraft.technologyStack, nextDraft.technologyStack)
            ? savedDraft.technologySpecificRules
            : nextDraft.technologySpecificRules,
        }
      : nextDraft
    setMinimumInput(values)
    setSavedDraft(null)
    setDraft(draftToEdit)
  }

  if (draft) {
    return <DraftEditor draft={draft} onBack={returnToMinimumInput} />
  }

  return <MinimumInputForm initialValues={minimumInput} onCreateDraft={createDraft} />
}

export default App
