import { useState } from 'react'
import { DraftEditor } from './features/generation/components/draft-editor/DraftEditor'
import { MinimumInputForm } from './features/generation/components/minimum-input/MinimumInputForm'
import type { MinimumInputValues } from './features/generation/components/minimum-input/MinimumInputForm'
import { createGeneratedDraft } from './features/generation/generator'
import type { EditedDraft } from './features/generation/model'

const EMPTY_MINIMUM_INPUT: MinimumInputValues = { projectSummary: '', technologyStack: '', additionalConstraints: '' }

function reconcileTechnologyRules(savedDraft: EditedDraft, nextDraft: EditedDraft | ReturnType<typeof createGeneratedDraft>): Pick<EditedDraft, 'technologySpecificRules' | 'technologySpecificRuleSources' | 'removedTechnologySpecificRuleSources'> {
  const savedSources = savedDraft.technologySpecificRuleSources ?? createGeneratedDraft(savedDraft).technologySpecificRules
  const nextSources = nextDraft.technologySpecificRuleSources ?? nextDraft.technologySpecificRules
  const removedSources = savedDraft.removedTechnologySpecificRuleSources ?? []
  const savedRulesBySource = new Map(savedDraft.technologySpecificRules.flatMap((rule, index) => {
    const source = savedSources[index]
    return source ? [[source, rule]] : []
  }))
  const generatedRules = nextDraft.technologySpecificRules.flatMap((rule, index) => {
    const source = nextSources[index] ?? rule
    return removedSources.includes(source) ? [] : [{ rule: savedRulesBySource.get(source) ?? rule, source }]
  })
  const customRules = nextDraft.technologySpecificRules.length > 0
    ? savedDraft.technologySpecificRules.flatMap((rule, index) => savedSources[index] === null ? [{ rule, source: null }] : [])
    : []
  const rules = [...generatedRules, ...customRules]

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
    const draftToSave = { ...editedDraft, ...reconcileTechnologyRules(editedDraft, createGeneratedDraft(editedDraft)) }
    setMinimumInput({
      projectSummary: draftToSave.projectSummary,
      technologyStack: draftToSave.technologyStack.join('\n'),
      additionalConstraints: draftToSave.additionalConstraints.join('\n'),
    })
    setSavedDraft(draftToSave)
    setDraft(null)
  }

  function createDraft(nextDraft: EditedDraft, values: MinimumInputValues) {
    const draftToEdit = savedDraft
      ? {
          ...savedDraft,
          projectSummary: nextDraft.projectSummary,
          technologyStack: nextDraft.technologyStack,
          additionalConstraints: nextDraft.additionalConstraints,
          ...reconcileTechnologyRules(savedDraft, nextDraft),
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
