import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import CurrencyInput from 'react-currency-input-field';
import { categoryListApi } from '../services/CategoryService';
import { transactionUpdateApi } from '../services/TransactionService';
import type { ListObj, TransactionUpdatePayload } from '../models/Transaction';
import type { ListObj as CategoryObj } from '../models/Category';
import { toast } from 'react-toastify';
import '../styles/validation.css';
import '../styles/Modal.css';

type FormValues = Required<Omit<TransactionUpdatePayload, 'note'>> & { note?: string };

const schema: Yup.ObjectSchema<FormValues> = Yup.object({
    categoryId: Yup.number()
        .transform((v, o) => (o === '' || Number.isNaN(v) ? undefined : v))
        .typeError('Category is required')
        .required('Category is required'),
    amount: Yup.number()
        .typeError('Amount must be a number')
        .moreThan(0, 'Amount must be greater than zero')
        .required('Amount is required'),
    currency: Yup.string().required('Currency is required'),
    merchant: Yup.string().required('Merchant is required'),
    note: Yup.string().optional(),
    date: Yup.string().required('Date is required'),
}).required();

type Props = {
    transaction: ListObj;
    onClose: () => void;
    onSaved: () => void;
};

export default function EditTransactionModal({ transaction, onClose, onSaved }: Props) {
    const [categories, setCategories] = useState<CategoryObj[]>([]);
    const [amountInput, setAmountInput] = useState(Number(transaction.amount).toFixed(2));
    const [saving, setSaving] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            categoryId: transaction.categoryId,
            amount: Number(transaction.amount),
            currency: transaction.currency,
            merchant: transaction.merchant,
            note: transaction.note ?? '',
            date: transaction.date.split('T')[0],
        },
    });

    useEffect(() => {
        register('amount');
        categoryListApi().then(r => {
            if (r?.data) {
                setCategories(r.data.data);
                // Options weren't in the DOM when defaultValues ran, so re-set now.
                setValue('categoryId', transaction.categoryId);
            }
        });
    }, [register, setValue, transaction.categoryId]);

    const handleAmountChange = (value?: string) => {
        const raw = value ?? '';
        setAmountInput(raw);
        const n = Number(raw);
        setValue('amount', raw.trim() === '' ? NaN : n, { shouldValidate: true, shouldDirty: true });
    };

    const handleAmountBlur = () => {
        const n = Number(amountInput);
        if (!amountInput.trim() || Number.isNaN(n)) {
            setAmountInput('');
            setValue('amount', NaN, { shouldValidate: true, shouldDirty: true });
        } else {
            setAmountInput(n.toFixed(2));
            setValue('amount', n, { shouldValidate: true, shouldDirty: true });
        }
    };

    const onSubmit = async (form: FormValues) => {
        setSaving(true);
        try {
            await transactionUpdateApi(transaction.id, form);
            toast.success('Transaction updated');
            onSaved();
        } catch {
            toast.error('Failed to update transaction');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">Edit Transaction</h3>

                <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="modal-field">
                        <label>Category</label>
                        <select {...register('categoryId', { valueAsNumber: true })}>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.categoryId && <p className="field-error">{errors.categoryId.message}</p>}
                    </div>

                    <div className="modal-field">
                        <label>Amount</label>
                        <CurrencyInput
                            value={amountInput}
                            placeholder="0.00"
                            allowDecimals
                            decimalsLimit={2}
                            decimalSeparator="."
                            groupSeparator=","
                            disableAbbreviations
                            allowNegativeValue={false}
                            inputMode="decimal"
                            onValueChange={handleAmountChange}
                            onBlur={handleAmountBlur}
                        />
                        {errors.amount && <p className="field-error">{errors.amount.message}</p>}
                    </div>

                    <div className="modal-field">
                        <label>Currency</label>
                        <select {...register('currency')}>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="RSD">RSD</option>
                        </select>
                        {errors.currency && <p className="field-error">{errors.currency.message}</p>}
                    </div>

                    <div className="modal-field">
                        <label>Merchant</label>
                        <input type="text" {...register('merchant')} />
                        {errors.merchant && <p className="field-error">{errors.merchant.message}</p>}
                    </div>

                    <div className="modal-field">
                        <label>Date</label>
                        <input type="date" {...register('date')} />
                        {errors.date && <p className="field-error">{errors.date.message}</p>}
                    </div>

                    <div className="modal-field modal-field--full">
                        <label>Note</label>
                        <textarea rows={2} placeholder="Optional note…" {...register('note')} />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="modal-btn-save" disabled={saving}>
                            {saving ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
