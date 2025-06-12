# API仕様書

SSI信頼レジストリ（日本版）のREST API仕様について詳しく説明します。

## 📋 目次

- [概要](#概要)
- [認証](#認証)
- [レスポンス形式](#レスポンス形式)
- [エラーハンドリング](#エラーハンドリング)
- [エンドポイント一覧](#エンドポイント一覧)
- [データ型定義](#データ型定義)
- [使用例](#使用例)

## 🌐 概要

### ベースURL

```
開発環境: http://localhost:3000/api
本番環境: https://your-domain.com/api
```

### API バージョン

現在のAPIバージョン: `v1` (URLパスに含まれません)

### Content-Type

- リクエスト: `application/json`
- レスポンス: `application/json`

### 文字エンコーディング

UTF-8

## 🔐 認証

### JWT認証

管理者機能にはJWT（JSON Web Token）認証が必要です。

#### 認証フロー

1. **ログイン**: `/api/auth/login` でJWTトークンを取得
2. **認証**: `Authorization: Bearer <token>` ヘッダーでAPI呼び出し

#### 認証ヘッダー

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📦 レスポンス形式

### 成功レスポンス

```json
{
  "data": { /* レスポンスデータ */ },
  "message": "Success",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### エラーレスポンス

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が無効です",
    "details": [
      {
        "field": "dids",
        "message": "DIDが無効です"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## ❌ エラーハンドリング

### HTTPステータスコード

| コード | 説明 |
|--------|------|
| 200 | 成功 |
| 201 | 作成成功 |
| 400 | リクエストエラー |
| 401 | 認証が必要 |
| 403 | 権限不足 |
| 404 | リソースが見つからない |
| 409 | 競合エラー |
| 500 | サーバーエラー |

### エラーコード

| コード | 説明 |
|--------|------|
| `VALIDATION_ERROR` | 入力値検証エラー |
| `AUTHENTICATION_REQUIRED` | 認証が必要 |
| `INVALID_CREDENTIALS` | 認証情報が無効 |
| `RESOURCE_NOT_FOUND` | リソースが見つからない |
| `DID_NOT_RESOLVABLE` | DIDが解決できない |
| `DUPLICATE_RESOURCE` | 重複リソース |
| `INTERNAL_SERVER_ERROR` | サーバー内部エラー |

## 🛣️ エンドポイント一覧

### 📊 レジストリ

#### 信頼レジストリの取得

```http
GET /api/registry
```

**説明**: 公開されている信頼レジストリ情報を取得します。

**認証**: 不要

**レスポンス**:
```json
{
  "entities": [
    {
      "id": "8fa665b6-7fc5-4b0b-baee-6221b1844ec8",
      "name": "株式会社サンプル",
      "dids": [
        "did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3"
      ],
      "logo_url": "https://example.com/logo.svg",
      "domain": "example.com",
      "role": ["issuer", "verifier"],
      "credentials": [
        "did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0"
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "schemas": [
    {
      "schemaId": "did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0",
      "name": "eKYC証明書",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 🏢 エンティティ管理

#### エンティティ一覧の取得

```http
GET /api/entities
```

**説明**: 登録されているエンティティの一覧を取得します。

**認証**: 必要

**クエリパラメータ**:
- `page` (optional): ページ番号 (デフォルト: 1)
- `limit` (optional): 1ページあたりの件数 (デフォルト: 20)
- `role` (optional): ロールでフィルタ (`issuer`, `verifier`)

**レスポンス**:
```json
{
  "entities": [
    {
      "id": "8fa665b6-7fc5-4b0b-baee-6221b1844ec8",
      "name": "株式会社サンプル",
      "dids": ["did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3"],
      "logo_url": "https://example.com/logo.svg",
      "domain": "example.com",
      "role": ["issuer"],
      "credentials": [
        "did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0"
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### エンティティの詳細取得

```http
GET /api/entities/{id}
```

**説明**: 指定されたIDのエンティティ詳細を取得します。

**認証**: 必要

**パスパラメータ**:
- `id`: エンティティID (UUID)

**レスポンス**:
```json
{
  "id": "8fa665b6-7fc5-4b0b-baee-6221b1844ec8",
  "name": "株式会社サンプル",
  "dids": ["did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3"],
  "logo_url": "https://example.com/logo.svg",
  "domain": "example.com",
  "role": ["issuer"],
  "credentials": [
    "did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0"
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 📋 スキーマ管理

#### スキーマ一覧の取得

```http
GET /api/schemas
```

**説明**: 登録されているスキーマの一覧を取得します。

**認証**: 不要

**レスポンス**:
```json
{
  "schemas": [
    {
      "schemaId": "did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0",
      "name": "eKYC証明書",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 📤 申請管理

#### 招待状の作成

```http
POST /api/invitations
```

**説明**: 新しいエンティティ登録用の招待状を作成します。

**認証**: 必要

**リクエストボディ**:
```json
{
  "emailAddress": "contact@example.com"
}
```

**レスポンス**:
```json
{
  "id": "inv_12345678-1234-1234-1234-123456789abc",
  "url": "http://localhost:3001/submit/inv_12345678-1234-1234-1234-123456789abc",
  "emailAddress": "contact@example.com",
  "expiresAt": "2024-01-22T10:30:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

#### 招待状の再送

```http
POST /api/invitations/{id}/resend
```

**説明**: 既存の招待状を再送信します。

**認証**: 必要

**パスパラメータ**:
- `id`: 招待状ID

**レスポンス**:
```json
{
  "message": "招待状を再送信しました",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### エンティティ申請の提出

```http
POST /api/submission
```

**説明**: 新しいエンティティの登録申請を提出します。

**認証**: 不要（招待状ベース）

**リクエストボディ**:
```json
{
  "invitationId": "inv_12345678-1234-1234-1234-123456789abc",
  "name": "株式会社サンプル",
  "dids": [
    "did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3"
  ],
  "logo_url": "https://example.com/logo.svg",
  "domain": "example.com",
  "role": ["issuer"],
  "credentials": [
    "did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0"
  ]
}
```

**レスポンス**:
```json
{
  "id": "sub_12345678-1234-1234-1234-123456789abc",
  "status": "pending",
  "submittedAt": "2024-01-15T10:30:00.000Z",
  "message": "申請を受理しました。審査後にご連絡いたします。"
}
```

### 🔐 認証

#### ログイン

```http
POST /api/auth/login
```

**説明**: 管理者ログインを行い、JWTトークンを取得します。

**認証**: 不要

**リクエストボディ**:
```json
{
  "email": "admin",
  "password": "your-password"
}
```

**レスポンス**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "tokenType": "Bearer"
}
```

#### ログアウト

```http
POST /api/auth/logout
```

**説明**: ログアウトを行います（クライアント側でのトークン削除）。

**認証**: 必要

**レスポンス**:
```json
{
  "message": "ログアウトしました"
}
```

### 🏥 ヘルスチェック

#### システム状態の確認

```http
GET /health
```

**説明**: システムの稼働状況を確認します。

**認証**: 不要

**レスポンス**:
```
OK
```

#### 詳細ヘルスチェック

```http
GET /api/health/detailed
```

**説明**: システムの詳細な稼働状況を確認します。

**認証**: 必要

**レスポンス**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "database": {
      "status": "connected",
      "responseTime": "15ms"
    },
    "aries": {
      "status": "connected",
      "responseTime": "120ms"
    },
    "indy": {
      "status": "connected",
      "network": "sovrin:mainnet"
    }
  }
}
```

## 📝 データ型定義

### Entity（エンティティ）

```typescript
interface Entity {
  id: string;                    // UUID
  name: string;                  // エンティティ名
  dids: string[];               // DID配列
  logo_url: string;             // ロゴURL (SVG形式)
  domain: string;               // ドメイン
  role: ('issuer' | 'verifier')[]; // ロール配列
  credentials: string[];        // 対応クレデンシャル
  createdAt: string;           // 作成日時 (ISO 8601)
  updatedAt: string;           // 更新日時 (ISO 8601)
}
```

### Schema（スキーマ）

```typescript
interface Schema {
  schemaId: string;            // 完全修飾スキーマID
  name: string;                // スキーマ名
  createdAt: string;          // 作成日時 (ISO 8601)
  updatedAt: string;          // 更新日時 (ISO 8601)
}
```

### Invitation（招待状）

```typescript
interface Invitation {
  id: string;                  // 招待状ID
  url: string;                 // 申請用URL
  emailAddress?: string;       // 送信先メールアドレス
  expiresAt: string;          // 有効期限 (ISO 8601)
  createdAt: string;          // 作成日時 (ISO 8601)
}
```

### Submission（申請）

```typescript
interface Submission {
  id: string;                  // 申請ID
  invitationId: string;        // 招待状ID
  name: string;                // エンティティ名
  dids: string[];             // DID配列
  logo_url: string;           // ロゴURL
  domain: string;             // ドメイン
  role: ('issuer' | 'verifier')[]; // ロール配列
  credentials: string[];      // 対応クレデンシャル
  status: 'pending' | 'approved' | 'rejected'; // 申請状態
  submittedAt: string;        // 申請日時 (ISO 8601)
}
```

## 💡 使用例

### 基本的な使用フロー

#### 1. レジストリ情報の取得

```javascript
// 公開レジストリの取得
const response = await fetch('http://localhost:3000/api/registry');
const registry = await response.json();

console.log('登録エンティティ数:', registry.entities.length);
console.log('対応スキーマ数:', registry.schemas.length);
```

#### 2. 管理者ログイン

```javascript
// 管理者ログイン
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin',
    password: 'your-password'
  })
});

const { token } = await loginResponse.json();

// 以降のAPIコールで使用
const authHeaders = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

#### 3. 招待状の作成

```javascript
// 新しい招待状の作成
const invitationResponse = await fetch('http://localhost:3000/api/invitations', {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify({
    emailAddress: 'new-entity@example.com'
  })
});

const invitation = await invitationResponse.json();
console.log('招待URL:', invitation.url);
```

#### 4. エンティティ申請の提出

```javascript
// エンティティ申請
const submissionResponse = await fetch('http://localhost:3000/api/submission', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    invitationId: invitation.id,
    name: '株式会社テスト',
    dids: ['did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3'],
    logo_url: 'https://example.com/logo.svg',
    domain: 'test-company.com',
    role: ['issuer'],
    credentials: [
      'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0'
    ]
  })
});

const submission = await submissionResponse.json();
console.log('申請ID:', submission.id);
```

### エラーハンドリング

```javascript
async function handleApiCall() {
  try {
    const response = await fetch('http://localhost:3000/api/entities');
    
    if (!response.ok) {
      const error = await response.json();
      console.error('APIエラー:', error.error.message);
      return;
    }
    
    const data = await response.json();
    // 成功時の処理
    console.log(data);
    
  } catch (error) {
    console.error('ネットワークエラー:', error.message);
  }
}
```

### React での使用例

```typescript
import { useState, useEffect } from 'react';

interface TrustRegistry {
  entities: Entity[];
  schemas: Schema[];
}

export function TrustRegistryComponent() {
  const [registry, setRegistry] = useState<TrustRegistry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRegistry() {
      try {
        const response = await fetch('/api/registry');
        if (!response.ok) {
          throw new Error('レジストリの取得に失敗しました');
        }
        const data = await response.json();
        setRegistry(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラー');
      } finally {
        setLoading(false);
      }
    }

    fetchRegistry();
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  if (!registry) return <div>データがありません</div>;

  return (
    <div>
      <h2>信頼レジストリ</h2>
      <p>エンティティ数: {registry.entities.length}</p>
      <p>スキーマ数: {registry.schemas.length}</p>
    </div>
  );
}
```

## 🔧 開発者向けツール

### OpenAPI仕様書

詳細なAPI仕様は、Swagger UIで確認できます：

```
http://localhost:3000/api-docs
```

### Postmanコレクション

プロジェクトルートの `Trust Registry.postman_collection.json` をPostmanにインポートして使用できます。

### cURL例

```bash
# レジストリ取得
curl -X GET "http://localhost:3000/api/registry"

# ログイン
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin"}'

# エンティティ一覧（認証必要）
curl -X GET "http://localhost:3000/api/entities" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**次のステップ**: [貢献ガイドライン](CONTRIBUTING.md)を読んで開発に参加しましょう。 
