import React, { useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';

const HistorySale = () => {
    const [sales, setSales] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('all');
    const navigate = useNavigate();

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/customers/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCustomers(data);
            }
        } catch (error) {
            console.error('Failed to fetch customers', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/products/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
        }
    };

    const fetchSales = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/sales/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                localStorage.removeItem("access_token");
                navigate('/');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setSales(data);
            } else {
                console.error('Failed to fetch sales history');
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCustomers();
        fetchProducts();
        fetchSales();
    }, []);

    const filterSalesByMonth = (salesList, month) => {
        if (month === 'all') {
            return salesList;
        } else {
            return salesList.filter(sale => {
                const saleDate = new Date(sale.created_at);
                return saleDate.getMonth() + 1 === parseInt(month);
            });
        }
    };

    const filteredSales = filterSalesByMonth(sales, selectedMonth);

    const getCustomerName = (customerId) => {
        const cust = customers.find(c => c.id === customerId);
        return cust ? cust.name : `Unknown (ID: ${customerId})`;
    };

    const getProductName = (productId) => {
        const prod = products.find(p => p.id === productId);
        return prod ? prod.name : `Unknown (ID: ${productId})`;
    };

    return (
        <div className="flex-1 overflow-y-auto p-container-margin w-full bg-background font-body-md text-on-background">
            <div className="flex flex-col gap-gutter max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="font-h1 text-h1 text-on-surface">Sales History</h2>
                    <p className="font-body-md text-on-surface-variant mt-1">View and filter all previous sales records</p>
                </div>
                <div className="flex gap-4">
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white font-medium text-gray-700 shadow-sm"
                    >
                        <option value="all">All Months</option>
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, idx) => (
                            <option key={idx + 1} value={idx + 1}>{month}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">ID</th>
                                <th className="px-6 py-4 font-semibold">Customer</th>
                                <th className="px-6 py-4 font-semibold">Products & Qty</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Taxes</th>
                                <th className="px-6 py-4 font-semibold">Discount</th>
                                <th className="px-6 py-4 font-semibold text-right">Final Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredSales.length > 0 ? (
                                filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-600 font-medium">#{sale.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{getCustomerName(sale.customer_id)}</div>
                                            <div className="text-xs text-gray-500">{sale.payment_method}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {sale.items && sale.items.length > 0 ? (
                                                <ul className="space-y-1">
                                                    {sale.items.map((item, idx) => (
                                                        <li key={idx} className="text-gray-600 flex justify-between gap-4">
                                                            <span>• {getProductName(item.product_id)}</span>
                                                            <span className="font-medium text-gray-900">x{item.quantity}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-gray-400 italic">No products</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(sale.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-500">CGST: <span className="font-medium text-gray-700">₹{parseFloat(sale.cgst).toFixed(2)}</span></div>
                                            <div className="text-xs text-gray-500">SGST: <span className="font-medium text-gray-700">₹{parseFloat(sale.sgst).toFixed(2)}</span></div>
                                        </td>
                                        <td className="px-6 py-4 text-red-500 font-medium">
                                            {sale.discount > 0 ? `-₹${parseFloat(sale.discount).toFixed(2)}` : '₹0.00'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                                            ₹{parseFloat(sale.final_total).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-50 p-4 rounded-full mb-3">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                            </div>
                                            <p className="text-base font-medium text-gray-900">No records found</p>
                                            <p className="text-sm text-gray-500 mt-1">Try changing the month filter</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>
        </div>
    );
};

export default HistorySale;
