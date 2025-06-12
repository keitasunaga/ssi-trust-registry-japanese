# 使用例・サンプル集

SSI信頼レジストリ（日本版）の具体的な使用例とサンプルコードを提供します。

## 📋 目次

- [基本的な使用例](#基本的な使用例)
- [APIクライアント例](#apiクライアント例)
- [フロントエンド統合例](#フロントエンド統合例)
- [実用シナリオ](#実用シナリオ)
- [デプロイメント例](#デプロイメント例)

## 🚀 基本的な使用例

### 1. 信頼レジストリの参照

```javascript
// 公開レジストリから信頼エンティティを取得
async function getTrustedEntities() {
  const response = await fetch('http://localhost:3000/api/registry');
  const registry = await response.json();
  
  // 発行者のみをフィルタリング
  const issuers = registry.entities.filter(entity => 
    entity.role.includes('issuer')
  );
  
  console.log(`信頼できる発行者: ${issuers.length}社`);
  
  return issuers;
}
```

### 2. DID検証の例

```javascript
// 特定のDIDが信頼レジストリに登録されているかチェック
async function validateDidInRegistry(did) {
  const registry = await getTrustedEntities();
  
  const trustedEntity = registry.find(entity => 
    entity.dids.includes(did)
  );
  
  if (trustedEntity) {
    console.log(`✅ DID ${did} は信頼されています`);
    console.log(`発行者: ${trustedEntity.name}`);
    console.log(`ドメイン: ${trustedEntity.domain}`);
    return true;
  } else {
    console.log(`❌ DID ${did} は信頼レジストリに登録されていません`);
    return false;
  }
}

// 使用例
validateDidInRegistry('did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3');
```

## 🔧 APIクライアント例

### Node.js クライアント

```javascript
class TrustRegistryClient {
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  // 管理者認証
  async authenticate(email, password) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('認証に失敗しました');
    }

    const data = await response.json();
    this.token = data.token;
    return data;
  }

  // 認証ヘッダーを取得
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  // レジストリ取得
  async getRegistry() {
    const response = await fetch(`${this.baseUrl}/registry`);
    return await response.json();
  }

  // 招待状作成
  async createInvitation(emailAddress) {
    const response = await fetch(`${this.baseUrl}/invitations`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ emailAddress })
    });

    if (!response.ok) {
      throw new Error('招待状の作成に失敗しました');
    }

    return await response.json();
  }

  // エンティティ申請
  async submitEntity(invitation, entityData) {
    const response = await fetch(`${this.baseUrl}/submission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invitationId: invitation.id,
        ...entityData
      })
    });

    if (!response.ok) {
      throw new Error('申請の送信に失敗しました');
    }

    return await response.json();
  }
}

// 使用例
async function example() {
  const client = new TrustRegistryClient();

  // 管理者ログイン
  await client.authenticate('admin', 'password');

  // 招待状作成
  const invitation = await client.createInvitation('new-entity@example.com');
  console.log('招待URL:', invitation.url);

  // エンティティ申請
  const submission = await client.submitEntity(invitation, {
    name: '株式会社テスト',
    dids: ['did:indy:sovrin:test123'],
    logo_url: 'https://example.com/logo.svg',
    domain: 'test.com',
    role: ['issuer'],
    credentials: [
      'did:indy:sovrin:staging:ABC123/anoncreds/v0/SCHEMA/TestCredential/1.0.0'
    ]
  });

  console.log('申請完了:', submission.id);
}
```

## ⚛️ フロントエンド統合例

### React フック

```typescript
// hooks/useTrustRegistry.ts
import { useState, useEffect } from 'react';

interface Entity {
  id: string;
  name: string;
  dids: string[];
  domain: string;
  role: string[];
  credentials: string[];
}

interface TrustRegistry {
  entities: Entity[];
  schemas: Array<{
    schemaId: string;
    name: string;
  }>;
}

export function useTrustRegistry() {
  const [registry, setRegistry] = useState<TrustRegistry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRegistry() {
      try {
        const response = await fetch('/api/registry');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
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

  return { registry, loading, error };
}
```

### React コンポーネント

```typescript
// components/TrustRegistryViewer.tsx
import React from 'react';
import { useTrustRegistry } from '../hooks/useTrustRegistry';

export function TrustRegistryViewer() {
  const { registry, loading, error } = useTrustRegistry();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-2">読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-red-800 font-medium">エラーが発生しました</h3>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (!registry) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">データが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">信頼レジストリ概要</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">登録エンティティ</h3>
            <p className="text-2xl font-bold text-blue-600">{registry.entities.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">対応スキーマ</h3>
            <p className="text-2xl font-bold text-green-600">{registry.schemas.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">信頼エンティティ一覧</h3>
        <div className="space-y-4">
          {registry.entities.map((entity) => (
            <EntityCard key={entity.id} entity={entity} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EntityCard({ entity }: { entity: Entity }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{entity.name}</h4>
          <p className="text-sm text-gray-500">{entity.domain}</p>
          
          <div className="mt-2 flex flex-wrap gap-2">
            {entity.role.map((role) => (
              <span
                key={role}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {role === 'issuer' ? '発行者' : '検証者'}
              </span>
            ))}
          </div>

          <div className="mt-3">
            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                DID一覧 ({entity.dids.length}件)
              </summary>
              <div className="mt-2 pl-4 space-y-1">
                {entity.dids.map((did) => (
                  <code key={did} className="block text-xs bg-gray-100 p-1 rounded">
                    {did}
                  </code>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🏢 実用シナリオ

### シナリオ1: 大学の学位証明書検証

```javascript
// 大学が発行した学位証明書を検証する例
class UniversityCredentialVerifier {
  constructor(trustRegistryUrl) {
    this.trustRegistryUrl = trustRegistryUrl;
  }

  async verifyDegreeCredential(credential) {
    // 1. 信頼レジストリから大学情報を取得
    const registry = await this.getTrustRegistry();
    
    // 2. クレデンシャルの発行者DIDを確認
    const issuerDid = credential.issuer;
    const university = registry.entities.find(entity => 
      entity.dids.includes(issuerDid) && 
      entity.role.includes('issuer') &&
      entity.credentials.some(cred => cred.includes('DEGREE'))
    );

    if (!university) {
      return {
        valid: false,
        reason: '発行者が信頼レジストリに登録されていません'
      };
    }

    // 3. 学位証明書スキーマの確認
    const degreeSchema = credential.credentialSubject['@type'];
    const supportedSchema = university.credentials.find(cred => 
      cred.includes(degreeSchema)
    );

    if (!supportedSchema) {
      return {
        valid: false,
        reason: 'サポートされていないクレデンシャルタイプです'
      };
    }

    // 4. 検証結果
    return {
      valid: true,
      university: university.name,
      domain: university.domain,
      credentialType: degreeSchema
    };
  }

  async getTrustRegistry() {
    const response = await fetch(`${this.trustRegistryUrl}/api/registry`);
    return await response.json();
  }
}

// 使用例
const verifier = new UniversityCredentialVerifier('http://localhost:3000');
const result = await verifier.verifyDegreeCredential(degreeCredential);

if (result.valid) {
  console.log(`✅ 有効な学位証明書です`);
  console.log(`発行者: ${result.university}`);
} else {
  console.log(`❌ 無効: ${result.reason}`);
}
```

### シナリオ2: 金融機関のKYC情報検証

```javascript
// 金融機関間でのKYC情報共有・検証
class KYCVerificationService {
  constructor(trustRegistryUrl) {
    this.trustRegistryUrl = trustRegistryUrl;
  }

  async verifyKYCCredential(kycCredential, requestingInstitution) {
    const registry = await this.getTrustRegistry();

    // 1. KYC発行元の確認
    const issuer = this.findTrustedIssuer(registry, kycCredential.issuer, 'KYC');
    if (!issuer) {
      return { valid: false, reason: 'KYC発行者が信頼されていません' };
    }

    // 2. 検証要求者の確認
    const verifier = this.findTrustedVerifier(registry, requestingInstitution);
    if (!verifier) {
      return { valid: false, reason: '検証要求者が認証されていません' };
    }

    // 3. コンプライアンスチェック
    const complianceCheck = await this.checkCompliance(
      issuer, 
      verifier, 
      kycCredential
    );

    return {
      valid: complianceCheck.passed,
      issuer: issuer.name,
      verifier: verifier.name,
      complianceLevel: complianceCheck.level,
      expiryDate: kycCredential.expirationDate
    };
  }

  findTrustedIssuer(registry, did, credentialType) {
    return registry.entities.find(entity =>
      entity.dids.includes(did) &&
      entity.role.includes('issuer') &&
      entity.credentials.some(cred => cred.includes(credentialType))
    );
  }

  findTrustedVerifier(registry, institutionDomain) {
    return registry.entities.find(entity =>
      entity.domain === institutionDomain &&
      entity.role.includes('verifier')
    );
  }

  async checkCompliance(issuer, verifier, credential) {
    // 金融庁規制に基づくコンプライアンスチェック
    const regulations = ['JFSA', 'AML', 'KYC'];
    
    return {
      passed: true,
      level: 'high',
      regulations: regulations
    };
  }

  async getTrustRegistry() {
    const response = await fetch(`${this.trustRegistryUrl}/api/registry`);
    return await response.json();
  }
}
```

### シナリオ3: 医療機関での資格確認

```javascript
// 医師資格証明書の検証システム
class MedicalLicenseVerifier {
  async verifyDoctorLicense(licenseCredential, hospitalDomain) {
    const registry = await this.getTrustRegistry();

    // 1. 医師会（発行者）の確認
    const medicalAssociation = registry.entities.find(entity =>
      entity.dids.includes(licenseCredential.issuer) &&
      entity.role.includes('issuer') &&
      entity.domain.includes('med.or.jp') // 日本医師会
    );

    if (!medicalAssociation) {
      return {
        valid: false,
        reason: '認可された医師会からの発行ではありません'
      };
    }

    // 2. 病院（検証者）の確認
    const hospital = registry.entities.find(entity =>
      entity.domain === hospitalDomain &&
      entity.role.includes('verifier')
    );

    if (!hospital) {
      return {
        valid: false,
        reason: '検証要求病院が登録されていません'
      };
    }

    // 3. 専門分野の確認
    const specialty = licenseCredential.credentialSubject.specialty;
    const specialtyValid = this.validateSpecialty(specialty);

    return {
      valid: specialtyValid,
      doctorName: licenseCredential.credentialSubject.name,
      specialty: specialty,
      licenseNumber: licenseCredential.credentialSubject.licenseNumber,
      issuer: medicalAssociation.name,
      verifier: hospital.name
    };
  }

  validateSpecialty(specialty) {
    const validSpecialties = [
      '内科', '外科', '小児科', '産婦人科', '整形外科',
      '皮膚科', '眼科', '耳鼻咽喉科', '泌尿器科', '精神科'
    ];
    return validSpecialties.includes(specialty);
  }

  async getTrustRegistry() {
    const response = await fetch('http://localhost:3000/api/registry');
    return await response.json();
  }
}
```

## 🚀 デプロイメント例

### Docker Compose での本番デプロイ

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  trust-registry:
    image: ssi-trust-registry-jp:latest
    ports:
      - "80:3000"
      - "443:3001"
    environment:
      - NODE_ENV=production
      - DB_CONNECTION_STRING=mongodb://mongo:27017/trust-registry
      - JWT_SECRET=${JWT_SECRET}
      - ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD_HASH}
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:6.0
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - trust-registry

volumes:
  mongo_data:
  redis_data:
```

### Kubernetes デプロイメント

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trust-registry-jp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: trust-registry-jp
  template:
    metadata:
      labels:
        app: trust-registry-jp
    spec:
      containers:
      - name: trust-registry
        image: ssi-trust-registry-jp:latest
        ports:
        - containerPort: 3000
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: production
        - name: DB_CONNECTION_STRING
          valueFrom:
            secretKeyRef:
              name: trust-registry-secrets
              key: db-connection-string
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"

---
apiVersion: v1
kind: Service
metadata:
  name: trust-registry-service
spec:
  selector:
    app: trust-registry-jp
  ports:
  - name: api
    port: 3000
    targetPort: 3000
  - name: frontend
    port: 3001
    targetPort: 3001
  type: LoadBalancer
```

## 🔄 CI/CD パイプライン例

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: yarn install
        
      - name: Run tests
        run: yarn test
        
      - name: Run linter
        run: yarn lint

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t ssi-trust-registry-jp:${{ github.sha }} .
        
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push ssi-trust-registry-jp:${{ github.sha }}
          
      - name: Deploy to production
        run: |
          # Helmを使用したKubernetesデプロイ
          helm upgrade --install trust-registry-jp \
            ./helm/trust-registry \
            --set image.tag=${{ github.sha }} \
            --set environment=production
```

---

これらの例を参考に、あなたのプロジェクトに SSI 信頼レジストリを統合してください。何かご不明な点がございましたら、[Issues](https://github.com/your-username/ssi-trust-registry-japanese/issues) でお気軽にお問い合わせください！ 
