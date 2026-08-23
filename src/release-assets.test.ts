import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const readProjectFile = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('公開アセット', () => {
  it('トップページに検索結果と共有表示に必要なメタデータが設定されている', () => {
    // Arrange
    const html = readProjectFile('index.html')
    const productionUrl = 'https://agents-md-generator-4vr.pages.dev/'

    // Act
    const metadata = {
      canonical: html.includes(`rel="canonical" href="${productionUrl}"`),
      description: html.includes('name="description"'),
      openGraphTitle: html.includes('property="og:title"'),
      openGraphImage: html.includes(`property="og:image" content="${productionUrl}og-image.png"`),
      twitterCard: html.includes('name="twitter:card"'),
      twitterImage: html.includes(`name="twitter:image" content="${productionUrl}og-image.png"`),
      favicon: html.includes('rel="icon"'),
    }

    // Assert
    expect(metadata).toEqual({
      canonical: true,
      description: true,
      openGraphTitle: true,
      openGraphImage: true,
      twitterCard: true,
      twitterImage: true,
      favicon: true,
    })
  })

  it('クローラー向けファイルが公開URLを指している', () => {
    // Arrange
    const robots = readProjectFile('public/robots.txt')
    const sitemap = readProjectFile('public/sitemap.xml')
    const productionUrl = 'https://agents-md-generator-4vr.pages.dev/'

    // Act
    const crawlerConfiguration = {
      allowsCrawling: robots.includes('Allow: /'),
      linksSitemap: robots.includes(`${productionUrl}sitemap.xml`),
      includesTopPage: sitemap.includes(`<loc>${productionUrl}</loc>`),
    }

    // Assert
    expect(crawlerConfiguration).toEqual({
      allowsCrawling: true,
      linksSitemap: true,
      includesTopPage: true,
    })
  })

  it('存在しないURL向けページは検索対象外としトップへの導線を表示する', () => {
    // Arrange
    const notFoundPage = readProjectFile('public/404.html')

    // Act
    const notFoundConfiguration = {
      noIndex: notFoundPage.includes('name="robots" content="noindex"'),
      hasHeading: notFoundPage.includes('<h1>ページが見つかりません</h1>'),
      linksTopPage: notFoundPage.includes('<a href="/">'),
    }

    // Assert
    expect(notFoundConfiguration).toEqual({
      noIndex: true,
      hasHeading: true,
      linksTopPage: true,
    })
  })

  it('Cloudflare Pagesの設定は本番プロジェクトとbuild成果物を指定する', () => {
    // Arrange
    const cloudflareConfiguration = JSON.parse(readProjectFile('wrangler.jsonc')) as {
      name?: string
      pages_build_output_dir?: string
    }

    // Act
    const deploymentConfiguration = {
      projectName: cloudflareConfiguration.name,
      buildOutputDirectory: cloudflareConfiguration.pages_build_output_dir,
    }

    // Assert
    expect(deploymentConfiguration).toEqual({
      projectName: 'agents-md-generator',
      buildOutputDirectory: './dist',
    })
  })
})
