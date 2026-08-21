import { SECTION_TITLES } from '../../generation-templates'
import type { RuleCategory, RuleGroup } from '../../model'

const RULE_CATEGORIES: readonly RuleCategory[] = ['implementation', 'quality', 'git', 'agentWorkflow', 'safety']

interface CommonRulesEditorProps {
  groups: RuleGroup[]
  onRuleChange: (category: RuleCategory, index: number, value: string) => void
  onAddRule: (category: RuleCategory) => void
  onRemoveRule: (category: RuleCategory, index: number) => void
}

export function CommonRulesEditor({ groups, onRuleChange, onAddRule, onRemoveRule }: CommonRulesEditorProps) {
  return (
    <section className="editor-section" aria-labelledby="common-rules-heading">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="common-rules-heading" className="section-title">共通ルール</h2>
        <span className="badge">アプリが補完した内容</span>
      </div>
      <p className="section-hint">各カテゴリは少なくとも1件のルールを残してください。</p>
      <div className="mt-5 space-y-6">
        {RULE_CATEGORIES.map((category) => {
          const group = groups.find((item) => item.category === category)
          if (!group) return null
          return (
            <fieldset key={category} className="rule-group">
              <legend className="font-bold">{SECTION_TITLES[category]}</legend>
              <div className="mt-3 space-y-3">
                {group.rules.map((rule, index) => (
                  <div className="rule-row" key={index}>
                    <label className="sr-only" htmlFor={`${category}-rule-${index}`}>{SECTION_TITLES[category]} {index + 1}</label>
                    <input id={`${category}-rule-${index}`} value={rule} className="field" onChange={(event) => onRuleChange(category, index, event.target.value)} />
                    <button type="button" className="secondary-button" disabled={group.rules.length === 1} onClick={() => onRemoveRule(category, index)}>削除</button>
                  </div>
                ))}
              </div>
              <button type="button" className="secondary-button mt-3" onClick={() => onAddRule(category)}>ルールを追加</button>
            </fieldset>
          )
        })}
      </div>
    </section>
  )
}
