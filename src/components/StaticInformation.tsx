export function StaticInformation() {
  return (
    <footer className="mt-12 border-t border-slate-200 pt-6 text-sm leading-6 text-slate-600" aria-label="利用上の注意とプライバシー">
      <details className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <summary className="cursor-pointer font-bold text-slate-800">利用上の注意・プライバシー</summary>
        <div className="mt-4 space-y-4">
          <section aria-labelledby="data-handling-title">
            <h2 id="data-handling-title" className="font-bold text-slate-800">入力データの扱い</h2>
            <p className="mt-1">入力内容と生成結果はこのブラウザ内でだけ扱い、外部へ自動送信・自動保存されません。端末にも、あなたがダウンロードを選んだ場合を除いて保存しません。アカウント登録や利用状況の分析も行いません。ページを再読み込みするか閉じると、入力内容は失われます。</p>
          </section>
          <section aria-labelledby="output-notice-title">
            <h2 id="output-notice-title" className="font-bold text-slate-800">生成結果について</h2>
            <p className="mt-1">外部AI APIは使用せず、入力内容と固定テンプレートから決定的に生成します。生成結果がプロジェクトの実情や運用方針に合っているか、利用前に必ず確認・編集してください。</p>
          </section>
          <section aria-labelledby="contact-title">
            <h2 id="contact-title" className="font-bold text-slate-800">お問い合わせ・不具合報告</h2>
            <p className="mt-1"><a className="font-semibold text-indigo-700 underline hover:text-indigo-900" href="https://github.com/mytysoldier/agents-md-generator/issues">GitHub Issues</a> からお知らせください。</p>
          </section>
          <section aria-labelledby="licenses-title">
            <h2 id="licenses-title" className="font-bold text-slate-800">ライセンス・第三者素材</h2>
            <p className="mt-1">このアプリは第三者の画像・素材を使用していません。利用しているオープンソースソフトウェアには、それぞれのライセンスが適用されます。</p>
          </section>
        </div>
      </details>
    </footer>
  )
}
