import '../styles/Dashboard.css';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { transactionListApi as ListService } from '../services/TransactionService';
import type { ListObj } from '../models/Transaction';
import { formatAmount } from '../utils/formatAmount';
import AIChatPanel from '../components/AIChatPanel';
import AIInsightsSection from '../components/AIInsightsSection';

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

    const [rows, setRows] = useState<ListObj[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const sortedRows = [...rows].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const [page, setPage] = useState(1);
    const pageSize = 20;

    useEffect(() => {
        
        if(!user) return;
        let active = true;
        const load = async ()=> {
            try{
                setLoading(true);
                setErr("");
                const resp  = await ListService(page, pageSize);
                //console.log("RESP", resp.data);
                if (!resp) return;

                //console.log("RESP", resp.data);
                const list: ListObj[] = resp.data.data;
                
                if (!active) return;
                setRows(list);
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
        
    }, [user, page, pageSize]);

    return (
    <div className="dashboard-container">
      <div className="transactions-container">
        
        {!user ? (
          <p>You don't have access to this page. Please <span className='dashboard-span' onClick={() => navigate('/login')}>Sign In.</span></p>
        ) : (
          <>
            {loading ? (
                <div>Loading Transactions</div>
            ) : (
                <>
                <AIInsightsSection />
                <div className='transactions-header'><h2 className='tarnsaction-title'>Transactions</h2><button className='add-transaction-button' onClick={() => navigate('/add-transaction')}> + New Transaction</button></div>
                <div className='transactions-table'>
                    <div className='transactions-table-th'>
                        <div>Category</div>
                        <div>Type</div>
                        <div>Amount</div>
                        <div>Currency</div>
                        <div>Merchant</div>
                        <div>Date</div>

                    </div>

                    {sortedRows.length === 0 ? (
                        <div className='transactions-table-empty'>No Transactions.</div>
                    ) : (
                        sortedRows.map((t) => (
                            <div key={t.id} className='transactions-row'>
                                <div className='transactions-category'>{t.category.name}</div>
                                <div>{t.type}</div>
                                <div className={t.type === "INCOME" ? "amount-income" : "amount-expense"}>
                                    {incomeOrExpense(t.amount, t.type)}
                                </div>
                                <div>{t.currency}</div>
                                <div>{t.merchant}</div>
                                <div>{formatDate(t.date)}</div>
                            </div>
                        ))
                    )}

                </div>

                <div style={{ marginTop: '24px' }}>
                    <AIChatPanel />
                </div>

                </>
            )}
          </>
        )}
          
      
      
      </div>
    </div>
    )
}