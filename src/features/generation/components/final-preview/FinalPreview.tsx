import { useState } from 'react'

interface FinalPreviewProps {
  markdown: string
  onBack: () => void
}

export function FinalPreview({ markdown, onBack }: FinalPreviewProps) {
  const [message, setMessage] = useState('')

  async function copyMarkdown() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API is unavailable.')
      await navigator.clipboard.writeText(markdown)
      setMessage('AGENTS.mdをコピーしました。')
    } catch {
      setMessage('コピーできませんでした。ブラウザの権限を確認するか、プレビューからコピーしてください。')
    }
  }

  function downloadMarkdown() {
    try {
      if (!URL.createObjectURL) throw new Error('Download API is unavailable.')
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'AGENTS.md'
      link.click()
      URL.revokeObjectURL(url)
      setMessage('AGENTS.mdをダウンロードしました。')
    } catch {
      setMessage('ダウンロードできませんでした。プレビューの内容をコピーして保存してください。')
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12 text-slate-900 sm:px-8 sm:py-16">
      <header className="space-y-3">
        <p className="text-sm font-semibold tracking-wide text-indigo-700">最終Markdownプレビュー</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">AGENTS.mdを確認してください</h1>
        <p className="leading-7 text-slate-600">内容を確認してからコピーまたはダウンロードしてください。</p>
      </header>
      <pre className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-6 shadow-sm"><code>{markdown}</code></pre>
      <div className="mt-10 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
        <button type="button" className="secondary-button" onClick={onBack}>たたき台の編集に戻る</button>
        <button type="button" className="secondary-button" onClick={() => void copyMarkdown()}>コピーする</button>
        <button type="button" className="primary-button" onClick={downloadMarkdown}>AGENTS.mdをダウンロードする</button>
      </div>
      {message && <p className="mt-4 text-sm leading-6 text-slate-700" role="status">{message}</p>}
    </main>
  )
}
