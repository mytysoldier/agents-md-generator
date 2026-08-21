interface TechnologyRulesEditorProps {
  rules: string[]
  onChange: (rules: string[]) => void
}

export function TechnologyRulesEditor({ rules, onChange }: TechnologyRulesEditorProps) {
  return (
    <section className="editor-section" aria-labelledby="technology-rules-heading">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="technology-rules-heading" className="section-title">技術固有ルール</h2>
        <span className="badge">アプリが補完した内容</span>
      </div>
      <p className="section-hint">技術スタックに一致した場合だけ候補を表示します。不要なものは削除できます。</p>
      <div className="mt-4 space-y-3">
        {rules.map((rule, index) => (
          <div className="rule-row" key={index}>
            <label className="sr-only" htmlFor={`technology-rule-${index}`}>技術固有ルール {index + 1}</label>
            <input id={`technology-rule-${index}`} value={rule} className="field" onChange={(event) => onChange(rules.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
            <button type="button" className="secondary-button" onClick={() => onChange(rules.filter((_, itemIndex) => itemIndex !== index))}>削除</button>
          </div>
        ))}
      </div>
      <button type="button" className="secondary-button mt-3" onClick={() => onChange([...rules, ''])}>ルールを追加</button>
    </section>
  )
}
