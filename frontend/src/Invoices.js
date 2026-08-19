import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import InvoiceUI from './InvoiceUI';

const Invoices = () => {
    const [sales, setSales] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
    const [loadingInvoice, setLoadingInvoice] = useState(false);
    const navigate = useNavigate();

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/customers/`, {
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

    const fetchSales = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/sales/`, {
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
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCustomers();
        fetchSales();
    }, []);

    const getCustomerName = (customerId) => {
        const cust = customers.find(c => c.id === customerId);
        return cust ? cust.name : `Unknown (ID: ${customerId})`;
    };

    const handleViewInvoice = async (saleId) => {
        setLoadingInvoice(true);
        setSelectedInvoice(saleId);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/sales/${saleId}/invoice`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setInvoiceData(data);
            }
        } catch (error) {
            console.error("Failed to load invoice", error);
        } finally {
            setLoadingInvoice(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCloseInvoice = () => {
        setSelectedInvoice(null);
        setInvoiceData(null);
    };

    return (
        <div className="flex-1 overflow-y-auto p-container-margin w-full bg-background font-body-md text-on-background relative print:p-0 print:bg-white print:overflow-visible">            
            <div className={`flex flex-col gap-gutter max-w-[1600px] mx-auto print:hidden ${selectedInvoice ? 'hidden' : 'block'}`}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="font-h1 text-h1 text-on-surface">Invoices</h2>
                        <p className="font-body-md text-on-surface-variant mt-1">Generate and print invoices for past sales</p>
                    </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Invoice #</th>
                                    <th className="px-6 py-4 font-semibold">Customer</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold text-right">Amount (₹)</th>
                                    <th className="px-6 py-4 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sales.length > 0 ? (
                                    sales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-gray-600 font-medium">INV-{sale.id.toString().padStart(6, '0')}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{getCustomerName(sale.customer_id)}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(sale.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                ₹{parseFloat(sale.final_total).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleViewInvoice(sale.id)}
                                                    className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white font-medium rounded transition-colors flex items-center gap-2 mx-auto"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                                    View Invoice
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            <p className="text-base font-medium text-gray-900">No records found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {selectedInvoice && (
                <div className="fixed inset-0 z-[999] w-full h-screen overflow-y-auto bg-gray-100 print:bg-white print:static print:h-auto print:overflow-visible">
                    <div className="max-w-4xl mx-auto p-4 flex justify-between items-center bg-white shadow-sm mb-6 print:hidden">
                        <button onClick={handleCloseInvoice} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                            Back to Invoices
                        </button>
                        <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded shadow-sm hover:bg-primary/90 font-medium transition-colors">
                            <span className="material-symbols-outlined text-[20px]">print</span>
                            Print / Download PDF
                        </button>
                    </div>

                    <div className="pb-12 print:pb-0">
                        {loadingInvoice ? (
                            <div className="text-center py-20 text-gray-500 font-medium">Loading Invoice Data...</div>
                        ) : invoiceData ? (
                            <div className="shadow-lg print:shadow-none bg-white rounded-lg overflow-hidden max-w-4xl mx-auto border border-gray-200 print:border-none print:rounded-none">
                                <InvoiceUI invoiceData={invoiceData} />
                            </div>
                        ) : (
                            <div className="text-center py-20 text-red-500 font-medium">Failed to load invoice.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoices;
