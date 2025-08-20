## 初始操作
cp env.example .env
npm install 

## 数据库
替换connect 里面的password，password可以在 database setting 里面看
![image.png](https://droid-1309187949.cos.ap-chengdu.myqcloud.com/markdown20250729101954120.png)
![image.png](https://droid-1309187949.cos.ap-chengdu.myqcloud.com/markdown20250729103005514.png)

运行数据库初始化操作  
npm run db:generate 
npm run db:migrate

## 主题
主题系统在 `website.tsx` 配置文件中配置。
~~~
export const websiteConfig: WebsiteConfig = {
  metadata: {
    theme: {
      defaultTheme: 'default', // 选择：default、blue、green、amber、neutral
      enableSwitch: true,      // 启用/禁用主题切换
    },
    // ...其他配置
  },
  // ...其余配置
};
~~~

## 登录
- 授权的 JavaScript 来源：添加您的域（例如，https://your-domain.com 或 http://localhost:3000）
- 授权的重定向 URI：添加 https://your-domain.com/api/auth/callback/google（或本地开发的 http://localhost:3000/api/auth/callback/google）
- 环境变量 NEXT_PUBLIC_BASE_URL

## 支付
### Creem
NEXT_PUBLIC_PAYMENT_PROVIDER="creem"
PAYMENT_PROVIDER="creem"
CREEM_API_KEY="creem_test_2IEU7AZtnkNTx3R25DMQ2D"
![image.png](https://droid-1309187949.cos.ap-chengdu.myqcloud.com/markdown20250730103510260.png)

配置webhook  https://your-domain.com/api/webhooks/creem
![image.png](https://droid-1309187949.cos.ap-chengdu.myqcloud.com/markdown20250730103756419.png)

点击复制密钥  Signing secret
![image.png](https://droid-1309187949.cos.ap-chengdu.myqcloud.com/markdown20250730103955882.png)

CREEM_WEBHOOK_SECRET="whsec_2ovkBjZN3LEX1DPYCb9yHU"

CREEM_API_BASE_URL=“https://test-api.creem.io”   https://api.creem.io

创建好对应的产品id 
![image.png](https://droid-1309187949.cos.ap-chengdu.myqcloud.com/markdown20250730104640440.png)

环境变量设置对应的id
NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY="prod_6iTu3V0c4UJ0W5pemD2giV"

NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY="prod_38EdgYYCPzwKDbDVqdJzG3"

config/website.tsx
amount 配置价格 

config/price-config 配置价格信息

## 存储
https://mksaas.com/zh/docs/storage

