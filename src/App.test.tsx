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

    // Assert
    expect(technologyStack).toHaveValue('TypeScript\nReact')
    expect(screen.getByLabelText('用途ラベル 1')).toHaveValue('単体テスト')
    expect(screen.queryByRole('heading', { name: '技術固有ルール' })).not.toBeInTheDocument()
  })
})
