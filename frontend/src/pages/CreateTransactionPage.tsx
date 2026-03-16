import '../styles/CreateTransaction.css';
import CurrencyInput from 'react-currency-input-field';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { transactionCreateApi } from '../services/TransactionService';
import { categoryListApi } from '../services/CategoryService';
import { useForm } from 'react-hook-form';
import { type TransactionCreatePayload } from '../models/Transaction';
import { type ListObj } from '../models/Category';
import { toast } from 'react-toastify';

const validationSchema: Yup.ObjectSchema<TransactionCreatePayload> = Yup.object({
    categoryId: Yup.number().required('Transaction category is required'),
    type: Yup.string().required('Transaction type is required'),
    amount: Yup.number()
        .typeError('Amount must be a number')
        .moreThan(0, 'Amount must be greater than zero')
        .required('Amount is required'),
    currency: Yup.string().required('Currency is required'),
    note: Yup.string().optional(),
    merchant: Yup.string().required('Merchant is required'),
    date: Yup.string().required('Date is required')
}).required();

export default function CreateTransactionPage() {
    const [categories, setCategories] = useState<ListObj[]>([]);
    const [loading, setLoading] = useState(false);

    // RAW vrednost bez zareza, npr. "1000.5"
    const [amountInput, setAmountInput] = useState("");

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset
    } = useForm<TransactionCreatePayload>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            currency: "EUR",
            date: new Date().toISOString().split('T')[0],
        }
    });

    useEffect(() => {
        register("amount");
    }, [register]);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const response = await categoryListApi();

        if (response?.data) {
            const categoryList: ListObj[] = response.data.data;
            setCategories(categoryList);
        }
    };

    const handleAmountValueChange = (value?: string) => {
        const raw = value ?? "";

        // raw je npr "1000" ili "1000.5" — bez zareza
        setAmountInput(raw);

        if (raw.trim() === "" || raw === ".") {
            setValue("amount", NaN, { shouldValidate: true, shouldDirty: true });
            return;
        }

        const numeric = Number(raw);

        setValue("amount", Number.isNaN(numeric) ? NaN : numeric, {
            shouldValidate: true,
            shouldDirty: true
        });
    };

    const handleAmountBlur = () => {
        if (amountInput.trim() === "" || amountInput === ".") {
            setAmountInput("");
            setValue("amount", NaN, { shouldValidate: true, shouldDirty: true });
            return;
        }

        const numeric = Number(amountInput);

        if (Number.isNaN(numeric)) {
            setAmountInput("");
            setValue("amount", NaN, { shouldValidate: true, shouldDirty: true });
            return;
        }

        // cuvamo RAW string sa 2 decimale, bez zareza
        // komponenta ce sama prikazati 1,000.00
        const fixed = numeric.toFixed(2);

        setAmountInput(fixed);
        setValue("amount", numeric, { shouldValidate: true, shouldDirty: true });
    };

    const handleCreateTransaction = async (form: TransactionCreatePayload) => {
        setLoading(true);

        try {
            const response = await transactionCreateApi(form);

            if (response?.data) {
                toast.success("Transaction created successfully");

                reset({
                    categoryId: -1,
                    amount: 0,
                    currency: "EUR",
                    merchant: "",
                    note: "",
                    date: new Date().toISOString().split("T")[0],
                });

                setAmountInput("");
                //navigate("/dashboard");
            }
        } catch {
            toast.error("Failed to create transaction");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="transaction-page-container">
            <div className="create-transaction-container">
                <h2>Input new transaction</h2>

                <form
                    className="create-transaction-form"
                    onSubmit={handleSubmit(handleCreateTransaction)}
                >
                    <div className="category-field">
                        <label>Category</label>

                        <select {...register("categoryId", { valueAsNumber: true })}>
                            <option value="">Select category</option>

                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        {errors.categoryId && <p>{errors.categoryId.message}</p>}
                    </div>

                    <div className="type-field">
                        <label>Type</label>

                        <select {...register("type")}>
                            <option value="INCOME">INCOME</option>
                            <option value="EXPENSE">EXPENSE</option>
                        </select>

                        {errors.type && <p>{errors.type.message}</p>}
                    </div>

                    <div className="amount-field">
                        <label>Amount</label>

                        <CurrencyInput
                            id="amount"
                            name="amount"
                            value={amountInput}
                            placeholder="0.00"
                            allowDecimals
                            decimalsLimit={2}
                            decimalSeparator="."
                            groupSeparator=","
                            disableAbbreviations
                            allowNegativeValue={false}
                            inputMode="decimal"
                            onValueChange={handleAmountValueChange}
                            onBlur={handleAmountBlur}
                        />

                        {errors.amount && <p>{errors.amount.message}</p>}
                    </div>

                    <div className="currency-field">
                        <label>Currency</label>

                        <select {...register("currency")}>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="RSD">RSD</option>
                        </select>

                        {errors.currency && <p>{errors.currency.message}</p>}
                    </div>

                    <div className="merchant-field">
                        <label>Merchant</label>

                        <input
                            type="text"
                            placeholder="Store or company"
                            {...register("merchant")}
                        />

                        {errors.merchant && <p>{errors.merchant.message}</p>}
                    </div>

                    <div className="note-field">
                        <label>Note</label>

                        <textarea
                            className="text-area"
                            placeholder="Optional note..."
                            {...register("note")}
                        />
                    </div>

                    <div className="date-field">
                        <label>Date</label>

                        <input
                            type="date"
                            {...register("date")}
                        />

                        {errors.date && <p>{errors.date.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="create-transaction-btn"
                    >
                        {loading ? "Creating..." : "Create Transaction"}
                    </button>
                </form>
            </div>
        </div>
    );
}