-- Data safety: refreshForUser() used to find-then-create/update without a DB
-- constraint, so a race between two concurrent refreshes could have produced
-- more than one AIInsight row for the same (userId, year, month). Drop all
-- but the most recently created row per group before enforcing uniqueness.
DELETE FROM "AIInsight" a USING "AIInsight" b
WHERE a."userId" = b."userId"
  AND a."year" = b."year"
  AND a."month" = b."month"
  AND a."id" < b."id";

-- DropIndex
DROP INDEX "AIInsight_userId_year_month_idx";

-- CreateIndex
CREATE UNIQUE INDEX "AIInsight_userId_year_month_key" ON "AIInsight"("userId", "year", "month");

-- CreateIndex
CREATE INDEX "Transaction_userId_date_idx" ON "Transaction"("userId", "date");

-- CreateIndex
CREATE INDEX "Transaction_userId_type_date_idx" ON "Transaction"("userId", "type", "date");

-- CreateIndex
CREATE INDEX "Transaction_userId_categoryId_date_idx" ON "Transaction"("userId", "categoryId", "date");

-- CreateIndex
CREATE INDEX "Transaction_userId_merchant_date_idx" ON "Transaction"("userId", "merchant", "date");
