-- Migration: 允許同一 endpoint 訂閱多個活動（以 (endpoint, event_id) 為唯一）
-- 問題：原本 endpoint unique 造成同一瀏覽器只能綁定最後一個活動，
--       導致在活動 A 訂閱後又到活動 B 訂閱，A 的通知不會送達。

-- 1) 移除舊的 endpoint 單欄位唯一約束（名稱可能為 push_subscriptions_endpoint_key）
ALTER TABLE public.push_subscriptions
DROP CONSTRAINT IF EXISTS push_subscriptions_endpoint_key;

-- 2) 新增複合唯一約束 (endpoint, event_id)
ALTER TABLE public.push_subscriptions
ADD CONSTRAINT uniq_push_sub_per_event UNIQUE (endpoint, event_id);

-- 3) 輔助索引（如尚未建立）
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_event_id ON public.push_subscriptions(event_id);

-- 4) 若有租戶欄位仍可保留既有索引
-- CREATE INDEX IF NOT EXISTS idx_push_subscriptions_event_tenant ON public.push_subscriptions(event_id, tenant_id);
