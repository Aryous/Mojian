# AI 服务调用规范

## 规则

所有 AI API 调用必须经过 `src/service/ai/provider.ts`。
任何其他位置直接实例化 AI 客户端都是违规的。

## 正确做法

```typescript
// 在 src/service/ai/ 下定义服务
import { aiProvider } from '@/service/ai/provider'

export async function scoreResume(content: string) {
  return aiProvider.chat({ ... })
}
```

```typescript
// 在 Runtime 层调用 Service
import { scoreResume } from '@/service/ai/scoring'
```

## 禁止做法

```typescript
// ❌ 在 src/ui/ 或其他非 service 层直接调用
import OpenAI from 'openai'
const client = new OpenAI({ ... })
```

## 为什么

- 统一管理 API Key 和 Provider 切换（OpenRouter / 直连）
- 集中处理错误、重试、速率限制
- 方便测试（mock service 层即可）
