# Web Push 推播 403 錯誤診斷清單

當部署到 Vercel 後出現「單裝置推播未送達 Received unexpected response code（狀態碼 403）」時，請依序執行以下測試並回報結果。

## 📋 測試清單（請逐項執行）

### 1️⃣ 確認環境變數已正確載入
**在正式網站的瀏覽器 Console 執行：**
```js
fetch('/api/push/health').then(r=>r.json()).then(console.log)
```

**期望結果：**
```json
{
  "ok": true,
  "source": "env",
  "hasPublicEnv": true,
  "hasPrivateEnv": true,
  "publicKeyPrefix": "BIJ02ntplBWkIq9...",
  "privateKeyExists": true
}
```

**若結果不符合請複製整段 JSON 回報：**
- `source` 不是 "env" → 環境變數未生效
- `hasPublicEnv` 或 `hasPrivateEnv` 為 false → 變數缺失或名稱錯誤
- `publicKeyPrefix` 與本地 .env.local 不同 → 部署時未使用正確金鑰

---

### 2️⃣ 確認公鑰一致性
**在正式網站的瀏覽器 Console 執行：**
```js
fetch('/api/push/public-key').then(r=>r.json()).then(console.log)
```

**期望結果：**
```json
{
  "ok": true,
  "publicKey": "BIJ02ntplBWkIq9IvrMRtk2qlPBFxgmRvJGkQpJqbc6s_sx_l79v6eY4wNjGtUTE_YbHMwhf_RcMxhfJmFDQdOo"
}
```

**若結果不符合請複製整段 JSON 回報：**
- `publicKey` 與本地 .env.local 的 NEXT_PUBLIC_VAPID_PUBLIC_KEY 不同 → 金鑰不一致
- 多次執行回傳不同值 → 正在動態生成金鑰（環境變數未生效）

---

### 3️⃣ 檢查本機訂閱狀態
**在正式網站的瀏覽器 Console 執行：**
```js
navigator.serviceWorker.ready
  .then(reg => reg.pushManager.getSubscription())
  .then(sub => {
    if (!sub) { 
      console.log('❌ NO_SUBSCRIPTION - 請先按「啟用通知」或「重設推播」'); 
      return;
    }
    const j = sub.toJSON()
    console.log('✅ 訂閱存在:', {
      endpoint: j.endpoint,
      endpointTail: j.endpoint.slice(-32),
      hasKeys: !!(j.keys?.p256dh && j.keys?.auth)
    })
  })
```

**若顯示 NO_SUBSCRIPTION：**
1. 先按頁面上的「重設推播」按鈕
2. 重新執行此測試
3. 若仍無訂閱，回報通知權限狀態（下一項測試）

---

### 4️⃣ 檢查通知權限
**在正式網站的瀏覽器 Console 執行：**
```js
navigator.permissions.query({name: 'notifications'}).then(r => console.log('通知權限:', r.state))
```

**期望結果：** `通知權限: "granted"`

**若為 "denied" 或 "prompt"：**
- 點擊網址列左側鎖頭圖示 → Site settings → 允許通知
- 重新載入頁面並按「重設推播」

---

### 5️⃣ 確認伺服器端有此訂閱
**在正式網站按「查看訂閱清單」按鈕，或在 Console 執行：**
```js
fetch(`/api/push/list?eventId=${location.pathname.split('/').pop()}`)
  .then(r=>r.json())
  .then(d => console.log('訂閱清單:', d))
```

**期望結果：**
```json
{
  "ok": true,
  "count": 1,
  "subscriptions": [
    {
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "endpointTail": "...後32字元...",
      "p256dh": "...",
      "auth": "..."
    }
  ]
}
```

**若結果不符合請複製整段 JSON 回報：**
- `count: 0` → 訂閱未寫入資料庫，檢查 /api/push/subscribe 是否成功
- `endpointTail` 與測試 3️⃣ 的不同 → 訂閱不匹配（可能多台裝置或舊訂閱）

---

### 6️⃣ 手動觸發單裝置推播並取得詳細錯誤
**在正式網站的瀏覽器 Console 執行：**
```js
(async () => {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) { console.log('❌ 無訂閱'); return; }
  
  const eventId = location.pathname.split('/').pop();
  const resp = await fetch('/api/push/notify-one', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId,
      endpoint: sub.toJSON().endpoint,
      title: '診斷測試',
      message: '403 診斷'
    })
  });
  const data = await resp.json();
  console.log('推播結果:', data);
})()
```

**期望結果：**
```json
{
  "ok": true,
  "delivered": 1,
  "total": 1,
  "failed": []
}
```

**若為 403 請複製完整 failed 陣列：**
```json
{
  "ok": true,
  "delivered": 0,
  "total": 1,
  "failed": [
    {
      "endpoint": "https://fcm.googleapis.com/...",
      "error": "詳細錯誤訊息",
      "statusCode": 403
    }
  ]
}
```

---

### 7️⃣ 檢查 Service Worker 註冊狀態
**在正式網站開啟 DevTools：**
1. Application 面板 → Service Workers
2. 確認看到你的網域與 `/sw.js`
3. 狀態應為 "activated and running"

**若 SW 未註冊或報錯，請回報：**
- SW 檔案路徑（應為 `/sw.js`）
- 錯誤訊息（紅字）
- Scope 是否正確（通常是 `/`）

---

### 8️⃣ 資料庫結構確認
**到 Supabase 後台執行 SQL：**
```sql
-- 檢查 push_subscriptions 表是否存在
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'push_subscriptions' 
ORDER BY ordinal_position;

-- 檢查是否有訂閱資料
SELECT event_id, endpoint, created_at 
FROM push_subscriptions 
ORDER BY created_at DESC 
LIMIT 5;
```

**期望看到：**
- 表包含欄位：id, event_id, tenant_id, endpoint, p256dh, auth, created_at
- 至少有一筆訂閱資料且 endpoint 開頭為 `https://fcm.googleapis.com/`

**若表不存在或結構不符，請執行：**
`docs/sql-push-subscriptions.sql` 的內容

---

### 9️⃣ 跨活動名稱隔離（資料庫 migration）
**到 Supabase 後台執行 SQL：**
```sql
-- 檢查 participants 表的唯一約束
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.participants'::regclass
  AND contype = 'u';
```

**期望看到：**
- 約束名稱包含 `uniq_participant_per_event` 或類似
- definition 包含 `UNIQUE (event_id, name)`

**若未套用 migration，請執行：**
`docs/migration-participant-name-per-event.sql` 的完整內容

---

## 🔟 最終診斷步驟（若上述皆正常仍 403）

**在瀏覽器 Console 比對金鑰：**
```js
Promise.all([
  fetch('/api/push/health').then(r=>r.json()),
  fetch('/api/push/public-key').then(r=>r.json()),
  navigator.serviceWorker.ready
    .then(reg => reg.pushManager.getSubscription())
    .then(sub => sub ? sub.toJSON() : null)
]).then(([health, pk, sub]) => {
  console.log('=== 完整診斷報告 ===');
  console.log('1. Health Check:', health);
  console.log('2. Public Key API:', pk.publicKey);
  console.log('3. 本地 .env.local NEXT_PUBLIC_VAPID_PUBLIC_KEY:', 'BIJ02ntplBWkIq9IvrMRtk2qlPBFxgmRvJGkQpJqbc6s_sx_l79v6eY4wNjGtUTE_YbHMwhf_RcMxhfJmFDQdOo');
  console.log('4. 訂閱 Endpoint tail:', sub ? sub.endpoint.slice(-32) : 'NO_SUB');
  console.log('5. 金鑰一致性:', pk.publicKey === 'BIJ02ntplBWkIq9IvrMRtk2qlPBFxgmRvJGkQpJqbc6s_sx_l79v6eY4wNjGtUTE_YbHMwhf_RcMxhfJmFDQdOo' ? '✅ 一致' : '❌ 不一致');
})
```

**請將完整輸出複製回報。**

---

## 📝 常見 403 原因與對應修正

| 症狀 | 原因 | 解法 |
|------|------|------|
| health 的 source 不是 "env" | Vercel 環境變數未設或名稱錯 | 重新確認變數名稱、重新部署 |
| public-key 每次不同 | 正在動態生成金鑰 | 確保 Vercel 有設 VAPID_PRIVATE_KEY |
| 金鑰不一致 | 訂閱時用舊金鑰、送訊息用新金鑰 | 所有裝置「重設推播」 |
| 訂閱清單為空 | /api/push/subscribe 寫入失敗 | 檢查 Network 面板的 subscribe 請求回應 |
| SW 未註冊 | /sw.js 路徑錯誤或 CORS | 確認 public/sw.js 存在且可訪問 |
| 資料庫無 push_subscriptions 表 | 未執行 migration | 執行 docs/sql-push-subscriptions.sql |

---

## ✅ 回報格式範例

請依序執行測試 1️⃣ 到 6️⃣，並以下列格式回報：

```
測試 1 - Health Check:
{複製 JSON}

測試 2 - Public Key:
{複製 JSON}

測試 3 - 本機訂閱:
{複製輸出}

測試 4 - 通知權限:
{複製結果}

測試 5 - 訂閱清單:
{複製 JSON}

測試 6 - 單裝置推播:
{複製 JSON，特別是 failed 陣列}
```

收到你的測試結果後，我將精準定位問題並提供對應修復步驟。
