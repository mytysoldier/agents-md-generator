import type { RuleCategory } from './model'

export const INTRODUCTION = 'このファイルは、このプロジェクトで作業するAIエージェント向けの指示です。'

export const COMMON_RULES: Record<RuleCategory, readonly string[]> = {
  implementation: ['既存の指示、構成、命名、スタイルを優先する。', '依頼の目的に必要な最小限の差分にする。', '入力不足、空状態、想定外の値、処理失敗でクラッシュさせない。'],
  quality: ['変更箇所に関連する既存テストを実行し、振る舞いを追加または変更した場合は必要なテストを更新する。', '実行できない検証や失敗が残る場合は、理由と未確認範囲を明確に報告する。'],
  git: ['無関係な変更をcommitへ含めず、履歴の書き換えは明示依頼時だけ行う。', 'commitやPull Requestには、変更理由、主な変更、検証結果を簡潔に記録する。'],
  agentWorkflow: ['作業前に関連する指示、ドキュメント、既存実装、影響範囲を確認する。', '仕様変更や依頼範囲の拡大が必要なら、実装前に利用者へ確認する。', '作業後に差分を確認し、利用可能な関連検証を実行する。', '完了報告には、実施概要、変更ファイル、検証結果、未対応事項または懸念点を含める。'],
  safety: ['秘密情報、APIキー、個人情報をcommitまたは出力へ含めない。', '利用者の未commit変更を削除、上書き、巻き戻ししない。', '技術スタック、データ保存方式、外部API、認証、課金、解析を依頼なく変更または追加しない。', '破壊的な操作は対象と影響を確認し、依頼範囲が明確な場合だけ実行する。'],
}

export const SECTION_TITLES: Record<RuleCategory, string> = {
  implementation: '実装方針とコーディング規約', quality: 'テスト・品質確認', git: 'Git・Pull Request運用', agentWorkflow: 'AIエージェントの作業手順', safety: '禁止事項と安全上の制約',
}

export const TECHNOLOGY_PROFILES = [
  ['typescript', '既存のstrict設定を維持し、型エラーを回避するためだけのanyや型アサーションを安易に追加しない。'], ['javascript|node\\.js|nodejs', '既存のモジュール形式と実行環境を維持し、暗黙の型変換へ依存しない。'], ['react|next\\.js|nextjs', '既存のコンポーネント構成と状態管理方針を維持し、UI変更では基本的なキーボード操作とアクセシビリティを確認する。'], ['vue|nuxt', '既存のComposition APIまたはOptions APIの選択と状態管理方針を維持する。'], ['python|django|flask|fastapi', '既存のフォーマッター、リンター、型注釈の方針に合わせ、例外を握りつぶさない。'], ['swift|swiftui|uikit', '既存のデータフローと命名規則を維持し、UI状態の更新箇所を明確にする。'], ['kotlin', '既存のnull安全性、非同期処理、UIアーキテクチャの方針を維持する。'], ['rust', '所有権とエラー型を明確にし、回復可能な入力エラーへ安易にpanicやunwrapを使用しない。'], ['golang|go', 'gofmtに従い、エラーを明示的に処理し、既存のpackage境界を維持する。'],
] as const

export const COMMAND_LABELS = [['install', '依存関係をインストール'], ['dev', '開発サーバー'], ['lint', 'lint'], ['typecheck', '型チェック'], ['test', 'テスト'], ['build', 'build'], ['format', 'フォーマット']] as const
