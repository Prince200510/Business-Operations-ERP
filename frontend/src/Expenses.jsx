import React, { useEffect, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Expenses = () => {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const categories = ["Rent", "Electricity", "Salaries", "Marketing", "Office Supplies", "Logistics", "Maintenance", "Others"];

    const fetch_expenses = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/expenses/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                localStorage.removeItem('access_token');
                navigate('/');
                return;
            }
            if (response.ok) {
                const data = await response.json();
                setExpenses(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetch_expenses();
    }, []);

    const handleClear = () => {
        setCategory('');
        setAmount('');
        setDescription('');
    };

    const handleSave = async () => {
        if (!category || !amount) {
            Swal.fire({
                title: 'Error!',
                text: 'Please select a category and enter an amount',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return;
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/expenses/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    category: category,
                    amount: Number(amount),
                    description: description
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to log expense');
            }

            Swal.fire({
                title: 'Success!',
                text: 'Expense logged successfully',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then(() => {
                handleClear();
            });

            fetch_expenses();
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: error.message || 'Failed to log expense',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };

    const handleDelete = async (expenseId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            const token = localStorage.getItem('access_token');
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/expenses/${expenseId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    Swal.fire('Deleted!', 'Expense has been deleted.', 'success');
                    fetch_expenses();
                } else {
                    const data = await response.json();
                    throw new Error(data.detail || 'Failed to delete expense');
                }
            } catch (error) {
                Swal.fire('Error!', error.message, 'error');
            }
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-container-margin w-full bg-background font-body-md text-on-background">
            <div className="flex flex-col gap-gutter max-w-[1600px] mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="font-h1 text-h1 text-on-surface">Business Expenses</h2>
                        <p className="font-body-md text-on-surface-variant mt-1">Track and manage your operational expenses</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row items-start gap-6">
                    <div className="w-full lg:w-1/3 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-density-medium border-b border-outline-variant bg-surface-container-lowest">
                                <h3 className="font-h3 text-[16px] text-on-surface">Log New Expense</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm bg-white">
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Amount (₹) <span className="text-red-500">*</span></label>
                                    <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm resize-none h-24" placeholder="Add details about this expense..."></textarea>
                                </div>

                                <button onClick={handleSave} className="w-full mt-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm">Log Expense</button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-2/3 bg-surface-container-lowest rounded-lg border border-outline-variant flex flex-col overflow-hidden shadow-sm">
                        <div className="p-density-medium border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
                            <h3 className="font-h3 text-[16px] text-on-surface">Expense History</h3>
                            <div className="font-medium text-primary-700 bg-primary-50 px-3 py-1 rounded-full text-sm border border-primary-100">
                                Total: ₹{expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toFixed(2)}
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto max-h-[600px]">
                            <table className="w-full text-sm text-left whitespace-nowrap min-w-[600px]">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Date</th>
                                        <th className="px-6 py-4 font-semibold">Category</th>
                                        <th className="px-6 py-4 font-semibold">Description</th>
                                        <th className="px-6 py-4 font-semibold text-right">Amount (₹)</th>
                                        <th className="px-6 py-4 font-semibold text-center w-16">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {expenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors bg-white">
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(expense.expense_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={expense.description}>
                                                {expense.description || '-'}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-red-600 text-right">
                                                -{parseFloat(expense.amount).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => handleDelete(expense.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete Expense"><AiOutlineDelete className="text-lg" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {expenses.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500 bg-white">
                                                No expenses logged yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Expenses;
