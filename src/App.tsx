function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-16 text-slate-900 sm:px-8">
      <header className="space-y-5">
        <p className="text-sm font-semibold tracking-wide text-indigo-700">AGENTS.md GENERATOR</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">プロジェクト用のAGENTS.mdを、迷わず作る。</h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">いくつかの質問に答えるだけで、AIエージェントへ渡す作業ルールの雛形を生成します。</p>
      </header>
      <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="next-steps-title">
        <h2 id="next-steps-title" className="text-xl font-bold">準備中です</h2>
        <p className="mt-3 leading-7 text-slate-600">質問フォームとAGENTS.mdの生成機能を順次追加します。入力した内容は、初期リリースではブラウザの外へ送信・保存しません。</p>
      </section>
    </main>
  )
}

export default App
