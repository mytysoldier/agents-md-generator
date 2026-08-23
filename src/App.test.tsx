import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App'
import { DraftEditor } from './features/generation/components/draft-editor/DraftEditor'
import { FinalPreview } from './features/generation/components/final-preview/FinalPreview'
import { createGeneratedDraft } from './features/generation/generator'

describe('アプリケーション', () => {
  it('概要だけを入力して、コマンドを要求せずにたたき台を作成できる', () => {
    // Arrange
    render(<App />)
    // Act
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: '在庫を管理するWebアプリ' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    // Assert
    expect(screen.getByRole('heading', { name: '必要な詳細だけを整えてください' })).toBeInTheDocument()
    expect(screen.getByText('コマンドは未登録です。実行してよいコマンドが分かる場合だけ追加してください。')).toBeInTheDocument()
  })

  it('空白だけのプロジェクト概要ではたたき台を作成しない', () => {
    // Arrange
    render(<App />)

    // Act
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: ' \n\t ' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('プロジェクト概要を入力してください。')
    expect(screen.getByLabelText('プロジェクト概要必須')).toHaveFocus()
    expect(screen.queryByRole('heading', { name: '必要な詳細だけを整えてください' })).not.toBeInTheDocument()
  })

  it('編集画面の必須入力と最終生成操作はラベル付きで利用できる', () => {
    // Arrange
    render(<App />)

    // Act
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Assert
    expect(screen.getByRole('textbox', { name: /プロジェクトの目的\s*必須/ })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: '文書タイトル' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'AGENTS.mdを生成する' })).toBeInTheDocument()
  })

  it('主要な操作は名前付きのボタンとラベル付き入力として利用できる', () => {
    // Arrange
    render(<App />)

    // Act
    const projectSummary = screen.getByRole('textbox', { name: /プロジェクト概要\s*必須/ })
    const createDraftButton = screen.getByRole('button', { name: 'たたき台を作成する' })

    // Assert
    expect(projectSummary).toBeInTheDocument()
    expect(createDraftButton).toBeInTheDocument()
  })

  it('追加の制約に1行ごとの具体的な入力例を表示する', () => {
    // Arrange
    render(<App />)

    // Act
    const additionalConstraints = screen.getByLabelText('追加で守ってほしいこと')

    // Assert
    expect(additionalConstraints).toBeInTheDocument()
    expect(screen.getByText('任意・1行に1項目。例: 秘密情報をコミットしない、変更後はテストを実行する')).toBeInTheDocument()
  })

  it('最小入力画面から利用上の注意とプライバシーを確認できる', () => {
    // Arrange
    render(<App />)

    // Act
    fireEvent.click(screen.getByText('利用上の注意・プライバシー'))

    // Assert
    expect(screen.getByRole('heading', { name: '入力データの扱い' })).toBeInTheDocument()
  })

  it('たたき台編集画面から利用上の注意とプライバシーを確認できる', () => {
    // Arrange
    const draft = { ...createGeneratedDraft({ projectSummary: 'Webアプリ' }), kind: 'edited' as const }
    render(<DraftEditor draft={draft} onBack={() => {}} onGenerate={() => {}} />)

    // Act
    fireEvent.click(screen.getByText('利用上の注意・プライバシー'))

    // Assert
    expect(screen.getByRole('heading', { name: '入力データの扱い' })).toBeInTheDocument()
  })

  it('最終プレビュー画面から利用上の注意とプライバシーを確認できる', () => {
    // Arrange
    render(<FinalPreview markdown="# AGENTS.md\n" onBack={() => {}} />)

    // Act
    fireEvent.click(screen.getByText('利用上の注意・プライバシー'))

    // Assert
    expect(screen.getByRole('heading', { name: '入力データの扱い' })).toBeInTheDocument()
  })

  it('静的情報に実装と一致する入力データの扱い、生成結果の注意、問い合わせ先を表示する', () => {
    // Arrange
    render(<App />)

    // Act
    fireEvent.click(screen.getByText('利用上の注意・プライバシー'))

    // Assert
    expect(screen.getByText(/外部へ自動送信・自動保存されません/)).toBeInTheDocument()
    expect(screen.getByText(/ダウンロードを選んだ場合を除いて保存しません/)).toBeInTheDocument()
    expect(screen.getByText(/外部AI APIは使用せず/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'GitHub Issues' })).toHaveAttribute('href', 'https://github.com/mytysoldier/agents-md-generator/issues')
  })

  it('最終生成で例外が起きてもクラッシュせず、エラーを表示する', () => {
    // Arrange
    const draft = { ...createGeneratedDraft({ projectSummary: 'Webアプリ' }), kind: 'edited' as const }
    render(<DraftEditor draft={draft} onBack={() => {}} onGenerate={() => { throw new Error('生成に失敗しました。') }} />)

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'AGENTS.mdを生成する' }))

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('AGENTS.mdを生成できませんでした。')
    expect(screen.getByRole('heading', { name: '必要な詳細だけを整えてください' })).toBeInTheDocument()
  })

  it('編集画面でプロジェクトの目的を空にしない', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Act
    fireEvent.change(screen.getByLabelText('プロジェクトの目的必須'), { target: { value: '  \n ' } })

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('プロジェクトの目的を入力してください。')
    expect(screen.getByLabelText('プロジェクトの目的必須')).toHaveValue('Webアプリ')
  })
  it('補完ルールを編集し、コマンドを追加して削除できる', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    // Act
    fireEvent.change(screen.getByLabelText('実装方針とコーディング規約 1'), { target: { value: '既存の方針を守る。' } })
    fireEvent.click(screen.getByRole('button', { name: 'コマンドを追加' }))
    fireEvent.change(screen.getByLabelText('コマンド 1'), { target: { value: 'pnpm test' } })
    // Assert
    expect(screen.getByDisplayValue('既存の方針を守る。')).toBeInTheDocument()
    expect(screen.getByDisplayValue('テスト')).toBeInTheDocument()
    expect(screen.queryByText('コマンドは未登録です。実行してよいコマンドが分かる場合だけ追加してください。')).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: '削除' })[0])
    expect(screen.queryByLabelText('コマンド 1')).not.toBeInTheDocument()
  })

  it('空のコマンド行は未登録として案内を表示する', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'コマンドを追加' }))

    // Assert
    expect(screen.getByText('コマンドは未登録です。実行してよいコマンドが分かる場合だけ追加してください。')).toBeInTheDocument()
  })

  it('技術スタックの新しい行を維持し、編集したコマンド用途ラベルを上書きしない', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Act
    const technologyStack = screen.getByLabelText('技術スタック')
    fireEvent.change(technologyStack, { target: { value: 'TypeScript\n' } })
    fireEvent.change(technologyStack, { target: { value: 'TypeScript\nReact' } })
    fireEvent.click(screen.getByRole('button', { name: 'コマンドを追加' }))
    fireEvent.change(screen.getByLabelText('コマンド 1'), { target: { value: 'pnpm test' } })
    fireEvent.change(screen.getByLabelText('用途ラベル 1'), { target: { value: '単体テスト' } })
    fireEvent.change(screen.getByLabelText('コマンド 1'), { target: { value: 'pnpm test --watch' } })
    expect(screen.getByLabelText('用途ラベル 1')).toHaveValue('単体テスト')
    fireEvent.change(screen.getByLabelText('用途ラベル 1'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('コマンド 1'), { target: { value: 'pnpm test --watch --runInBand' } })

    // Assert
    expect(technologyStack).toHaveValue('TypeScript\nReact')
    expect(screen.getByLabelText('用途ラベル 1')).toHaveValue('')
    expect(screen.queryByRole('heading', { name: '技術固有ルール' })).not.toBeInTheDocument()
  })

  it('技術固有ルールを実装方針の直後に表示する', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'TypeScript' } })

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Assert
    const technologyRules = screen.getByRole('heading', { name: '技術固有ルール' })
    const qualityRules = screen.getByText('テスト・品質確認')
    expect(technologyRules.compareDocumentPosition(qualityRules) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('最後の共通ルールを空にしない', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    const secondQualityRule = screen.getByLabelText('テスト・品質確認 2')
    const removeButton = secondQualityRule.parentElement?.querySelector('button')
    if (!removeButton) throw new Error('削除ボタンが見つかりません。')
    fireEvent.click(removeButton)
    const qualityRule = screen.getByLabelText('テスト・品質確認 1')
    const originalValue = qualityRule.getAttribute('value')

    // Act
    fireEvent.change(qualityRule, { target: { value: '' } })

    // Assert
    expect(qualityRule).toHaveValue(originalValue ?? '')
  })

  it('最後以外の共通ルールを空にした編集は削除として扱う', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Act
    fireEvent.change(screen.getByLabelText('テスト・品質確認 2'), { target: { value: '  ' } })

    // Assert
    expect(screen.queryByLabelText('テスト・品質確認 2')).not.toBeInTheDocument()
  })

  it('空の追加ルールを残しても最後の有効な共通ルールを削除できない', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    const secondQualityRule = screen.getByLabelText('テスト・品質確認 2')
    const removeButton = secondQualityRule.parentElement?.querySelector('button')
    if (!removeButton) throw new Error('削除ボタンが見つかりません。')
    fireEvent.click(removeButton)

    // Act
    fireEvent.click(screen.getAllByRole('button', { name: 'ルールを追加' })[1])

    // Assert
    const qualityRule = screen.getByLabelText('テスト・品質確認 1')
    expect(qualityRule.parentElement?.querySelector('button')).toBeDisabled()
  })

  it('最小入力へ戻ったときに編集済みの入力値を保持する', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'TypeScript' } })
    fireEvent.change(screen.getByLabelText('追加で守ってほしいこと'), { target: { value: '差分を小さくする' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    fireEvent.change(screen.getByLabelText('プロジェクトの目的必須'), { target: { value: '編集済みのWebアプリ' } })
    fireEvent.change(screen.getByLabelText('文書タイトル'), { target: { value: 'CUSTOM.md' } })
    fireEvent.click(screen.getByRole('button', { name: 'コマンドを追加' }))
    fireEvent.change(screen.getByLabelText('コマンド 1'), { target: { value: 'pnpm test' } })
    fireEvent.change(screen.getByLabelText('用途ラベル 1'), { target: { value: '単体テスト' } })

    // Act
    fireEvent.click(screen.getByRole('button', { name: '最小入力に戻る' }))

    // Assert
    expect(screen.getByLabelText('プロジェクト概要必須')).toHaveValue('編集済みのWebアプリ')
    expect(screen.getByLabelText('技術スタック')).toHaveValue('TypeScript')
    expect(screen.getByLabelText('追加で守ってほしいこと')).toHaveValue('差分を小さくする')
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    expect(screen.getByLabelText('文書タイトル')).toHaveValue('CUSTOM.md')
    expect(screen.getByLabelText('コマンド 1')).toHaveValue('pnpm test')
    fireEvent.change(screen.getByLabelText('コマンド 1'), { target: { value: 'pnpm test --watch' } })
    expect(screen.getByLabelText('用途ラベル 1')).toHaveValue('単体テスト')
  })

  it('空の追加ルールがあっても最後の有効ルールを空にしない', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    const secondQualityRule = screen.getByLabelText('テスト・品質確認 2')
    const removeButton = secondQualityRule.parentElement?.querySelector('button')
    if (!removeButton) throw new Error('削除ボタンが見つかりません。')
    fireEvent.click(removeButton)
    fireEvent.click(screen.getAllByRole('button', { name: 'ルールを追加' })[1])
    const qualityRule = screen.getByLabelText('テスト・品質確認 1')
    const originalValue = qualityRule.getAttribute('value')

    // Act
    fireEvent.change(qualityRule, { target: { value: '' } })

    // Assert
    expect(qualityRule).toHaveValue(originalValue ?? '')
  })

  it('空にした用途ラベルを画面遷移後も自動補完しない', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    fireEvent.click(screen.getByRole('button', { name: 'コマンドを追加' }))
    fireEvent.change(screen.getByLabelText('コマンド 1'), { target: { value: 'pnpm test' } })
    fireEvent.change(screen.getByLabelText('用途ラベル 1'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('コマンド 1'), { target: { value: 'pnpm run' } })
    fireEvent.click(screen.getByRole('button', { name: '最小入力に戻る' }))
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Act
    fireEvent.change(screen.getByLabelText('コマンド 1'), { target: { value: 'pnpm test --watch' } })

    // Assert
    expect(screen.getByLabelText('用途ラベル 1')).toHaveValue('')
  })

  it('技術スタックを変更して再作成すると技術固有ルールを更新する', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'TypeScript' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    expect((screen.getByLabelText('技術固有ルール 1') as HTMLInputElement).value).toContain('strict設定を維持し')
    fireEvent.click(screen.getByRole('button', { name: '最小入力に戻る' }))
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'React' } })

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Assert
    expect((screen.getByLabelText('技術固有ルール 1') as HTMLInputElement).value).toContain('既存のコンポーネント構成')
    expect((screen.getByLabelText('技術固有ルール 1') as HTMLInputElement).value).not.toContain('strict設定を維持し')
  })

  it('技術スタックを追加して再作成しても編集済みの技術固有ルールを保持する', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'TypeScript' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    fireEvent.change(screen.getByLabelText('技術固有ルール 1'), { target: { value: '型を厳密に扱う。' } })
    fireEvent.click(screen.getByRole('button', { name: '最小入力に戻る' }))
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'TypeScript\nReact' } })

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Assert
    expect(screen.getByLabelText('技術固有ルール 1')).toHaveValue('型を厳密に扱う。')
    expect((screen.getByLabelText('技術固有ルール 2') as HTMLInputElement).value).toContain('既存のコンポーネント構成')
  })

  it('先頭の技術固有ルールを削除しても残ったルールの編集を技術スタック変更後に保持する', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'TypeScript\nReact' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    const firstTechnologyRule = screen.getByLabelText('技術固有ルール 1')
    const removeButton = firstTechnologyRule.parentElement?.querySelector('button')
    if (!removeButton) throw new Error('削除ボタンが見つかりません。')
    fireEvent.click(removeButton)
    fireEvent.change(screen.getByLabelText('技術固有ルール 1'), { target: { value: 'Reactの設計を維持する。' } })
    fireEvent.click(screen.getByRole('button', { name: '最小入力に戻る' }))
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'React' } })

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Assert
    expect(screen.getByLabelText('技術固有ルール 1')).toHaveValue('Reactの設計を維持する。')
    expect(screen.queryByLabelText('技術固有ルール 2')).not.toBeInTheDocument()
  })

  it('削除した技術固有ルールを技術スタック変更後に復活させない', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'TypeScript\nReact' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    const firstTechnologyRule = screen.getByLabelText('技術固有ルール 1')
    const removeButton = firstTechnologyRule.parentElement?.querySelector('button')
    if (!removeButton) throw new Error('削除ボタンが見つかりません。')
    fireEvent.click(removeButton)
    fireEvent.click(screen.getByRole('button', { name: '最小入力に戻る' }))
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'TypeScript\nReact\nVue' } })

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Assert
    expect((screen.getByLabelText('技術固有ルール 1') as HTMLInputElement).value).toContain('既存のコンポーネント構成')
    expect((screen.getByLabelText('技術固有ルール 2') as HTMLInputElement).value).toContain('Composition API')
    expect(screen.queryByDisplayValue(expect.stringContaining('strict設定を維持し'))).not.toBeInTheDocument()
  })

  it('編集画面で技術スタックを変更しても対応する技術固有ルールへ更新する', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'TypeScript' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'React' } })
    fireEvent.click(screen.getByRole('button', { name: '最小入力に戻る' }))

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Assert
    expect((screen.getByLabelText('技術固有ルール 1') as HTMLInputElement).value).toContain('既存のコンポーネント構成')
    expect(screen.queryByDisplayValue(expect.stringContaining('strict設定を維持し'))).not.toBeInTheDocument()
  })

  it('技術スタックの追加後も技術固有ルールをプロファイルの順で表示する', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'React' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    fireEvent.click(screen.getByRole('button', { name: '最小入力に戻る' }))
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'React\nTypeScript' } })

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Assert
    expect((screen.getByLabelText('技術固有ルール 1') as HTMLInputElement).value).toContain('strict設定を維持し')
    expect((screen.getByLabelText('技術固有ルール 2') as HTMLInputElement).value).toContain('既存のコンポーネント構成')
  })

  it('一致する技術プロファイルがなくなった場合は手動追加ルールを表示しない', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'TypeScript' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'ルールを追加' })[1])
    fireEvent.change(screen.getByLabelText('技術固有ルール 2'), { target: { value: '独自ルール' } })
    fireEvent.click(screen.getByRole('button', { name: '最小入力に戻る' }))
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'Unknown' } })

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Assert
    expect(screen.queryByRole('heading', { name: '技術固有ルール' })).not.toBeInTheDocument()
    expect(screen.queryByDisplayValue('独自ルール')).not.toBeInTheDocument()
  })

  it('生成済みルールを削除しても一致する技術プロファイルの手動追加ルールを保持する', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'TypeScript' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'ルールを追加' })[1])
    fireEvent.change(screen.getByLabelText('技術固有ルール 2'), { target: { value: '独自ルール' } })
    const generatedRule = screen.getByLabelText('技術固有ルール 1')
    const removeButton = generatedRule.parentElement?.querySelector('button')
    if (!removeButton) throw new Error('削除ボタンが見つかりません。')
    fireEvent.click(removeButton)
    fireEvent.click(screen.getByRole('button', { name: '最小入力に戻る' }))

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Assert
    expect(screen.getByLabelText('技術固有ルール 1')).toHaveValue('独自ルール')
  })

  it('技術固有ルールを空にした編集を削除として扱う', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'TypeScript' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))

    // Act
    fireEvent.change(screen.getByLabelText('技術固有ルール 1'), { target: { value: '  ' } })

    // Assert
    expect(screen.queryByRole('heading', { name: '技術固有ルール' })).not.toBeInTheDocument()
  })

  it('未入力で追加した技術固有ルールを生成ルール削除後に残さない', () => {
    // Arrange
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.change(screen.getByLabelText('技術スタック'), { target: { value: 'TypeScript' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'ルールを追加' })[1])
    const generatedRule = screen.getByLabelText('技術固有ルール 1')
    const removeButton = generatedRule.parentElement?.querySelector('button')
    if (!removeButton) throw new Error('削除ボタンが見つかりません。')

    // Act
    fireEvent.click(removeButton)

    // Assert
    expect(screen.queryByRole('heading', { name: '技術固有ルール' })).not.toBeInTheDocument()
  })

  it('編集済みの内容をプレビュー、コピー、ダウンロードで同じMarkdownとして扱う', async () => {
    // Arrange
    const writeText = vi.fn().mockResolvedValue(undefined)
    const createObjectURL = vi.fn().mockReturnValue('blob:agents-md')
    const revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    Object.assign(URL, { createObjectURL, revokeObjectURL })
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: '日本語の概要' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    fireEvent.change(screen.getByLabelText('文書タイトル'), { target: { value: 'CUSTOM.md' } })

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'AGENTS.mdを生成する' }))
    const preview = screen.getByText('# CUSTOM\\.md', { exact: false }).parentElement
    fireEvent.click(screen.getByRole('button', { name: 'コピーする' }))
    await screen.findByRole('status')
    fireEvent.click(screen.getByRole('button', { name: 'AGENTS.mdをダウンロードする' }))

    // Assert
    expect(preview).toHaveTextContent('日本語の概要')
    expect(writeText).toHaveBeenCalledWith(preview?.textContent)
    expect(createObjectURL).toHaveBeenCalledWith(expect.objectContaining({ type: 'text/markdown;charset=utf-8' }))
    expect(click).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:agents-md')
    click.mockRestore()
  })

  it('Clipboard APIが利用できない場合でもコピー操作でクラッシュしない', async () => {
    // Arrange
    Object.assign(navigator, { clipboard: undefined })
    render(<App />)
    fireEvent.change(screen.getByLabelText('プロジェクト概要必須'), { target: { value: 'Webアプリ' } })
    fireEvent.click(screen.getByRole('button', { name: 'たたき台を作成する' }))
    fireEvent.click(screen.getByRole('button', { name: 'AGENTS.mdを生成する' }))

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'コピーする' }))

    // Assert
    expect(await screen.findByRole('status')).toHaveTextContent('コピーできませんでした。')
    expect(screen.getByRole('heading', { name: 'AGENTS.mdを確認してください' })).toBeInTheDocument()
  })
})
