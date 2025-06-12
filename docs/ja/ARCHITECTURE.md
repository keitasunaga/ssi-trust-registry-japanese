# アーキテクチャ解説

SSI信頼レジストリ（日本版）のシステムアーキテクチャについて詳しく解説します。

## 📋 目次

- [システム概要](#システム概要)
- [アーキテクチャパターン](#アーキテクチャパターン)
- [コンポーネント構成](#コンポーネント構成)
- [データフロー](#データフロー)
- [セキュリティアーキテクチャ](#セキュリティアーキテクチャ)
- [スケーラビリティ](#スケーラビリティ)

## 🏗️ システム概要

### 高レベルアーキテクチャ

```mermaid
graph TB
    subgraph "クライアント層"
        WEB[Webブラウザ]
        MOBILE[モバイルアプリ]
        API_CLIENT[APIクライアント]
    end
    
    subgraph "プレゼンテーション層"
        FRONTEND[Next.js Frontend<br/>Port: 3001]
    end
    
    subgraph "アプリケーション層"
        API[Express.js API<br/>Port: 3000]
        AUTH[認証サービス]
        REGISTRY[レジストリサービス]
        VALIDATION[検証サービス]
    end
    
    subgraph "SSI層"
        ARIES[Hyperledger Aries<br/>Framework]
        DID_RESOLVER[DID解決サービス]
    end
    
    subgraph "データ層"
        MONGO[(MongoDB<br/>Port: 27017)]
        REDIS[(Redis Cache)]
    end
    
    subgraph "外部サービス"
        INDY[Hyperledger Indy<br/>Network]
        SMTP[SMTPサーバー]
    end
    
    WEB --> FRONTEND
    MOBILE --> API
    API_CLIENT --> API
    FRONTEND --> API
    
    API --> AUTH
    API --> REGISTRY
    API --> VALIDATION
    
    VALIDATION --> DID_RESOLVER
    DID_RESOLVER --> ARIES
    ARIES --> INDY
    
    AUTH --> MONGO
    REGISTRY --> MONGO
    VALIDATION --> MONGO
    
    API --> REDIS
    API --> SMTP
```

### 設計思想

1. **分離関心の原則**: 各層が明確な責務を持つ
2. **マイクロサービス指向**: コンポーネントの独立性と再利用性
3. **API First**: フロントエンドとバックエンドの疎結合
4. **セキュリティバイデザイン**: 設計段階からのセキュリティ考慮
5. **スケーラビリティ**: 水平・垂直スケーリングへの対応

## 🔧 アーキテクチャパターン

### 1. レイヤードアーキテクチャ

```
┌─────────────────────────────────────────┐
│         プレゼンテーション層              │
│  (Next.js, React, TypeScript)          │
├─────────────────────────────────────────┤
│           アプリケーション層              │
│    (Express.js, Business Logic)        │
├─────────────────────────────────────────┤
│              サービス層                  │
│    (Entity, Schema, Validation)        │
├─────────────────────────────────────────┤
│              インフラ層                  │
│   (MongoDB, Aries, External APIs)      │
└─────────────────────────────────────────┘
```

### 2. ヘキサゴナルアーキテクチャ（一部採用）

```
     ┌─────────────┐
     │   外部API   │
     └──────┬──────┘
            │
    ┌───────▼───────┐
    │  アダプター層  │
    └───────┬───────┘
            │
    ┌───────▼───────┐
    │ アプリケーション│
    │     コア       │
    └───────┬───────┘
            │
    ┌───────▼───────┐
    │ リポジトリ層   │
    └───────┬───────┘
            │
     ┌──────▼──────┐
     │ データベース │
     └─────────────┘
```

## 🧩 コンポーネント構成

### フロントエンド（Next.js）

```
packages/frontend/
├── src/
│   ├── app/                 # App Router
│   │   ├── globals.css      # グローバルスタイル
│   │   ├── layout.tsx       # レイアウトコンポーネント
│   │   ├── page.tsx         # ホームページ
│   │   └── submit/          # 申請フォーム
│   ├── common/              # 共通コンポーネント
│   │   ├── components/      # UIコンポーネント
│   │   └── types/           # 型定義
│   ├── fixtures/            # テストデータ
│   └── api.ts              # APIクライアント
├── public/                  # 静的ファイル
└── package.json
```

#### 主要コンポーネント

1. **レイアウトシステム**
   - `RootLayout`: 全体レイアウト
   - `Header`: ナビゲーション
   - `Footer`: フッター

2. **フォームコンポーネント**
   - `SubmissionForm`: エンティティ申請フォーム
   - `FormTextInput`: テキスト入力
   - `TextArea`: テキストエリア
   - `Checkbox`: チェックボックス

3. **データ表示コンポーネント**
   - `EntityCard`: エンティティ表示カード
   - `SchemaList`: スキーマ一覧
   - `TrustRegistry`: レジストリ表示

### バックエンド（Express.js）

```
packages/backend/
├── src/
│   ├── auth/                # 認証機能
│   │   ├── controller.ts    # 認証コントローラー
│   │   └── middleware.ts    # 認証ミドルウェア
│   ├── entity/              # エンティティ管理
│   │   ├── service.ts       # ビジネスロジック
│   │   ├── mongoRepository.ts # データアクセス
│   │   └── validationService.ts # 検証ロジック
│   ├── schema/              # スキーマ管理
│   ├── submission/          # 申請管理
│   ├── registry/            # レジストリ機能
│   ├── did-resolver/        # DID解決
│   ├── email/               # メール機能
│   ├── server.ts           # サーバー設定
│   ├── database.ts         # DB接続
│   └── main.ts             # エントリーポイント
└── package.json
```

#### レイヤー構成

1. **コントローラー層**
   ```typescript
   // HTTP リクエストの処理
   export async function getRegistry(req: Request, res: Response) {
     const registry = await registryService.getRegistry()
     res.json(registry)
   }
   ```

2. **サービス層**
   ```typescript
   // ビジネスロジックの実装
   export async function addEntity(entityDto: EntityDto) {
     await validationService.validateDids(entityDto.dids)
     return await entityRepository.create(entityDto)
   }
   ```

3. **リポジトリ層**
   ```typescript
   // データアクセスの抽象化
   export async function findById(id: string): Promise<Entity | null> {
     return await collection.findOne({ id })
   }
   ```

## 🔄 データフロー

### 1. エンティティ登録フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant F as Frontend
    participant API as Backend API
    participant V as Validation Service
    participant A as Aries Framework
    participant I as Indy Network
    participant DB as MongoDB

    U->>F: エンティティ登録申請
    F->>API: POST /api/submission
    API->>V: DID検証要求
    V->>A: DID解決要求
    A->>I: DIDドキュメント取得
    I-->>A: DIDドキュメント
    A-->>V: 解決結果
    V-->>API: 検証結果
    API->>DB: エンティティ保存
    DB-->>API: 保存完了
    API-->>F: 登録完了レスポンス
    F-->>U: 登録完了通知
```

### 2. 信頼レジストリ取得フロー

```mermaid
sequenceDiagram
    participant C as クライアント
    participant API as Backend API
    participant ES as Entity Service
    participant SS as Schema Service
    participant DB as MongoDB

    C->>API: GET /api/registry
    API->>ES: getEntities()
    API->>SS: getSchemas()
    
    par エンティティ取得
        ES->>DB: find entities
        DB-->>ES: entities data
    and スキーマ取得
        SS->>DB: find schemas
        DB-->>SS: schemas data
    end
    
    ES-->>API: entities
    SS-->>API: schemas
    API-->>C: レジストリデータ
```

### 3. DID解決フロー

```mermaid
sequenceDiagram
    participant VS as Validation Service
    participant DR as DID Resolver
    participant A as Aries Agent
    participant I as Indy VDR
    participant N as Indy Network

    VS->>DR: resolveDid(did)
    DR->>A: agent.dids.resolve(did)
    A->>I: IndyVDR query
    I->>N: ネットワーク問い合わせ
    N-->>I: DIDドキュメント
    I-->>A: 解決結果
    A-->>DR: DIDドキュメント
    DR-->>VS: 検証可能なDID
```

## 🔒 セキュリティアーキテクチャ

### 認証・認可フロー

```mermaid
graph LR
    subgraph "認証フロー"
        LOGIN[ログイン要求] --> AUTH[認証処理]
        AUTH --> JWT[JWT発行]
        JWT --> RESPONSE[認証レスポンス]
    end
    
    subgraph "認可フロー"
        REQUEST[API要求] --> VERIFY[JWT検証]
        VERIFY --> AUTHORIZE[認可チェック]
        AUTHORIZE --> ACCESS[リソースアクセス]
    end
```

### セキュリティ層

1. **ネットワークセキュリティ**
   - HTTPS/TLS暗号化
   - CORS設定
   - Rate Limiting

2. **アプリケーションセキュリティ**
   - JWT認証
   - パスワードハッシュ化（bcrypt）
   - 入力値検証（Zod）

3. **データセキュリティ**
   - MongoDB認証
   - 機密情報の環境変数管理
   - DID暗号学的検証

### セキュリティミドルウェアスタック

```typescript
app.use(helmet())           // セキュリティヘッダー
app.use(cors(corsOptions))  // CORS設定
app.use(rateLimit())        // レート制限
app.use(authMiddleware)     // JWT認証
app.use(validateInput)      // 入力値検証
```

## 📈 スケーラビリティ

### 水平スケーリング戦略

```mermaid
graph TB
    subgraph "ロードバランサー"
        LB[Load Balancer]
    end
    
    subgraph "アプリケーション層"
        API1[API Server 1]
        API2[API Server 2]
        API3[API Server 3]
    end
    
    subgraph "キャッシュ層"
        REDIS1[Redis Master]
        REDIS2[Redis Replica]
    end
    
    subgraph "データベース層"
        MONGO1[MongoDB Primary]
        MONGO2[MongoDB Secondary 1]
        MONGO3[MongoDB Secondary 2]
    end
    
    LB --> API1
    LB --> API2
    LB --> API3
    
    API1 --> REDIS1
    API2 --> REDIS1
    API3 --> REDIS1
    
    REDIS1 --> REDIS2
    
    API1 --> MONGO1
    API2 --> MONGO1
    API3 --> MONGO1
    
    MONGO1 --> MONGO2
    MONGO1 --> MONGO3
```

### パフォーマンス最適化

1. **キャッシュ戦略**
   ```typescript
   // Redis キャッシュの実装例
   async function getEntityFromCache(id: string) {
     const cached = await redis.get(`entity:${id}`)
     if (cached) return JSON.parse(cached)
     
     const entity = await entityRepository.findById(id)
     await redis.setex(`entity:${id}`, 3600, JSON.stringify(entity))
     return entity
   }
   ```

2. **データベース最適化**
   ```javascript
   // MongoDB インデックス設定
   db.entities.createIndex({ "dids": 1 })
   db.entities.createIndex({ "domain": 1 })
   db.schemas.createIndex({ "schemaId": 1 })
   ```

3. **コネクションプーリング**
   ```typescript
   // MongoDB 接続プール設定
   const client = new MongoClient(uri, {
     maxPoolSize: 10,
     minPoolSize: 5,
     maxIdleTimeMS: 30000,
   })
   ```

### モニタリングとログ

```mermaid
graph LR
    subgraph "アプリケーション"
        APP[SSI Trust Registry]
    end
    
    subgraph "ログ収集"
        WINSTON[Winston Logger]
        MORGAN[HTTP Logger]
    end
    
    subgraph "メトリクス"
        PROM[Prometheus]
        GRAFANA[Grafana]
    end
    
    subgraph "アラート"
        ALERT[Alertmanager]
        SLACK[Slack通知]
    end
    
    APP --> WINSTON
    APP --> MORGAN
    APP --> PROM
    
    PROM --> GRAFANA
    PROM --> ALERT
    ALERT --> SLACK
```

## 🔮 将来の拡張性

### 計画中の機能

1. **マルチテナント対応**
   - 組織ごとの分離
   - 権限管理の細分化

2. **APIバージョニング**
   ```
   /api/v1/registry  # 現在
   /api/v2/registry  # 将来版
   ```

3. **イベント駆動アーキテクチャ**
   ```mermaid
   graph LR
     SERVICE[サービス] --> EVENT[イベント発行]
     EVENT --> QUEUE[メッセージキュー]
     QUEUE --> HANDLER[イベントハンドラー]
   ```

4. **GraphQL API**
   ```typescript
   type Query {
     registry: TrustRegistry
     entity(id: ID!): Entity
     schemas: [Schema!]!
   }
   ```

---

**次のステップ**: [API仕様](API.md)でAPIの詳細を確認しましょう。 
