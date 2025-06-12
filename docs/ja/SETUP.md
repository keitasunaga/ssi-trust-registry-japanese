# 詳細セットアップガイド

SSI信頼レジストリ（日本版）の詳細なセットアップ手順を説明します。

## 📋 目次

- [システム要件](#システム要件)
- [開発環境セットアップ](#開発環境セットアップ)
- [本番環境セットアップ](#本番環境セットアップ)
- [設定項目詳細](#設定項目詳細)
- [トラブルシューティング](#トラブルシューティング)

## 🖥️ システム要件

### 最小要件

| 項目 | 最小 | 推奨 |
|------|------|------|
| Node.js | v18.0.0 | v20.x LTS |
| メモリ | 4GB | 8GB以上 |
| ストレージ | 10GB | 20GB以上 |
| CPU | 2コア | 4コア以上 |

### 対応OS

- ✅ Linux (Ubuntu 20.04+, CentOS 8+)
- ✅ macOS (10.15+)
- ✅ Windows 10/11 (WSL2推奨)

## 🔧 開発環境セットアップ

### 1. 必要なツールのインストール

#### Node.js & Yarn

```bash
# Node.js (v20 LTS推奨)
# macOS
brew install node@20

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Yarnのインストール
npm install -g yarn
```

#### Docker & Docker Compose

```bash
# macOS
brew install docker docker-compose

# Ubuntu
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
```

### 2. プロジェクトのセットアップ

```bash
# 1. リポジトリのクローン
git clone https://github.com/your-username/ssi-trust-registry-japanese.git
cd ssi-trust-registry-japanese

# 2. 依存関係のインストール
yarn install

# 3. Git hooksの設定
yarn prepare
```

### 3. データベースの設定

#### MongoDBの起動

```bash
# Docker Composeでの起動
docker compose up -d mongo mongo-replica-setup

# 起動確認
docker compose ps
docker compose logs mongo
```

#### MongoDB管理ツール (オプション)

```bash
# Mongo Expressの起動
docker compose up -d mongo-express

# アクセス: http://localhost:8081
# ユーザー名: admin (設定により変更可能)
# パスワード: pass (設定により変更可能)
```

### 4. 環境変数の設定

#### バックエンド設定

```bash
cd packages/backend
cp .env.example .env
```

`.env`ファイルの編集：

```bash
# データベース設定
DB_CONNECTION_STRING=mongodb://mongo:mongo@localhost:27017
DB_NAME=trust-registry

# サーバー設定
URL=http://localhost
PORT=3000

# SMTP設定（メール機能用）
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=test
SMTP_PASSWORD=test

# JWT設定
AUTH_JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production

# 管理者設定
AUTH_ADMIN_PASSWORD_HASH=$2b$10$Jo5knrTTpteyyyBN1aCh3.JThMmLxtX33Djl4H8rprAG1UCUOYIRm

# フロントエンド URL
FRONTEND_URL=http://localhost:3001

# ログレベル
LOGGER_LOG_LEVEL=debug

# 初期データ読み込みスキップ（開発時）
SKIP_INITIAL_DATA_LOAD=false
```

#### フロントエンド設定

```bash
cd packages/frontend
cp .env.example .env
```

`.env.local`ファイルの編集：

```bash
# バックエンドAPI URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

### 5. 開発サーバーの起動

#### 方法1: 個別起動

```bash
# ターミナル1: バックエンド
cd packages/backend
yarn dev

# ターミナル2: フロントエンド
cd packages/frontend
yarn dev
```

#### 方法2: 一括起動

```bash
# プロジェクトルートで
yarn dev
```

### 6. 動作確認

- **フロントエンド**: http://localhost:3001
- **バックエンドAPI**: http://localhost:3000
- **API文書**: http://localhost:3000/api-docs
- **ヘルスチェック**: http://localhost:3000/health

## 🚀 本番環境セットアップ

### 1. Docker Compose での本番デプロイ

```bash
# 1. 本番用環境変数の設定
cp .env.example .env.production

# 2. 環境変数の編集（セキュリティ設定必須）
vim .env.production

# 3. 本番用起動
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 2. Kubernetes での本番デプロイ

```bash
# 1. Helmチャートの確認
ls helm/trust-registry/

# 2. Values設定
cp helm/trust-registry/values.yaml values-prod.yaml
vim values-prod.yaml

# 3. デプロイ
helm install trust-registry-jp helm/trust-registry/ -f values-prod.yaml
```

### 3. セキュリティ設定

#### 必須セキュリティ設定

```bash
# 1. JWT秘密鍵の生成
openssl rand -base64 32

# 2. 管理者パスワードハッシュの生成
node -e "console.log(require('bcrypt').hashSync('your-strong-password', 10))"

# 3. MongoDB認証の有効化
# docker-compose.yml の mongo サービスに認証設定を追加
```

#### SSL/TLS設定

```bash
# Let's Encryptを使用する場合
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# 証明書の配置
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/
```

## ⚙️ 設定項目詳細

### バックエンド環境変数

| 変数名 | 説明 | デフォルト | 必須 |
|--------|------|------------|------|
| `DB_CONNECTION_STRING` | MongoDB接続文字列 | `mongodb://localhost:27017` | ✅ |
| `DB_NAME` | データベース名 | `trust-registry` | ✅ |
| `PORT` | サーバーポート | `3000` | ✅ |
| `AUTH_JWT_SECRET_KEY` | JWT署名用秘密鍵 | - | ✅ |
| `AUTH_ADMIN_PASSWORD_HASH` | 管理者パスワードハッシュ | - | ✅ |
| `SMTP_HOST` | SMTPサーバーホスト | `localhost` | ❌ |
| `LOGGER_LOG_LEVEL` | ログレベル | `info` | ❌ |

### フロントエンド環境変数

| 変数名 | 説明 | デフォルト | 必須 |
|--------|------|------------|------|
| `NEXT_PUBLIC_BACKEND_URL` | バックエンドAPI URL | `http://localhost:3000` | ✅ |

### MongoDB設定

#### レプリカセット設定

```bash
# MongoDBコンテナ内で実行
mongosh --eval "
rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'mongo:27017' }
  ]
})
"
```

## 🔧 トラブルシューティング

### よくある問題と解決策

#### 1. Node.js バージョン不整合

```bash
# 問題: Node.js バージョンが古い
Error: Node.js version 16.x is not supported

# 解決策: Node.js 18+ にアップデート
nvm install 20
nvm use 20
```

#### 2. MongoDB接続エラー

```bash
# 問題: MongoDB に接続できない
MongooseServerSelectionError: connect ECONNREFUSED

# 解決策1: Dockerコンテナの状態確認
docker compose ps
docker compose logs mongo

# 解決策2: ポート競合の確認
netstat -tulpn | grep 27017
```

#### 3. ポート競合

```bash
# 問題: ポートが既に使用されている
Error: listen EADDRINUSE :::3000

# 解決策: プロセスの確認と終了
lsof -ti:3000 | xargs kill -9
```

#### 4. メモリ不足

```bash
# 問題: JavaScript heap out of memory
FATAL ERROR: Reached heap limit Allocation failed

# 解決策: Node.jsメモリ制限の増加
export NODE_OPTIONS="--max-old-space-size=4096"
```

#### 5. Docker関連の問題

```bash
# 問題: Docker permission denied
docker: permission denied while trying to connect

# 解決策: ユーザーをdockerグループに追加
sudo usermod -aG docker $USER
newgrp docker
```

### ログの確認方法

```bash
# アプリケーションログ
docker compose logs -f trust-registry

# MongoDBログ
docker compose logs -f mongo

# リアルタイム監視
docker compose logs -f --tail=50
```

### パフォーマンス監視

```bash
# システムリソース監視
docker stats

# MongoDB統計
docker exec -it mongo mongosh --eval "db.stats()"

# Node.js プロセス監視
top -p $(pgrep -f "node.*backend")
```

## 📞 サポート

問題が解決しない場合は、以下の方法でサポートを受けられます：

1. **GitHub Issues**: [問題を報告](https://github.com/your-username/ssi-trust-registry-japanese/issues)
2. **Discussions**: [コミュニティで質問](https://github.com/your-username/ssi-trust-registry-japanese/discussions)
3. **Wiki**: [追加情報を確認](https://github.com/your-username/ssi-trust-registry-japanese/wiki)

---

**次のステップ**: [アーキテクチャ解説](ARCHITECTURE.md)を読んでシステムの詳細を理解しましょう。 
