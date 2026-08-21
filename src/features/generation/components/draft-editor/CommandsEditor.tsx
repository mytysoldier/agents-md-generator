import { useState } from 'react'
import { suggestCommandLabel } from '../../generator'
import type { ProjectCommand } from '../../model'

interface CommandsEditorProps {
  commands: ProjectCommand[]
  onChange: (commands: ProjectCommand[]) => void
}

export function CommandsEditor({ commands, onChange }: CommandsEditorProps) {
  const [manualLabelIndexes, setManualLabelIndexes] = useState<Set<number>>(new Set())

  function updateCommand(index: number, command: string) {
    onChange(commands.map((item, itemIndex) => itemIndex === index
      ? { ...item, command, label: manualLabelIndexes.has(index) ? item.label : suggestCommandLabel(command) }
      : item))
  }

  function updateLabel(index: number, label: string) {
    setManualLabelIndexes((current) => new Set(current).add(index))
    onChange(commands.map((item, itemIndex) => itemIndex === index ? { ...item, label } : item))
  }

  function removeCommand(index: number) {
    setManualLabelIndexes((current) => new Set([...current].filter((itemIndex) => itemIndex !== index).map((itemIndex) => itemIndex > index ? itemIndex - 1 : itemIndex)))
    onChange(commands.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <section className="editor-section" aria-labelledby="commands-heading">
      <h2 id="commands-heading" className="section-title">プロジェクトコマンド</h2>
      {commands.length === 0 && <p className="section-hint">コマンドは未登録です。実行してよいコマンドが分かる場合だけ追加してください。</p>}
      {commands.map((command, index) => (
        <div className="command-row" key={index}>
          <label className="sr-only" htmlFor={`command-${index}`}>コマンド {index + 1}</label>
          <input id={`command-${index}`} value={command.command} placeholder="例: pnpm test" className="field" onChange={(event) => updateCommand(index, event.target.value)} />
          <label className="sr-only" htmlFor={`command-label-${index}`}>用途ラベル {index + 1}</label>
          <input id={`command-label-${index}`} value={command.label} placeholder="用途ラベル（任意）" className="field" onChange={(event) => updateLabel(index, event.target.value)} />
          <button type="button" className="secondary-button" onClick={() => removeCommand(index)}>削除</button>
        </div>
      ))}
      <button type="button" className="secondary-button mt-4" onClick={() => onChange([...commands, { command: '', label: '' }])}>コマンドを追加</button>
    </section>
  )
}
