import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'

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
    expect(screen.queryByRole('heading', { name: '必要な詳細だけを整えてください' })).not.toBeInTheDocument()
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
})
