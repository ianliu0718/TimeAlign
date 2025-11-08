-- Migration: 修正 participants 表的唯一約束，允許同名稱在不同活動中使用
-- 目的：密碼鎖定的名稱應該只在同一活動內互斥，不同活動之間可重複使用

-- 1. 刪除舊的全局唯一約束（如果存在）
-- 這個約束可能命名為 uniq_locked_participant_name 或類似名稱
-- 請根據實際資料庫調整約束名稱
ALTER TABLE public.participants 
DROP CONSTRAINT IF EXISTS uniq_locked_participant_name;

ALTER TABLE public.participants 
DROP CONSTRAINT IF EXISTS participants_name_key;

ALTER TABLE public.participants 
DROP CONSTRAINT IF EXISTS participants_locked_name_key;

-- 2. 建立新的複合唯一約束：(event_id, name)
-- 確保同一活動內名稱唯一，但不同活動可重複
ALTER TABLE public.participants 
ADD CONSTRAINT uniq_participant_per_event 
UNIQUE (event_id, name);

-- 3. 建立索引以優化查詢效能
CREATE INDEX IF NOT EXISTS idx_participants_event_name 
ON public.participants(event_id, name);

-- 說明：
-- 原有邏輯錯誤：全局唯一約束導致一旦某人在活動 A 用密碼鎖定「張三」，
-- 其他人就無法在活動 B 使用「張三」這個名稱。
-- 
-- 修正後：(event_id, name) 複合唯一約束確保：
-- - 活動 A 的「張三」與活動 B 的「張三」是獨立的
-- - 同一活動內仍然維持名稱唯一性
-- - 密碼鎖定機制在每個活動內獨立運作
