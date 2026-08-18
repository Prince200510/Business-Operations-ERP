import React, { useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import database from './firebase';
import { ref, get, onValue } from 'firebase/database';
import { useLocation } from 'react-router-dom';

const HistorySale = () => {
    const [customers, setCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const location = useLocation();
    const { userName } = location.state;

    useEffect(() => {
        const fetchCustomerData = () => {
            const customerRef = ref(database, `${userName}Customers`);
            onValue(customerRef, (snapshot) => {
                if (snapshot.exists()) {
                    const customerList = Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
                    setCustomers(customerList);
                } else {
                    setCustomers([]);
                }
            });
        };
        
        fetchCustomerData();
    }, []);

    const calculateProfit = (product) => {
        return (product.quantity * (parseFloat(product.salePrice) - parseFloat(product.purchasePrice))).toFixed(2);
    };

    const filterCustomersByMonth = (customerList, month) => {
        if (month === 'all') {
            return customerList;
        } else {
            return customerList.filter(customer => {
                const customerDate = new Date(customer.date);
                return customerDate.getMonth() + 1 === parseInt(month);
            });
        }
    };

    const filteredCustomers = filterCustomersByMonth(customers, selectedMonth);

    return (
        <div className="w-full">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Sales History</h2>
                    <p className="text-gray-500 mt-1">View and filter all previous sales records</p>
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-600 font-medium">#{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{customer.customerName}</div>
                                            <div className="text-xs text-gray-500">by {customer.username}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.products && customer.products.length > 0 ? (
                                                <ul className="space-y-1">
                                                    {customer.products.map((product, idx) => (
                                                        <li key={idx} className="text-gray-600 flex justify-between gap-4">
                                                            <span>• {product.productName}</span>
                                                            <span className="font-medium text-gray-900">x{product.quantity}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-gray-400 italic">No products</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{customer.date}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-500">CGST: <span className="font-medium text-gray-700">₹{customer.cgst}</span></div>
                                            <div className="text-xs text-gray-500">SGST: <span className="font-medium text-gray-700">₹{customer.sgst}</span></div>
                                        </td>
                                        <td className="px-6 py-4 text-red-500 font-medium">
                                            {customer.discount > 0 ? `-₹${customer.discount}` : '₹0.00'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                                            ₹{customer.finalTotal}
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
    );
};

export default HistorySale;
