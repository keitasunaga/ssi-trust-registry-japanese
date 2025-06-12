# 貢献ガイドライン

SSI信頼レジストリ（日本版）への貢献方法について説明します。日本でのSSI普及に一緒に取り組んでいただき、ありがとうございます！

## 📋 目次

- [行動規範](#行動規範)
- [貢献の種類](#貢献の種類)
- [開発環境のセットアップ](#開発環境のセットアップ)
- [貢献の手順](#貢献の手順)
- [コーディング規約](#コーディング規約)
- [テスト](#テスト)
- [プルリクエスト](#プルリクエスト)
- [Issue報告](#issue報告)

## 🤝 行動規範

このプロジェクトは**オープン**で**インクルーシブ**なコミュニティを目指しています。

### 歓迎する行動

- 🎯 建設的なフィードバック
- 🤝 他の参加者への敬意
- 📚 学習意欲と知識共有
- 🌍 異なる視点や経験の尊重
- 💡 革新的なアイデアの提案

### 受け入れられない行動

- 😠 攻撃的・差別的な言動
- 🚫 ハラスメント行為
- 📧 プライベート情報の無断公開
- 💸 商業的勧誘・スパム

## 🛠️ 貢献の種類

### 1. 🐛 バグ報告

- システムの不具合を発見した場合
- 予期しない動作を報告
- 再現手順を含む詳細な報告

### 2. 💡 機能提案

- 新機能のアイデア
- ユーザビリティの改善提案
- パフォーマンス向上のアイデア

### 3. 🔧 コード貢献

- バグ修正
- 新機能の実装
- パフォーマンス改善
- リファクタリング

### 4. 📚 ドキュメント改善

- ドキュメントの修正・追加
- チュートリアルの作成
- API仕様書の更新
- 翻訳作業

### 5. 🧪 テスト

- テストケースの追加
- テストカバレッジの改善
- E2Eテストの作成

## 🏗️ 開発環境のセットアップ

### 前提条件

```bash
# Node.js 18以上
node --version  # v18.0.0+

# Docker & Docker Compose
docker --version
docker compose version

# Git
git --version
```

### セットアップ手順

```bash
# 1. フォーク & クローン
git clone https://github.com/YOUR_USERNAME/ssi-trust-registry-japanese.git
cd ssi-trust-registry-japanese

# 2. 上流リポジトリの追加
git remote add upstream https://github.com/original/ssi-trust-registry-japanese.git

# 3. 依存関係のインストール
yarn install

# 4. 環境変数の設定
cd packages/backend && cp .env.example .env
cd ../frontend && cp .env.example .env

# 5. データベースの起動
docker compose up -d mongo mongo-replica-setup

# 6. 開発サーバーの起動
yarn dev

# 7. テストの実行
yarn test
```

## 🔄 貢献の手順

### 1. Issue の確認・作成

```bash
# 既存のIssueを確認
# https://github.com/your-username/ssi-trust-registry-japanese/issues

# 新しいIssueを作成（必要に応じて）
```

### 2. ブランチの作成

```bash
# 最新のmainブランチに同期
git checkout main
git pull upstream main

# 新しいブランチを作成
git checkout -b feature/your-feature-name
# または
git checkout -b fix/bug-description
# または
git checkout -b docs/documentation-update
```

### ブランチ命名規則

| プレフィックス | 用途 | 例 |
|----------------|------|-----|
| `feature/` | 新機能 | `feature/entity-search` |
| `fix/` | バグ修正 | `fix/did-validation-error` |
| `docs/` | ドキュメント | `docs/api-examples` |
| `test/` | テスト | `test/entity-service` |
| `refactor/` | リファクタリング | `refactor/validation-logic` |
| `chore/` | その他 | `chore/update-dependencies` |

### 3. 開発

```bash
# 開発作業
# ... コードの変更 ...

# 継続的なテスト実行
yarn test:watch

# リンター・フォーマッターの実行
yarn lint
yarn format
```

### 4. コミット

```bash
# 変更をステージング
git add .

# コミット（Conventional Commitsに従う）
git commit -m "feat: add entity search functionality"

# または
git commit -m "fix: resolve DID validation error"
git commit -m "docs: update API documentation"
```

### Conventional Commits 形式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Type一覧:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響を与えない変更（空白、フォーマットなど）
- `refactor`: バグの修正や機能の追加ではないコードの変更
- `test`: 不足しているテストの追加や既存テストの修正
- `chore`: ビルドプロセスやツールの変更

### 5. プッシュ & プルリクエスト

```bash
# リモートにプッシュ
git push origin feature/your-feature-name

# GitHub上でPull Requestを作成
```

## 📝 コーディング規約

### TypeScript/JavaScript

```typescript
// ✅ Good
interface Entity {
  id: string;
  name: string;
  dids: string[];
}

async function validateEntity(entity: Entity): Promise<ValidationResult> {
  // DIDの検証
  const didValidation = await validateDids(entity.dids);
  
  if (!didValidation.isValid) {
    return {
      isValid: false,
      errors: didValidation.errors
    };
  }
  
  return { isValid: true };
}

// ❌ Bad
function validateEntity(entity: any) {
  // 型定義なし、エラーハンドリング不十分
  const result = someValidation(entity.dids);
  return result;
}
```

### ファイル構成

```
src/
├── controllers/     # HTTPリクエスト処理
├── services/        # ビジネスロジック
├── repositories/    # データアクセス
├── types/          # 型定義
├── utils/          # ユーティリティ
├── middleware/     # ミドルウェア
└── tests/          # テストファイル
```

### 命名規則

```typescript
// ファイル名: kebab-case
entity-service.ts
did-resolver.ts

// 変数・関数: camelCase
const entityService = new EntityService();
function validateDids(dids: string[]) { }

// クラス: PascalCase
class EntityService { }
class DidResolver { }

// 定数: SCREAMING_SNAKE_CASE
const DEFAULT_PAGE_SIZE = 20;
const MAX_DID_COUNT = 10;

// インターface: PascalCase
interface EntityDto { }
interface ValidationResult { }
```

### ESLint・Prettier設定

```bash
# ESLintチェック
yarn lint

# Prettierフォーマット
yarn format

# 自動修正
yarn lint:fix
```

## 🧪 テスト

### テスト種別

1. **ユニットテスト**: 個別関数・クラスのテスト
2. **統合テスト**: サービス間の結合テスト
3. **E2Eテスト**: エンドツーエンドテスト

### テスト実行

```bash
# 全テスト実行
yarn test

# 監視モード
yarn test:watch

# カバレッジ取得
yarn test:coverage

# E2Eテスト
yarn test:e2e
```

### テストの書き方

```typescript
// ユニットテストの例
describe('EntityService', () => {
  let entityService: EntityService;
  let mockRepository: jest.Mocked<EntityRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    } as any;
    
    entityService = new EntityService(mockRepository);
  });

  describe('createEntity', () => {
    it('should create entity with valid data', async () => {
      // Arrange
      const entityDto = {
        name: 'Test Entity',
        dids: ['did:indy:sovrin:test123']
      };
      
      mockRepository.create.mockResolvedValue({
        id: '12345',
        ...entityDto
      });

      // Act
      const result = await entityService.createEntity(entityDto);

      // Assert
      expect(result.id).toBe('12345');
      expect(mockRepository.create).toHaveBeenCalledWith(entityDto);
    });

    it('should throw error with invalid DID', async () => {
      // Arrange
      const entityDto = {
        name: 'Test Entity',
        dids: ['invalid-did']
      };

      // Act & Assert
      await expect(entityService.createEntity(entityDto))
        .rejects
        .toThrow('Invalid DID format');
    });
  });
});
```

## 📤 プルリクエスト

### PRの作成前チェック

```bash
# ✅ チェックリスト
- [ ] 最新のmainブランチとの同期
- [ ] テストが全て通る
- [ ] リンターエラーがない
- [ ] 適切なコミットメッセージ
- [ ] 関連するドキュメントの更新
```

### PRテンプレート

```markdown
## 概要
<!-- 変更内容の簡潔な説明 -->

## 変更内容
<!-- 詳細な変更内容 -->
- [ ] 新機能の追加
- [ ] バグ修正
- [ ] ドキュメント更新
- [ ] テスト追加

## 関連Issue
<!-- 関連するIssue番号 -->
Fixes #123

## テスト
<!-- テスト内容の説明 -->
- [ ] ユニットテスト追加
- [ ] 統合テスト確認
- [ ] 手動テスト実施

## スクリーンショット
<!-- UIに関する変更の場合 -->

## チェックリスト
- [ ] テストが通る
- [ ] リンターエラーなし
- [ ] ドキュメント更新済み
- [ ] レビュー準備完了
```

### レビュープロセス

1. **自動チェック**: CI/CDパイプラインでの自動テスト
2. **コードレビュー**: 1名以上のレビュアーによる確認
3. **動作確認**: 必要に応じた動作テスト
4. **マージ**: レビュー承認後のマージ

## 🐛 Issue報告

### バグ報告テンプレート

```markdown
## バグの概要
<!-- バグの簡潔な説明 -->

## 再現手順
1. ○○にアクセス
2. ○○をクリック
3. ○○を入力
4. エラーが発生

## 期待される動作
<!-- 本来あるべき動作 -->

## 実際の動作
<!-- 実際に起こった動作 -->

## 環境情報
- OS: macOS 14.0
- ブラウザ: Chrome 120.0
- Node.js: v20.10.0
- アプリケーション: v1.0.0

## 追加情報
<!-- ログ、スクリーンショット等 -->
```

### 機能要望テンプレート

```markdown
## 機能の概要
<!-- 要望する機能の説明 -->

## 背景・動機
<!-- なぜこの機能が必要か -->

## 詳細仕様
<!-- 具体的な機能要件 -->

## 想定される利用者
<!-- どんなユーザーが使うか -->

## 優先度
- [ ] 高（必須）
- [ ] 中（重要）
- [ ] 低（あると良い）

## 追加情報
<!-- 参考資料、関連情報等 -->
```

## 🏷️ ラベル体系

### 種別ラベル

- `bug`: バグ報告
- `enhancement`: 機能要望
- `documentation`: ドキュメント関連
- `question`: 質問
- `help wanted`: ヘルプ募集

### 優先度ラベル

- `priority: high`: 高優先度
- `priority: medium`: 中優先度
- `priority: low`: 低優先度

### 状態ラベル

- `status: in progress`: 作業中
- `status: review needed`: レビュー待ち
- `status: blocked`: ブロック中

### 技術領域ラベル

- `area: frontend`: フロントエンド
- `area: backend`: バックエンド
- `area: infrastructure`: インフラ
- `area: ssi`: SSI関連

## 🎯 特別な貢献領域

### 日本語化・ローカライゼーション

```bash
# 翻訳対象ファイル
packages/frontend/src/locales/ja.json
docs/ja/
README.md
```

### SSI・暗号学的検証

```typescript
// DID解決・検証の改善
// Verifiable Credentials検証の強化
// Hyperledger Aries Frameworkの最適化
```

### セキュリティ

```bash
# セキュリティ脆弱性の報告は非公開で
# security@your-domain.com まで連絡
```

## 🏆 貢献者の認識

### Contributors.md

すべての貢献者は `CONTRIBUTORS.md` ファイルに記載されます。

### リリースノート

重要な貢献は、リリースノートで言及されます。

### コミュニティ表彰

- 🥇 月間最優秀貢献者
- 🏅 年間コミュニティ賞
- 🎖️ 特別功労賞

## 📞 コミュニケーション

### GitHub Discussions

- 💬 一般的な質問・議論
- 💡 アイデアの共有
- 📢 お知らせ・アップデート

### Discord/Slack（将来予定）

- 🗨️ リアルタイムチャット
- 🤝 開発者コミュニティ
- 📅 定期ミーティング

## 📅 リリースサイクル

### バージョニング

[Semantic Versioning](https://semver.org/) を採用：

- `MAJOR.MINOR.PATCH`
- 例: `1.2.3`

### リリーススケジュール

- **メジャーリリース**: 年1-2回
- **マイナーリリース**: 月1-2回
- **パッチリリース**: 必要に応じて

## 📚 参考資料

### SSI関連

- [W3C DID Core 1.0](https://www.w3.org/TR/did-core/)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [Hyperledger Aries](https://www.hyperledger.org/projects/aries)

### 開発ガイド

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/ja/)

---

**感謝**: 皆様の貢献により、日本でのSSI普及が実現されます。一緒に未来を創りましょう！ 🚀 
