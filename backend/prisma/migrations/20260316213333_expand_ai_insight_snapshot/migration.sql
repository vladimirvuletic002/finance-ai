/*
  Warnings:

  - You are about to drop the column `content` on the `AIInsight` table. All the data in the column will be lost.
  - You are about to drop the column `insightType` on the `AIInsight` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `AIInsight` table. All the data in the column will be lost.
  - Added the required column `aiRecommendation` to the `AIInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `AIInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentSavingsEstimate` to the `AIInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `AIInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `predictedRecurringCosts` to the `AIInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `savingsGoalAmount` to the `AIInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `savingsProgressPercent` to the `AIInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `savingsRemainingAmount` to the `AIInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spendingChangeCurrentMonth` to the `AIInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spendingChangeDirection` to the `AIInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spendingChangePercent` to the `AIInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spendingChangePreviousMonth` to the `AIInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topCategoryTotalSpent` to the `AIInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AIInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `AIInsight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AIInsight" DROP COLUMN "content",
DROP COLUMN "insightType",
DROP COLUMN "title",
ADD COLUMN     "aiRecommendation" TEXT NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "currentSavingsEstimate" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "metaJson" JSONB,
ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "predictedRecurringCosts" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "recurringTransactionsJson" JSONB,
ADD COLUMN     "savingsGoalAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "savingsGoalTitle" TEXT,
ADD COLUMN     "savingsProgressPercent" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "savingsRemainingAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "spendingChangeCurrentMonth" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "spendingChangeDirection" TEXT NOT NULL,
ADD COLUMN     "spendingChangePercent" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "spendingChangePreviousMonth" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "topCategoryId" INTEGER,
ADD COLUMN     "topCategoryName" TEXT,
ADD COLUMN     "topCategoryTotalSpent" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "AIInsight_userId_year_month_idx" ON "AIInsight"("userId", "year", "month");
