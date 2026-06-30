import '../styles/Dashboard.css';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { transactionListApi as ListService, transactionDeleteApi } from '../services/TransactionService';
import type { ListObj } from '../models/Transaction';
import { formatAmount } from '../utils/formatAmount';
import AIChatPanel from '../components/AIChatPanel';
import AIInsightsSection from '../components/AIInsightsSection';
import EditTransactionModal from '../components/EditTransactionModal';
import { FiCheck, FiX } from 'react-icons/fi';
import TrashIcon from '../assets/trash.svg?react';
import { toast } from 'react-toastify';

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB");

export const incomeOrExpense = (amount: string, type: string) => {
    const formatted = formatAmount(amount);

  return type === "INCOME"
    ? `+${formatted}`
    : `-${formatted}`;
};

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Show the latest 100 transactions, 10 per page (max 10 pages).
    const PAGE_SIZE = 10;
    const MAX_TRANSACTIONS = 100;

    const [rows, setRows] = useState<ListObj[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setErr] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [editingTx, setEditingTx] = useState<ListObj | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const reload = () => setRefreshKey(k => k + 1);

    const sortedRows = [...rows].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const cappedTotal = Math.min(total, MAX_TRANSACTIONS);
    const totalPages = Math.max(1, Math.ceil(cappedTotal / PAGE_SIZE));

    // Guard against landing on a now-empty page after the total shrinks.
    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    useEffect(() => {

        if(!user) return;
        let active = true;
        const load = async ()=> {
            try{
                setLoading(true);
                setErr("");
                const resp  = await ListService(page, PAGE_SIZE);
                if (!resp) return;

                const list: ListObj[] = resp.data.data;

                if (!active) return;
                setRows(list);
                setTotal(resp.data.pagination.total);
            }
            catch(e: any){
                if (!active) return;
                const msg = e?.response?.data?.message || e?.message || "Failed to load transactions.";
                setErr(msg);
            }
            finally{
                if (active) setLoading(false);
            }
        }

        load();

        return () => {
            active = false;
        }

    }, [user, page, refreshKey]);

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await transactionDeleteApi(id);
            toast.success('Transaction deleted');
            setConfirmDeleteId(null);
            reload();
        } catch {
            toast.error('Failed to delete transaction');
        } finally {
            setDeletingId(null);
        }
    };

    return (
    <div className="dashboard-container">
      <div className="transactions-container">
        
        {!user ? (
          <p>You don't have access to this page. Please <span className='dashboard-span' onClick={() => navigate('/login')}>Sign In.</span></p>
        ) : (
          <>
                <AIInsightsSection />
                <div className='transactions-header animate-up'><h2 className='tarnsaction-title'>Transactions</h2><button className='add-transaction-button' onClick={() => navigate('/add-transaction')}> + New Transaction</button></div>
                <div className='transactions-table'>
                    {loading ? (
                        <div className='transactions-table-empty loading-pulse'>Loading Transactions…</div>
                    ) : sortedRows.length === 0 ? (
                        <div className='transactions-table-empty'>No Transactions.</div>
                    ) : (
                        sortedRows.map((t, i) => (
                            <div key={t.id} className='tx-wrapper' style={{ animationDelay: `${i * 0.04}s` }}>
                                {/* Card — clicking opens edit modal */}
                                <div className='transactions-row' onClick={() => setEditingTx(t)}>
                                    <div className='tx-main'>
                                        <span className='tx-category'>{t.category.name}</span>
                                        <span className='tx-merchant'>{t.merchant}</span>
                                    </div>
                                    <div className='tx-side'>
                                        <span className={t.type === "INCOME" ? "amount-income" : "amount-expense"}>
                                            {incomeOrExpense(t.amount, t.type)} {t.currency}
                                        </span>
                                        <span className='tx-date'>{formatDate(t.date)}</span>
                                    </div>
                                </div>

                                {/* Trash / confirm — outside the card */}
                                {confirmDeleteId === t.id ? (
                                    <div className='tx-delete-confirm'>
                                        <span>Delete?</span>
                                        <button
                                            className='tx-btn tx-btn-confirm-yes'
                                            disabled={deletingId === t.id}
                                            onClick={() => handleDelete(t.id)}
                                            title="Confirm delete"
                                        >
                                            <FiCheck />
                                        </button>
                                        <button
                                            className='tx-btn tx-btn-confirm-no'
                                            onClick={() => setConfirmDeleteId(null)}
                                            title="Cancel"
                                        >
                                            <FiX />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className='tx-trash-btn'
                                        onClick={() => setConfirmDeleteId(t.id)}
                                        title="Delete transaction"
                                    >
                                        <TrashIcon />
                                    </button>
                                )}
                            </div>
                        ))
                    )}

                </div>

                {cappedTotal > PAGE_SIZE && (
                    <div className='transactions-pagination animate-up delay-1'>
                        <button
                            className='pagination-button'
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={loading || page <= 1}
                        >
                            ‹ Prev
                        </button>
                        <span className='pagination-status'>Page {page} of {totalPages}</span>
                        <button
                            className='pagination-button'
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={loading || page >= totalPages}
                        >
                            Next ›
                        </button>
                    </div>
                )}

                <div className="animate-up delay-2" style={{ marginTop: '24px' }}>
                    <AIChatPanel />
                </div>

                {editingTx && (
                    <EditTransactionModal
                        transaction={editingTx}
                        onClose={() => setEditingTx(null)}
                        onSaved={() => { setEditingTx(null); reload(); }}
                    />
                )}
          </>
        )}
          
      
      
      </div>
    </div>
    )
}