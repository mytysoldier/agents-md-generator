import { render, screen } from '@testing-library/react'
import App from './App'

describe('アプリケーション', () => {
  it('アプリケーションタイトルを表示する', () => {
    // Arrange
    const title = 'プロジェクト用のAGENTS.mdを、迷わず作る。'

    // Act
    render(<App />)

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
  })
})
