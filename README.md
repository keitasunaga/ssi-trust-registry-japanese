# SSI信頼レジストリ（日本版）

自己主権型アイデンティティ（SSI）エコシステム向けの信頼レジストリ実装

*本プロジェクトは [元のSSI Trust Registry](https://github.com/original/ssi-trust-registry) をベースに、日本のSSIエコシステム向けに改良・日本語化したものです。*

## 🌟 概要

このプロジェクトは、日本でのSSI（Self-Sovereign Identity：自己主権型アイデンティティ）普及を目的として、信頼できるクレデンシャル発行者・検証者を管理する信頼レジストリを提供します。

### 主な特徴

- 🔐 **セキュアなDID管理**: Hyperledger Aries Frameworkを使用した分散型識別子の検証
- 🌐 **標準準拠**: W3C DID・Verifiable Credentials仕様への準拠
- 🇯🇵 **日本対応**: 日本語インターフェース、日本の法制度・文化への配慮
- 🔄 **相互運用性**: 国際的なSSIエコシステムとの互換性
- 📱 **モダンUI**: Next.js + Tailwind CSSによる直感的なユーザーインターフェース

## 🏗️ アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   フロントエンド  │    │   バックエンド    │    │   データベース   │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (MongoDB)     │
│   Port: 3001    │    │   Port: 3000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Hyperledger Aries │
                    │ Framework        │
                    │ (DID Resolution) │
                    └─────────────────┘
```

## 🚀 クイックスタート

### 前提条件

- Node.js (v18以上)
- Docker & Docker Compose
- Yarn

### 1. セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/your-username/ssi-trust-registry-japanese.git
cd ssi-trust-registry-japanese

# 依存関係のインストール
yarn install
```

### 2. データベースの起動

```bash
docker compose up -d mongo mongo-replica-setup
```

### 3. 環境変数の設定

```bash
# バックエンド
cd packages/backend
cp .env.example .env

# フロントエンド
cd ../frontend
cp .env.example .env
```

### 4. 開発サーバーの起動

```bash
# バックエンド（ポート3000）
yarn dev

# 別ターミナルでフロントエンド（ポート3001）
cd packages/frontend
yarn dev -p 3001
```

### 5. アクセス

- **フロントエンド**: http://localhost:3001
- **バックエンドAPI**: http://localhost:3000
- **API仕様書**: http://localhost:3000/api-docs

## 🐳 Dockerを使用した実行

### 開発環境

```bash
# 全サービスの起動
docker compose up -d

# ログの確認
docker compose logs -f trust-registry
```

### 本番環境

```bash
# イメージのビルド
docker build -t ssi-trust-registry-jp .

# 環境変数ファイルの作成
cat packages/backend/.env > .env && cat packages/frontend/.env >> .env

# コンテナの実行
docker run -d -p 3000:3000 -p 3001:3001 \
  --name trust-registry-jp \
  --env-file .env \
  ssi-trust-registry-jp
```

## 🧪 テスト

```bash
# テスト用環境変数の設定
cp .env.example .env.test

# データベースの起動
docker compose up -d mongo mongo-replica-setup

# テストの実行
yarn test

# テストの監視実行
yarn test:watch
```

## 📚 ドキュメント

詳細なドキュメントは `docs/ja/` ディレクトリに格納されています：

- [📖 詳細セットアップガイド](docs/ja/SETUP.md)
- [🏗️ アーキテクチャ解説](docs/ja/ARCHITECTURE.md)
- [🔌 API仕様](docs/ja/API.md)
- [🤝 貢献ガイドライン](docs/ja/CONTRIBUTING.md)
- [💡 使用例](docs/examples/)

## 🔧 技術スタック

### バックエンド
- **Node.js + TypeScript**: サーバーサイドロジック
- **Express.js**: REST APIフレームワーク
- **MongoDB**: NoSQLデータベース
- **Hyperledger Aries Framework**: SSI関連機能
  - DID解決・検証
  - Verifiable Credentialsサポート
  - Hyperledger Indyネットワーク連携

### フロントエンド
- **Next.js 14**: Reactフレームワーク
- **TypeScript**: 型安全性確保
- **Tailwind CSS + DaisyUI**: UIフレームワーク
- **React Hook Form + Zod**: フォーム管理・バリデーション

### インフラ
- **Docker**: コンテナ化
- **Kubernetes**: 本番環境（Helmチャート提供）

## 🎯 日本での活用シナリオ

### 🎓 教育分野
```
大学 → デジタル学位証明書発行 → 信頼レジストリ登録 → 企業が検証
```

### 🏦 金融分野
```
銀行 → KYC情報のVC発行 → 信頼レジストリ登録 → 他の金融機関が検証
```

### 🏛️ 政府・自治体
```
自治体 → 住民票のVC発行 → 信頼レジストリ登録 → 各種サービスが検証
```

### 🏥 医療分野
```
医師会 → 医師資格のVC発行 → 信頼レジストリ登録 → 病院・患者が検証
```

## 🔒 セキュリティとプライバシー

### DIDとスキーマの管理

完全修飾DID（Fully Qualified DID）を使用：

```
DID形式: did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb
スキーマ形式: did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0
```

### 参考資料
- [Indy DID Method仕様](https://hyperledger.github.io/indy-did-method/#schema)
- [JavaScript実装例](https://gist.github.com/jakubkoci/26cb093d274bf61d982b4c56e05d9ebc)

## 🤝 コミュニティ・貢献

日本でのSSI普及に貢献していただける方を歓迎します！

### 参加方法

1. **🐛 バグ報告**: [Issues](https://github.com/your-username/ssi-trust-registry-japanese/issues)
2. **💡 機能要望**: [Issues](https://github.com/your-username/ssi-trust-registry-japanese/issues)
3. **🔧 コード貢献**: [Pull Requests](https://github.com/your-username/ssi-trust-registry-japanese/pulls)
4. **📝 ドキュメント改善**: [Pull Requests](https://github.com/your-username/ssi-trust-registry-japanese/pulls)

### 開発フロー

```bash
# 1. フォーク & クローン
git clone https://github.com/your-username/ssi-trust-registry-japanese.git

# 2. ブランチ作成
git checkout -b feature/your-feature-name

# 3. 開発 & テスト
yarn test

# 4. コミット & プッシュ
git commit -m "feat: add your feature"
git push origin feature/your-feature-name

# 5. Pull Request作成
```

## 📄 ライセンス

Apache License 2.0

本プロジェクトは元のSSI Trust Registryの派生版であり、Apache License 2.0の条件に従って配布されます。

## 🙏 謝辞

- 元プロジェクトの開発者・貢献者の皆様
- [Hyperledger Foundation](https://www.hyperledger.org/)
- 日本SSIコミュニティの皆様

## 🔗 関連プロジェクト

- [Hyperledger Aries](https://www.hyperledger.org/projects/aries)
- [Hyperledger Indy](https://www.hyperledger.org/projects/hyperledger-indy)
- [W3C Decentralized Identifiers](https://www.w3.org/TR/did-core/)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)

---

**⚠️ 重要**: 本プロジェクトは日本でのSSI実証実験・研究目的で開発されています。本番環境での使用前に十分な検証とセキュリティ監査を行ってください。
