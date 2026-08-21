import { useState } from 'react'
import { DraftEditor } from './features/generation/components/DraftEditor'
import { MinimumInputForm } from './features/generation/components/MinimumInputForm'
import type { EditedDraft } from './features/generation/model'

function App() {
  const [draft, setDraft] = useState<EditedDraft | null>(null)

  if (draft) {
    return <DraftEditor draft={draft} onBack={() => setDraft(null)} />
  }

  return <MinimumInputForm onCreateDraft={setDraft} />
}

export default App
