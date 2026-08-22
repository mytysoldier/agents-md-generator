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
})
