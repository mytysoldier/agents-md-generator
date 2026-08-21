import { suggestCommandLabel } from '../../generator'
import type { ProjectCommand } from '../../model'

interface CommandsEditorProps {
  commands: ProjectCommand[]
  onChange: (commands: ProjectCommand[]) => void
}

export function CommandsEditor({ commands, onChange }: CommandsEditorProps) {
  function updateCommand(index: number, command: string) {
    onChange(commands.map((item, itemIndex) => itemIndex === index
      ? { ...item, command, label: suggestCommandLabel(command) || item.label }
      : item))
  }

  return (
    <section className="editor-section" aria-labelledby="commands-heading">
      <h2 id="commands-heading" className="section-title">プロジェクトコマンド</h2>
      <p className="section-hint">コマンドは未登録です。実行してよいコマンドが分かる場合だけ追加してください。</p>
      {commands.map((command, index) => (
        <div className="command-row" key={index}>
          <label className="sr-only" htmlFor={`command-${index}`}>コマンド {index + 1}</label>
          <input id={`command-${index}`} value={command.command} placeholder="例: pnpm test" className="field" onChange={(event) => updateCommand(index, event.target.value)} />
          <label className="sr-only" htmlFor={`command-label-${index}`}>用途ラベル {index + 1}</label>
          <input id={`command-label-${index}`} value={command.label} placeholder="用途ラベル（任意）" className="field" onChange={(event) => onChange(commands.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} />
          <button type="button" className="secondary-button" onClick={() => onChange(commands.filter((_, itemIndex) => itemIndex !== index))}>削除</button>
        </div>
      ))}
      <button type="button" className="secondary-button mt-4" onClick={() => onChange([...commands, { command: '', label: '' }])}>コマンドを追加</button>
    </section>
  )
}
