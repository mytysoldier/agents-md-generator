import { useState } from 'react'
import { DraftEditor } from './features/generation/components/draft-editor/DraftEditor'
import { MinimumInputForm } from './features/generation/components/minimum-input/MinimumInputForm'
import type { MinimumInputValues } from './features/generation/components/minimum-input/MinimumInputForm'
import { createGeneratedDraft } from './features/generation/generator'
import type { EditedDraft } from './features/generation/model'

const EMPTY_MINIMUM_INPUT: MinimumInputValues = { projectSummary: '', technologyStack: '', additionalConstraints: '' }

function hasSameItems(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((item, index) => item === right[index])
}

function reconcileTechnologyRules(savedDraft: EditedDraft, nextDraft: EditedDraft): Pick<EditedDraft, 'technologySpecificRules' | 'technologySpecificRuleSources' | 'removedTechnologySpecificRuleSources'> {
  const savedSources = savedDraft.technologySpecificRuleSources ?? createGeneratedDraft(savedDraft).technologySpecificRules
  const nextSources = nextDraft.technologySpecificRuleSources ?? nextDraft.technologySpecificRules
  const removedSources = savedDraft.removedTechnologySpecificRuleSources ?? []
  const retainedRules = savedDraft.technologySpecificRules.flatMap((rule, index) => {
    const source = savedSources[index] ?? null
    return source === null || nextSources.includes(source) ? [{ rule, source }] : []
  })
  const retainedSources = new Set(retainedRules.map(({ source }) => source).filter((source): source is string => source !== null))
  const newRules = nextDraft.technologySpecificRules.flatMap((rule, index) => {
    const source = nextSources[index] ?? rule
    return retainedSources.has(source) || removedSources.includes(source) ? [] : [{ rule, source }]
  })
  const rules = [...retainedRules, ...newRules]

  return {
    technologySpecificRules: rules.map(({ rule }) => rule),
    technologySpecificRuleSources: rules.map(({ source }) => source),
    removedTechnologySpecificRuleSources: removedSources,
  }
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
          ...(hasSameItems(savedDraft.technologyStack, nextDraft.technologyStack)
            ? {}
            : reconcileTechnologyRules(savedDraft, nextDraft)),
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
