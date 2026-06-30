import '../styles/AIInsights.css';
import { useEffect, useState } from 'react';
import { getAIInsightsApi } from '../services/AIInsightsService';
import type { AIInsightSnapshotResponse } from '../models/AIInsights';
import { formatAmount } from '../utils/formatAmount';
import { getActiveSavingsGoalApi, upsertActiveSavingsGoalApi } from '../services/SavingsGoalService';

export default function AIInsightsSection() {
    const [data, setData] = useState<AIInsightSnapshotResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [goalAmountInput, setGoalAmountInput] = useState("");
    const [savingGoalUpdating, setSavingGoalUpdating] = useState(false);


    const loadInsights = async () => {
        const resp = await getAIInsightsApi();
        setData(resp?.data || null);
        setGoalAmountInput(String(resp?.data?.savingsGoalAmount) || "0");
    };

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                setLoading(true);
                setErr("");

                const [insightsResp, goalResp] = await Promise.all([
                    getAIInsightsApi(),
                    getActiveSavingsGoalApi()
                ]);

                if (!active) return;

                setData(insightsResp?.data || null);

                const goalAmount =
                    goalResp?.data?.targetAmount ?? insightsResp?.data?.savingsGoalAmount;

                setGoalAmountInput(String(goalAmount) || "0");
            } catch (e: any) {
                if (!active) return;
                const msg = e?.response?.data?.message || e?.message || "Failed to load AI insights.";
                setErr(msg);
            } finally {
                if (active) setLoading(false);
            }
        };

        load();

        return () => {
            active = false;
        };
    }, []);

    const handleSaveGoal = async () => {
        const numeric = Number(goalAmountInput);

        if (!numeric || numeric <= 0) return;

        try {
            setSavingGoalUpdating(true);
            await upsertActiveSavingsGoalApi({
                targetAmount: numeric,
                currency: data?.currency || "EUR"
            });
            await loadInsights();
        } catch (e) {
            console.error(e);
        } finally {
            setSavingGoalUpdating(false);
        }
    };

    if (loading) {
        return <div className="ai-insights-wrapper loading-pulse">Loading AI insights...</div>;
    }

    if (err) {
        return <div className="ai-insights-wrapper">Failed to load AI insights: {err}</div>;
    }

    if (!data) {
        return <div className="ai-insights-wrapper">No AI insights available.</div>;
    }

    const spendingText =
        data.spendingChangeDirection === 'same'
            ? 'Your spending is unchanged from last month.'
            : data.spendingChangeDirection === 'down'
                ? `You spent ${data.spendingChangePercent}% less than last month`
                : `You spent ${data.spendingChangePercent}% more than last month`;

    const recurringTransactions = Array.isArray(data.recurringTransactionsJson)
        ? data.recurringTransactionsJson
        : [];

    return (
        <section className="ai-insights-wrapper">
            <div className="ai-insights-header animate-up">
                <h2>AI Insights</h2>
                <p>Smart financial summaries and predictions based on your latest transactions.</p>
            </div>

            <div className="ai-insights-grid">
                <div className="ai-card animate-up delay-1">
                    <div className="ai-card-label">Spending Change</div>
                    <div className="ai-card-value">{spendingText}</div>
                    <div className="ai-card-subtext">
                        Current: {formatAmount(data.spendingChangeCurrentMonth)} {data.currency}
                    </div>
                    <div className="ai-card-subtext">
                        Previous: {formatAmount(data.spendingChangePreviousMonth)} {data.currency}
                    </div>
                </div>

                <div className="ai-card animate-up delay-2">
                    <div className="ai-card-label">Recurring Forecast</div>
                    <div className="ai-card-value">
                        Expected recurring expenses next month:{" "}
                        {formatAmount(data.predictedRecurringCosts)}{" "}
                        {data.currency}
                    </div>

                    <div className="ai-card-subtext">
                        {recurringTransactions.length === 0
                            ? "No stable recurring payments detected yet."
                            : recurringTransactions
                                .slice(0, 3)
                                .map(item => `${item.displayLabel} (${formatAmount(item.averageAmount)} ${item.currency})`)
                                .join(" • ")}
                    </div>
                </div>

                <div className="ai-card animate-up delay-3">
                    <div className="ai-card-label">Top Spending Category</div>
                    <div className="ai-card-value">
                        Top spending category this month: {data.topCategoryName ?? "N/A"}
                    </div>
                    <div className="ai-card-subtext">
                        {formatAmount(data.topCategoryTotalSpent)} {data.currency}
                    </div>
                </div>
            </div>

            <div className="saving-goal-card animate-up delay-4">
                <div className="saving-goal-header">
                    <div>
                        <h3>Saving Goal</h3>
                        <p>
                            Goal: {formatAmount(data.savingsGoalAmount)} {data.currency}
                        </p>
                    </div>
                    <div className="saving-goal-progress-text">
                        {data.savingsProgressPercent}%
                    </div>
                </div>

                <div className="saving-goal-edit-row">
                    <input
                        type="number"
                        value={goalAmountInput}
                        onChange={(e) => setGoalAmountInput(e.target.value)}
                        className="saving-goal-input"
                        min="1"
                        step="0.01"
                    />
                    <button
                        type="button"
                        className="saving-goal-save-btn"
                        onClick={handleSaveGoal}
                        disabled={savingGoalUpdating}
                    >
                        {savingGoalUpdating ? "Saving..." : "Update Goal"}
                    </button>
                </div>

                <div className="saving-goal-progress-bar">
                    <div
                        className="saving-goal-progress-fill"
                        style={{ width: `${data.savingsProgressPercent}%` }}
                    />
                </div>

                <div className="saving-goal-stats">
                    <div>
                        Current savings estimate:{" "}
                        <strong>
                            {formatAmount(data.currentSavingsEstimate)} {data.currency}
                        </strong>
                    </div>
                    <div>
                        Remaining:{" "}
                        <strong>
                            {formatAmount(data.savingsRemainingAmount)} {data.currency}
                        </strong>
                    </div>
                </div>

                <div className="saving-goal-recommendation">
                    <span>AI recommendation:</span> {data.aiRecommendation}
                </div>
            </div>
        </section>
    );
}