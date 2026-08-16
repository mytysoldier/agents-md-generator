import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the application title', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'プロジェクト用のAGENTS.mdを、迷わず作る。' })).toBeInTheDocument()
  })
})
