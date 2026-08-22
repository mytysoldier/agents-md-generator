# ai-dev-template

AIエージェントを中心に、GitHub Issueでタスクを管理しながら個人開発を進めるためのテンプレートです。

## ローカル開発

必要環境: Node.js 24系、pnpm 11.22.0

pnpmはCorepackで有効化できます。

```bash
corepack enable
pnpm install
pnpm dev
```

### 検証コマンド

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## 公開・デプロイ

公開先はCloudflare Pagesの `mytysoldier-agents-md-generator` プロジェクトです。

- 本番URL: `https://mytysoldier-agents-md-generator.pages.dev/`
- Production branch: `main`
- Build command: `pnpm build`
- Build output directory: `dist`
- Root directory: リポジトリルート
- Node.js version: `24`

Cloudflare PagesでGitHubリポジトリを接続すると、`main` の更新が本番へ、Pull Requestの更新がプレビュー環境へ自動デプロイされます。Node.js 24は `.node-version` で固定し、WranglerのPages設定は `wrangler.jsonc` を一次情報とします。サーバー、DB、環境変数、秘密情報は使用しません。

Git連携を初めて設定する場合は、Cloudflare Dashboardの Workers & Pages からPagesアプリを作成し、このリポジトリを選択して上記の設定を入力します。既存プロジェクトへ手動デプロイする場合は、Cloudflareへログイン後に次を実行します。

```bash
pnpm build
pnpm dlx wrangler pages deploy dist --project-name mytysoldier-agents-md-generator --branch main
```

### 公開後の確認

```bash
curl --fail --show-error --location https://mytysoldier-agents-md-generator.pages.dev/
curl --fail --show-error https://mytysoldier-agents-md-generator.pages.dev/robots.txt
curl --fail --show-error https://mytysoldier-agents-md-generator.pages.dev/sitemap.xml
curl --fail-with-body --show-error https://mytysoldier-agents-md-generator.pages.dev/not-found
```

最後のコマンドは404を正常として確認するため、終了コードが22になることを確認します。ブラウザではトップページの直接アクセスと再読み込み、主要フロー、スマートフォン表示、OGP画像も確認します。

### ロールバック

Cloudflare Dashboardで対象プロジェクトの Deployments を開き、直前の正常なProductionデプロイを選んで `Rollback to this deployment` を実行します。復旧後は本番URLと主要フローを再確認し、原因となった変更は通常のPull Requestで修正します。履歴を書き換えるforce pushや、秘密情報のリポジトリ追加は行いません。

このテンプレートは、以下のような進め方を前提にしています。

- まず企画・要件・技術設計をIssueで整理する
- 初期リリースで作ること、作らないことを明確にする
- 実装Issueを小さく分ける
- AIエージェントはIssue単位で実装する
- 実装後は検証、コミット、push、PR作成まで進める
- レビューコメント対応後は再レビューを依頼する

## 使い方

1. このリポジトリをテンプレートとして新しいリポジトリを作成する
2. `docs/planning-template.md` をコピーして、作りたいサービスの初期リリース計画を書く
3. `.github/ISSUE_TEMPLATE/design.md` から設計Issueを作る
4. 設計Issueで初期リリース範囲と技術方針を確定する
5. `.github/ISSUE_TEMPLATE/implementation.md` から実装Issueを小さく作る
6. AIエージェントにIssue単位で実装を依頼する

## 推奨AI開発フロー

- Codexを実装、テスト、Git操作、PR作成の主担当にする
- GitHub Actionsでlint、型チェック、テスト、buildを必須確認にする
- CodexのPRレビューをすべてのPRで使い、GitHub Actionsと人間の確認を補完する
- GeminiやAntigravityは、別解の検討、資料・画像を含む調査、UI案の比較などの補助に使う
- 複数のAIエージェントで同じブランチを同時に編集しない

GeminiやAntigravityを使う場合も、実装の最終責任とPR作成はCodexに集約すると、変更の経緯とレビュー対象を追いやすくなります。

## AI向けルール

AIエージェント向けの作業ルールは [AGENTS.md](AGENTS.md) にまとめています。

Codexを含むAIコーディングエージェントには、まず `AGENTS.md` と対象Issueを読ませてから作業させてください。

## 用意しているテンプレート

- `AGENTS.md`: AIエージェント向け作業ルール
- `.github/ISSUE_TEMPLATE/design.md`: 企画・要件・技術設計Issue
- `.github/ISSUE_TEMPLATE/implementation.md`: 実装Issue
- `.github/ISSUE_TEMPLATE/qa.md`: 動作確認・公開前チェックIssue
- `.github/PULL_REQUEST_TEMPLATE.md`: PR確認テンプレート
- `docs/planning-template.md`: 初期リリース計画ドキュメント雛形

## 基本方針

個人開発では、完成度よりも公開できる初期リリースを優先します。

AIには大きな曖昧な依頼を渡さず、Issueごとに目的、実装範囲、受け入れ条件、スコープ外を明記します。これにより、AIが勝手に機能を増やしたり、技術スタックを変更したりすることを防ぎます。
