# 积分系统 (Points System)

这是一个完整的积分系统实现，支持用户注册奖励、订阅奖励、年度订阅每月自动发放、文件配置、多语言支持等功能。

## 功能特性

### 🎯 核心功能
- ✅ 用户积分管理（获得、消费、查询）
- ✅ 积分交易历史记录
- ✅ 配置文件系统（无需数据库配置）
- ✅ 数据库持久化
- ✅ 管理员积分管理
- ✅ 多语言支持（中文/英文）
- ✅ Stripe 和 Creem 支付集成
- ✅ 年度订阅每月自动积分发放
- ✅ 防重复发放机制

### 🏆 积分获得方式
- ✅ 注册赠送积分（100积分）
- ✅ 订阅购买奖励（500积分，支持 Stripe 和 Creem）
- ✅ 订阅续费奖励（500积分，与订阅一致）
- ✅ 年度订阅每月自动发放（500积分×12个月）
- ✅ 管理员手动赠送

### 💰 积分发放规则

#### 月度订阅
- 每次支付时获得 500 积分
- 通过 `subscription.paid` 事件自动发放

#### 年度订阅
- **首次付款**：当月立即获得 500 积分
- **后续月份**：每天自动检查，为当月未发放积分的用户发放 500 积分
- **总共获得**：500 × 12 = 6000 积分（分12个月发放）

## 数据库结构

### 用户表扩展 (user)
- `points`: 用户当前积分余额

### 积分交易表 (points_transaction)
- `id`: 交易ID
- `userId`: 用户ID  
- `amount`: 积分数量（正数为获得，负数为消费）
- `type`: 交易类型（earn/spend/refund/admin_adjust）
- `reason`: 交易原因（subscription_purchase/subscription_renewal/signup_bonus）
- `description`: 描述
- `referenceId`: 关联ID（planId）
- `referenceType`: 关联类型（subscription）
- `createdAt`: 创建时间

### 支付表 (payment)
- `id`: 支付ID
- `userId`: 用户ID
- `priceId`: 价格ID
- `interval`: 订阅间隔（month/year）
- `status`: 支付状态（active/canceled等）
- `periodStart`: 周期开始时间
- `periodEnd`: 周期结束时间

## 配置文件

### `/src/types/points.ts`
直接通过配置文件管理积分系统参数，无需数据库：

```typescript
export const DEFAULT_POINTS_CONFIG = {
  [PointsConfigKeys.SIGNUP_BONUS]: 100,
  [PointsConfigKeys.SUBSCRIPTION_SIGNUP_BONUS]: 500, // 订阅/续费统一积分
  [PointsConfigKeys.SUBSCRIPTION_RENEWAL_BONUS]: 500, // 续费奖励积分 (与订阅一致)
  [PointsConfigKeys.SUBSCRIPTION_REWARD_RATE]: 10, // 10 points per dollar
  [PointsConfigKeys.POINTS_SYSTEM_ENABLED]: true,
  [PointsConfigKeys.POINTS_DISPLAY_NAME]: 'Points',
  [PointsConfigKeys.POINTS_EXPIRY_DAYS]: 0, // Never expire
  [PointsConfigKeys.POINTS_TO_CURRENCY_RATE]: 100, // 100 points = $1
  [PointsConfigKeys.PLAN_BONUSES]: {
    plus: 300,
    pro: 500,
    ultra: 1000,
  } as Record<string, number>,
};
```

## 技术实现

### 1. 积分生成 (Points Earning)

#### 事件处理
- **集中化处理**：只在 `subscription.paid` 事件中发放积分
- **避免重复**：年度订阅只发放当月积分，避免重复
- **智能识别**：自动区分首次订阅和续费

#### 核心方法
```typescript
// 处理订阅积分（支持月度和年度）
static async handleSubscriptionPayment(
  userId: string,
  planId: string,
  interval: 'month' | 'year',
  periodStart: Date,
  isFirstPayment: boolean = false
): Promise<void>

// 处理注册奖励
static async handleSignupBonus(userId: string): Promise<void>
```

#### 重复检查机制
- **月度订阅**：按月份检查（YYYY-MM格式）
- **年度订阅**：按每个月份检查，确保12个月都能发放
- **数据库查询**：检查已存在的交易记录避免重复

### 2. 积分消耗 (Points Spending)

#### 核心方法
```typescript
static async spendPoints({
  userId,
  amount,
  reason,
  description,
  referenceId,
  referenceType,
}: {
  userId: string;
  amount: number;
  reason: PointsTransactionReason;
  description?: string;
  referenceId?: string;
  referenceType?: PointsReferenceType;
}): Promise<PointsTransaction>
```

#### 安全机制
- **余额检查**：消费前检查用户积分余额
- **数据库事务**：使用事务确保数据一致性
- **负数记录**：消费记录为负数，便于统计

### 3. 年度订阅自动发放系统

#### 定时任务
- **API 端点**：`/api/cron/monthly-points`
- **执行频率**：每天 00:00 UTC
- **功能**：检查所有活跃的年度订阅用户，为当月未发放积分的用户发放积分

#### 核心逻辑
```typescript
static async processMonthlyAnnualSubscriptionPoints(): Promise<void> {
  // 1. 查找所有活跃的年度订阅
  // 2. 检查当月是否已发放积分
  // 3. 为未发放的用户发放积分
  // 4. 记录详细日志
}
```

#### 智能查询
```sql
SELECT userId, priceId, subscriptionId, periodStart, periodEnd
FROM payment 
WHERE status = 'active' 
  AND interval = 'year'
  AND periodEnd >= CURRENT_DATE 
  AND periodStart <= CURRENT_DATE;
```

### 4. 配置管理

#### 简化配置系统
- **文件配置**：直接从 `DEFAULT_POINTS_CONFIG` 读取
- **无需数据库**：移除数据库配置依赖
- **实时生效**：修改配置文件后重启即可生效

```typescript
static async getConfigValue<T>(
  key: PointsConfigKeys,
  defaultValue?: T
): Promise<T> {
  // 直接从配置文件读取
  const configValue = DEFAULT_POINTS_CONFIG[key];
  const result = (configValue !== undefined ? configValue : defaultValue) as T;
  return result;
}
```

## 部署配置

### Vercel 自动化部署
已配置 `vercel.json`：
```json
{
  "crons": [
    {
      "path": "/api/cron/monthly-points",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 环境变量
建议设置 `CRON_SECRET` 环境变量来保护 cron 端点：
```bash
CRON_SECRET=your-secret-key
```

### 其他平台部署

#### GitHub Actions
```yaml
name: Daily Points Check
on:
  schedule:
    - cron: '0 0 * * *'  # 每天 00:00 运行
jobs:
  daily-points:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Daily Points Check
        run: |
          curl -X POST https://your-domain.com/api/cron/monthly-points \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

#### 系统 Cron Job
```bash
# 每天 00:00 运行
0 0 * * * curl -X POST https://your-domain.com/api/cron/monthly-points -H "Authorization: Bearer YOUR_SECRET"
```

## API 接口

### 用户接口
- `GET /api/points/summary` - 获取用户积分摘要
- `GET /api/points/transactions` - 获取积分交易历史

### 管理员接口  
- `POST /api/points/admin/award` - 手动给用户赠送积分

### 自动化接口
- `GET /api/cron/monthly-points` - 年度订阅每月积分发放（定时任务）

### 调试接口
- `GET /api/points/debug/system-status` - 检查积分系统状态
- `POST /api/points/debug/award-signup-bonus` - 手动触发注册奖励

## 监控和日志

### 日志格式
```
🎯 [MONTHLY POINTS] Starting monthly points processing for annual subscriptions
📅 [MONTHLY POINTS] Processing for month: 2025-08
📊 [MONTHLY POINTS] Found 25 active annual subscriptions
🎉 [SUBSCRIPTION PAYMENT] Awarding 500 annual subscription monthly points to user abc123 for month 2025-08
⚠️ [SUBSCRIPTION PAYMENT] Annual monthly bonus already awarded for user def456, plan pro, month 2025-08. Skipping.
✅ [MONTHLY POINTS] Completed monthly points processing for 25 subscriptions
```

### 手动触发
开发和测试时可以手动调用：
```bash
curl -X POST http://localhost:3000/api/cron/monthly-points \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 积分服务类

### 核心方法
- `PointsService.awardPoints()` - 给用户赠送积分
- `PointsService.spendPoints()` - 扣除用户积分  
- `PointsService.getUserPointsSummary()` - 获取用户积分摘要
- `PointsService.getUserTransactions()` - 获取用户交易历史
- `PointsService.handleSignupBonus()` - 处理注册奖励
- `PointsService.handleSubscriptionPayment()` - 处理订阅积分（新方法）
- `PointsService.processMonthlyAnnualSubscriptionPoints()` - 处理年度订阅每月积分

### 配置管理
- `PointsService.getConfigValue()` - 获取配置值（从文件读取）
- `PointsService.getAllConfig()` - 获取所有配置

## 多语言支持

积分系统完全支持多语言，目前支持中文和英文：

### 翻译文件位置
- 英文：`/messages/en.json` - `Points` 节点
- 中文：`/messages/zh.json` - `Points` 节点

### 支持的翻译键
```json
{
  "Points": {
    "title": "我的积分 / My Points",
    "totalPoints": "总积分 / Total Points", 
    "totalEarned": "总获得 / Total Earned",
    "totalSpent": "总消费 / Total Spent",
    "thisMonth": "本月获得 / This Month",
    "thisYear": "本年获得 / This Year",
    "lastTransaction": "最近交易 / Latest Transaction",
    "showHistory": "查看积分历史 / View Points History",
    "hideHistory": "隐藏历史 / Hide History",
    "noHistory": "暂无积分历史 / No points history yet",
    "loading": "积分加载中... / Loading points...",
    "errorLoading": "无法加载积分信息 / Unable to load points information",
    "reasons": {
      "signup_bonus": "注册赠送 / Sign-up Bonus",
      "subscription_purchase": "订阅奖励 / Subscription Reward", 
      "subscription_renewal": "续费奖励 / Renewal Reward",
      "manual_adjustment": "人工调整 / Manual Adjustment",
      "admin_grant": "管理员赠送 / Admin Grant"
    }
  }
}
```

## 使用方法

### 1. 运行数据库迁移
```bash
npm run db:migrate
```

### 2. 在仪表板中显示积分
```tsx
import { PointsCard } from '@/components/dashboard/points-card';

export default function Dashboard() {
  return (
    <div className="grid gap-4">
      <PointsCard />
      {/* 其他仪表板组件 */}
    </div>
  )
}
```

### 3. 手动赠送积分
```bash
curl -X POST /api/points/admin/award \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "amount": 500,
    "reason": "admin_grant", 
    "description": "活动奖励"
  }'
```

## 积分获得时机

### 自动触发
1. **用户注册**: 自动获得 100 积分注册奖励
2. **月度订阅**: 每次支付获得 500 积分
3. **年度订阅**: 
   - 首次支付：当月立即获得 500 积分
   - 后续11个月：每天自动检查发放 500 积分
   - 续费：每年续费时重复上述流程

### 支付事件集成
- **Stripe**: 通过 `subscription.paid` webhook 自动触发
- **Creem**: 通过 `subscription.paid` webhook 自动触发
- **防重复**: 智能检查机制避免重复发放

## 故障排除

### 常见问题
1. **积分重复发放**：系统会自动检查并跳过已发放的积分
2. **定时任务未执行**：检查 Vercel cron jobs 配置和环境变量  
3. **部分用户未获得积分**：检查订阅状态和时间范围
4. **积分未到账**: 检查用户ID是否正确，查看日志错误信息
5. **配置不生效**: 确保配置已正确保存到配置文件并重启

### 数据库查询

检查年度订阅用户：
```sql
SELECT userId, priceId, periodStart, periodEnd 
FROM payment 
WHERE status = 'active' 
  AND interval = 'year' 
  AND periodEnd >= CURRENT_DATE 
  AND periodStart <= CURRENT_DATE;
```

检查积分发放记录：
```sql
SELECT userId, amount, reason, description, createdAt
FROM points_transaction 
WHERE reason IN ('subscription_purchase', 'subscription_renewal')
  AND description LIKE '%Annual subscription monthly bonus%'
ORDER BY createdAt DESC;
```

检查用户积分余额：
```sql
SELECT id, email, points, createdAt 
FROM user 
WHERE points > 0 
ORDER BY points DESC;
```

### 调试方法
1. 查看服务器日志
2. 检查数据库中的积分交易记录  
3. 使用API测试工具验证接口功能
4. 调用调试接口检查系统状态

## 配置修改

### 修改积分数量
编辑 `src/types/points.ts` 文件：
```typescript
export const DEFAULT_POINTS_CONFIG = {
  [PointsConfigKeys.SUBSCRIPTION_SIGNUP_BONUS]: 500, // 修改此值
  [PointsConfigKeys.SIGNUP_BONUS]: 100, // 注册奖励
  // ...
};
```

### 修改定时任务频率
编辑 `vercel.json` 文件：
```json
{
  "crons": [
    {
      "path": "/api/cron/monthly-points",
      "schedule": "0 0 * * *"  // 每天运行，可修改为其他频率
    }
  ]
}
```

## 注意事项

1. **数据库事务**: 积分操作使用数据库事务确保数据一致性
2. **错误处理**: 所有积分操作都有完善的错误处理  
3. **日志记录**: 重要操作都会记录详细日志
4. **权限控制**: 管理员功能需要适当的权限验证
5. **配置简化**: 现在使用文件配置，无需数据库配置表
6. **防重复机制**: 多层检查确保积分不会重复发放
7. **年度订阅**: 通过每日检查确保年度用户每月都能获得积分
8. **事件集中**: 只在 `subscription.paid` 事件发放积分，避免多事件冲突

## 扩展功能

### 可扩展的功能
1. **积分商城**: 可以扩展积分兑换功能
2. **积分排行榜**: 显示用户积分排名  
3. **积分过期**: 实现积分自动过期机制
4. **积分转赠**: 用户之间转赠积分
5. **积分任务**: 完成任务获得积分
6. **VIP积分倍率**: 不同会员等级获得不同积分倍率

### 添加新的积分获得方式
1. 在 `PointsTransactionReason` 类型中添加新的原因
2. 在 `PointsService` 中添加处理方法  
3. 在相应的业务逻辑中调用积分奖励

这个积分系统提供了完整的积分管理功能，支持多种获得方式，具有防重复机制，并且支持年度订阅的每月自动发放，是一个生产就绪的积分系统解决方案。