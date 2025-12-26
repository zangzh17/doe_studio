# 支付系统部署详细指南

本文档面向**零基础**读者，详细介绍如何配置和部署 DOE Studio 的 Stripe 支付系统。

---

## 目录

1. [概述](#1-概述)
2. [Stripe 账户设置](#2-stripe-账户设置)
3. [环境变量配置](#3-环境变量配置)
4. [产品和价格配置](#4-产品和价格配置)
5. [Webhook 配置](#5-webhook-配置)
6. [测试支付流程](#6-测试支付流程)
7. [上线生产环境](#7-上线生产环境)
8. [常见问题排查](#8-常见问题排查)

---

## 1. 概述

### 1.1 支付功能

DOE Studio 支持以下支付功能：

| 功能 | 价格 | 说明 |
|-----|------|------|
| 优化额度包 | $2 / ¥10 | 25 次优化额度 |
| DOE 代工 1/2" | $350 | 标准 7 天交付 |
| DOE 代工 1" | $400 | 标准 7 天交付 |
| DOE 代工 2" | $500 | 标准 7 天交付 |
| DOE 代工 4" | $600 | 标准 7 天交付 |
| 加急服务 | +100% | 3 天交付 |

### 1.2 相关文件

| 文件路径 | 作用 |
|---------|------|
| `server/stripe/products.ts` | 产品和价格配置 |
| `server/stripe/checkout.ts` | 支付会话创建 |
| `server/stripe/webhook.ts` | Webhook 处理 |
| `client/src/pages/Pricing.tsx` | 定价页面 |
| `drizzle/schema.ts` | 支付记录表 |

### 1.3 支付流程

```
用户点击购买
      │
      v
前端调用 createCheckoutSession API
      │
      v
后端创建 Stripe Checkout Session
      │
      v
用户重定向到 Stripe 支付页面
      │
      v
用户完成支付
      │
      v
Stripe 发送 Webhook 到后端
      │
      v
后端处理 Webhook，更新用户额度/订单状态
      │
      v
用户重定向回成功页面
```

---

## 2. Stripe 账户设置

### 2.1 注册 Stripe 账户

1. 访问 https://dashboard.stripe.com/register
2. 填写邮箱、密码
3. 验证邮箱
4. 完成账户设置

### 2.2 认领测试沙盒（重要）

DOE Studio 项目已创建了 Stripe 测试沙盒，您需要认领它：

1. 访问认领链接：
   ```
   https://dashboard.stripe.com/claim_sandbox/YWNjdF8xU2hSakI5MWlCU2I3REU0LDE3NjcwODY1NTEv100tPfLeC9X
   ```
2. 登录您的 Stripe 账户
3. 点击 "Claim Sandbox"
4. 沙盒将关联到您的账户

**注意**：认领链接有效期至 2026-02-21，请尽快认领。

### 2.3 获取 API 密钥

1. 登录 Stripe Dashboard
2. 点击右上角 "Developers"
3. 选择 "API keys"
4. 复制以下密钥：
   - **Publishable key**：以 `pk_test_` 开头（前端使用）
   - **Secret key**：以 `sk_test_` 开头（后端使用）

### 2.4 测试模式 vs 生产模式

| 模式 | 密钥前缀 | 用途 |
|-----|---------|------|
| 测试模式 | `pk_test_` / `sk_test_` | 开发和测试 |
| 生产模式 | `pk_live_` / `sk_live_` | 实际收款 |

**重要**：在测试模式下，所有支付都是模拟的，不会产生实际费用。

---

## 3. 环境变量配置

### 3.1 在 Manus 中配置

1. 打开 Management UI
2. 进入 Settings → Secrets
3. 添加以下环境变量：

| 变量名 | 值 | 说明 |
|-------|-----|------|
| STRIPE_SECRET_KEY | sk_test_xxx | Stripe 密钥 |
| STRIPE_WEBHOOK_SECRET | whsec_xxx | Webhook 签名密钥 |
| VITE_STRIPE_PUBLISHABLE_KEY | pk_test_xxx | 前端可见的公钥 |

### 3.2 本地开发配置

创建 `.env` 文件（不要提交到 Git）：

```bash
# .env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### 3.3 验证配置

```typescript
// 在服务器启动时验证
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY');
  process.exit(1);
}
```

---

## 4. 产品和价格配置

### 4.1 当前产品配置

```typescript
// server/stripe/products.ts

export const PRODUCTS = {
  // 优化额度包
  OPTIMIZATION_CREDITS: {
    id: 'optimization_credits_25',
    name: 'Optimization Credits (25)',
    description: '25 optimization credits for DOE design',
    prices: {
      USD: 200,  // $2.00 (以分为单位)
      CNY: 1000, // ¥10.00 (以分为单位)
    },
    credits: 25,
  },

  // DOE 代工服务
  MANUFACTURING: {
    HALF_INCH: {
      id: 'doe_manufacturing_half_inch',
      name: 'DOE Manufacturing (1/2 inch)',
      description: 'Custom DOE manufacturing, 1/2 inch diameter',
      prices: {
        USD: 35000,  // $350.00
        CNY: 245000, // ¥2450.00
      },
    },
    ONE_INCH: {
      id: 'doe_manufacturing_one_inch',
      name: 'DOE Manufacturing (1 inch)',
      description: 'Custom DOE manufacturing, 1 inch diameter',
      prices: {
        USD: 40000,  // $400.00
        CNY: 280000, // ¥2800.00
      },
    },
    TWO_INCH: {
      id: 'doe_manufacturing_two_inch',
      name: 'DOE Manufacturing (2 inch)',
      description: 'Custom DOE manufacturing, 2 inch diameter',
      prices: {
        USD: 50000,  // $500.00
        CNY: 350000, // ¥3500.00
      },
    },
    FOUR_INCH: {
      id: 'doe_manufacturing_four_inch',
      name: 'DOE Manufacturing (4 inch)',
      description: 'Custom DOE manufacturing, 4 inch diameter',
      prices: {
        USD: 60000,  // $600.00
        CNY: 420000, // ¥4200.00
      },
    },
  },

  // 加急服务（额外费用）
  RUSH_SERVICE: {
    id: 'rush_service',
    name: 'Rush Service',
    description: '3-day expedited delivery (100% surcharge)',
    multiplier: 2.0, // 总价翻倍
  },
};
```

### 4.2 修改价格

**示例：将优化额度包价格改为 $3**

```typescript
// server/stripe/products.ts

OPTIMIZATION_CREDITS: {
  // ...
  prices: {
    USD: 300,  // 改为 $3.00
    CNY: 1500, // 改为 ¥15.00
  },
  // ...
},
```

### 4.3 添加新产品

**示例：添加 3 英寸代工选项**

```typescript
// server/stripe/products.ts

MANUFACTURING: {
  // ... 现有产品
  
  THREE_INCH: {
    id: 'doe_manufacturing_three_inch',
    name: 'DOE Manufacturing (3 inch)',
    description: 'Custom DOE manufacturing, 3 inch diameter',
    prices: {
      USD: 55000,  // $550.00
      CNY: 385000, // ¥3850.00
    },
  },
},
```

然后更新前端 `Pricing.tsx` 添加对应的 UI。

### 4.4 在 Stripe Dashboard 创建产品（可选）

虽然代码中定义了产品，但您也可以在 Stripe Dashboard 中创建：

1. 进入 Products → Add product
2. 填写产品名称和描述
3. 添加价格（一次性或订阅）
4. 保存并获取 Price ID

使用 Price ID 创建 Checkout Session：

```typescript
const session = await stripe.checkout.sessions.create({
  line_items: [{
    price: 'price_xxx', // Stripe Price ID
    quantity: 1,
  }],
  // ...
});
```

---

## 5. Webhook 配置

### 5.1 什么是 Webhook？

Webhook 是 Stripe 向您的服务器发送的事件通知。当支付完成、失败或其他事件发生时，Stripe 会调用您配置的 URL。

### 5.2 配置 Webhook 端点

**步骤 1**：在 Stripe Dashboard 配置

1. 进入 Developers → Webhooks
2. 点击 "Add endpoint"
3. 填写端点 URL：
   - 开发环境：使用 Stripe CLI 或 ngrok
   - 生产环境：`https://your-domain.com/api/stripe/webhook`
4. 选择要监听的事件：
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. 点击 "Add endpoint"
6. 复制 "Signing secret"（以 `whsec_` 开头）

**步骤 2**：配置环境变量

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 5.3 Webhook 处理代码

```typescript
// server/stripe/webhook.ts

import { Router } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { userCredits, payments, manufacturingOrders } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Webhook 端点（必须在 express.json() 之前注册）
router.post('/webhook', 
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 处理事件
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { metadata } = session;
  
  if (!metadata) {
    console.error('No metadata in session');
    return;
  }

  const userId = parseInt(metadata.userId);
  const productType = metadata.productType;

  // 记录支付
  await db.insert(payments).values({
    userId,
    stripeSessionId: session.id,
    amount: session.amount_total || 0,
    currency: session.currency || 'usd',
    status: 'completed',
    productType,
    metadata: metadata as any,
  });

  // 根据产品类型处理
  if (productType === 'optimization_credits') {
    // 增加用户额度
    const credits = parseInt(metadata.credits || '25');
    
    await db.update(userCredits)
      .set({
        credits: sql`credits + ${credits}`,
        totalPurchased: sql`total_purchased + ${credits}`,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId));
      
    console.log(`Added ${credits} credits to user ${userId}`);
  } 
  else if (productType === 'manufacturing') {
    // 创建代工订单
    await db.insert(manufacturingOrders).values({
      userId,
      designId: parseInt(metadata.designId),
      size: metadata.size,
      isRush: metadata.isRush === 'true',
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: 'pending',
      stripeSessionId: session.id,
    });
    
    console.log(`Created manufacturing order for user ${userId}`);
    
    // TODO: 发送订单确认邮件
    // await sendOrderConfirmationEmail(userId, metadata);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.error('Payment failed:', paymentIntent.id);
  
  // 更新支付记录状态
  await db.update(payments)
    .set({ status: 'failed' })
    .where(eq(payments.stripePaymentIntentId, paymentIntent.id));
}

export default router;
```

### 5.4 本地测试 Webhook

**方法一：使用 Stripe CLI**

```bash
# 安装 Stripe CLI
brew install stripe/stripe-cli/stripe

# 登录
stripe login

# 转发 Webhook 到本地
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 在另一个终端触发测试事件
stripe trigger checkout.session.completed
```

**方法二：使用 ngrok**

```bash
# 安装 ngrok
brew install ngrok

# 暴露本地端口
ngrok http 3000

# 使用 ngrok URL 配置 Webhook
# https://xxx.ngrok.io/api/stripe/webhook
```

---

## 6. 测试支付流程

### 6.1 测试卡号

Stripe 提供测试卡号用于模拟支付：

| 卡号 | 结果 |
|-----|------|
| 4242 4242 4242 4242 | 支付成功 |
| 4000 0000 0000 0002 | 支付被拒绝 |
| 4000 0000 0000 9995 | 余额不足 |
| 4000 0025 0000 3155 | 需要 3D Secure |

其他信息：
- 有效期：任何未来日期（如 12/34）
- CVC：任意 3 位数字（如 123）
- 邮编：任意 5 位数字（如 12345）

### 6.2 完整测试流程

**测试优化额度购买**：

1. 登录 DOE Studio
2. 进入 Pricing 页面
3. 点击 "Purchase Credits"
4. 在 Stripe 页面输入测试卡号
5. 完成支付
6. 验证额度已增加

**测试代工订单**：

1. 创建一个 DOE 设计
2. 进入 Pricing 页面
3. 点击 "Order Manufacturing"
4. 选择设计和尺寸
5. 完成支付
6. 验证订单已创建

### 6.3 查看测试支付

在 Stripe Dashboard → Payments 可以查看所有测试支付记录。

---

## 7. 上线生产环境

### 7.1 激活 Stripe 账户

1. 进入 Stripe Dashboard
2. 点击 "Activate your account"
3. 填写业务信息：
   - 公司/个人信息
   - 银行账户（用于收款）
   - 税务信息
4. 提交审核

### 7.2 切换到生产模式

**步骤 1**：获取生产密钥

1. 在 Stripe Dashboard 关闭 "Test mode" 开关
2. 复制生产密钥（`pk_live_` 和 `sk_live_`）

**步骤 2**：更新环境变量

```bash
# 生产环境
STRIPE_SECRET_KEY=sk_live_xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

**步骤 3**：配置生产 Webhook

1. 在 Stripe Dashboard 添加生产 Webhook 端点
2. URL：`https://your-domain.com/api/stripe/webhook`
3. 获取新的 Webhook Secret
4. 更新 `STRIPE_WEBHOOK_SECRET`

### 7.3 安全检查清单

| 检查项 | 说明 | 状态 |
|-------|------|------|
| HTTPS | 必须使用 HTTPS | [ ] |
| 密钥安全 | 密钥不能暴露在前端代码中 | [ ] |
| Webhook 验证 | 必须验证 Webhook 签名 | [ ] |
| 错误处理 | 支付失败时正确处理 | [ ] |
| 日志记录 | 记录所有支付事件 | [ ] |
| 退款流程 | 有退款处理机制 | [ ] |

### 7.4 合规要求

根据您的业务所在地，可能需要遵守：

- **PCI DSS**：Stripe 已处理，使用 Checkout 或 Elements 即可
- **GDPR**：欧洲用户数据保护
- **税务合规**：可能需要收取增值税/销售税

---

## 8. 常见问题排查

### 8.1 Webhook 签名验证失败

**错误信息**：
```
Webhook signature verification failed: No signatures found matching the expected signature
```

**解决方案**：
1. 确认 `STRIPE_WEBHOOK_SECRET` 正确
2. 确保 Webhook 端点在 `express.json()` 之前注册
3. 使用 `express.raw()` 中间件

```typescript
// 正确的顺序
app.post('/api/stripe/webhook', 
  express.raw({ type: 'application/json' }),
  webhookHandler
);

// 然后才是
app.use(express.json());
```

### 8.2 支付成功但额度未增加

**排查步骤**：
1. 检查 Webhook 是否收到
2. 检查 Webhook 处理日志
3. 检查数据库更新是否成功

**调试代码**：
```typescript
async function handleCheckoutComplete(session) {
  console.log('Webhook received:', session.id);
  console.log('Metadata:', session.metadata);
  
  // ... 处理逻辑
  
  console.log('Credits updated successfully');
}
```

### 8.3 Checkout Session 创建失败

**错误信息**：
```
Invalid API Key provided
```

**解决方案**：
1. 确认 `STRIPE_SECRET_KEY` 正确
2. 确认密钥与模式匹配（测试/生产）

### 8.4 货币不支持

**错误信息**：
```
Currency 'xxx' is not supported
```

**解决方案**：
检查 Stripe 支持的货币列表，CNY 需要特殊配置。

### 8.5 测试支付在生产环境

**问题**：测试卡号在生产环境不工作

**原因**：测试卡号只在测试模式下有效

**解决方案**：使用真实卡号或切换回测试模式

---

## 附录：完整代码示例

### A.1 创建 Checkout Session

```typescript
// server/stripe/checkout.ts

import { Router } from 'express';
import Stripe from 'stripe';
import { PRODUCTS } from './products';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// 创建优化额度购买会话
router.post('/create-credits-checkout', async (req, res) => {
  try {
    const { userId, currency = 'usd' } = req.body;

    const product = PRODUCTS.OPTIMIZATION_CREDITS;
    const price = currency === 'cny' ? product.prices.CNY : product.prices.USD;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/pricing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId.toString(),
        productType: 'optimization_credits',
        credits: product.credits.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// 创建代工订单会话
router.post('/create-manufacturing-checkout', async (req, res) => {
  try {
    const { userId, designId, size, isRush, currency = 'usd' } = req.body;

    // 获取产品价格
    const sizeKey = {
      '0.5': 'HALF_INCH',
      '1': 'ONE_INCH',
      '2': 'TWO_INCH',
      '4': 'FOUR_INCH',
    }[size];

    const product = PRODUCTS.MANUFACTURING[sizeKey];
    let price = currency === 'cny' ? product.prices.CNY : product.prices.USD;

    // 加急服务
    if (isRush) {
      price *= PRODUCTS.RUSH_SERVICE.multiplier;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          product_data: {
            name: product.name + (isRush ? ' (Rush)' : ''),
            description: product.description,
          },
          unit_amount: Math.round(price),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/pricing?success=true&type=manufacturing`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId.toString(),
        productType: 'manufacturing',
        designId: designId.toString(),
        size,
        isRush: isRush.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

export default router;
```

### A.2 前端支付按钮

```tsx
// client/src/components/PaymentButton.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PaymentButtonProps {
  productType: 'credits' | 'manufacturing';
  designId?: number;
  size?: string;
  isRush?: boolean;
  currency?: 'usd' | 'cny';
  children: React.ReactNode;
}

export function PaymentButton({
  productType,
  designId,
  size,
  isRush,
  currency = 'usd',
  children,
}: PaymentButtonProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = productType === 'credits'
        ? '/api/stripe/create-credits-checkout'
        : '/api/stripe/create-manufacturing-checkout';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          designId,
          size,
          isRush,
          currency,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handlePayment} disabled={isLoading}>
      {isLoading ? 'Processing...' : children}
    </Button>
  );
}
```

---

## 参考资料

1. [Stripe 官方文档](https://stripe.com/docs)
2. [Stripe Checkout 指南](https://stripe.com/docs/payments/checkout)
3. [Stripe Webhooks 指南](https://stripe.com/docs/webhooks)
4. [Stripe CLI 文档](https://stripe.com/docs/stripe-cli)
5. [PCI DSS 合规](https://stripe.com/docs/security/guide)
