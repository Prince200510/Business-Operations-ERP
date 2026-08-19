import React from 'react';

const InvoiceUI = ({ invoiceData }) => {
    if (!invoiceData) return null;

    const { business, customer, totals, items, invoice_number, date, payment_method } = invoiceData;

    return (
        <div className="bg-white p-8 max-w-4xl mx-auto printable-invoice" id="printable-invoice">
            <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{business.business_name}</h1>
                    <p className="text-gray-500 text-sm">{business.name}</p>
                    <p className="text-gray-500 text-sm mt-2 whitespace-pre-wrap">{business.address}</p>
                    <p className="text-gray-500 text-sm">Phone: {business.phone_no1}</p>
                    <p className="text-gray-500 text-sm">Email: {business.email_id}</p>
                    <p className="text-gray-500 text-sm">{business.website}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-black text-gray-200 uppercase tracking-widest mb-2">Invoice</h2>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Invoice No:</span> {invoice_number}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Date:</span> {new Date(date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Payment:</span> {payment_method}</p>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To:</h3>
                <h4 className="text-lg font-semibold text-gray-900">{customer.name}</h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{customer.address || 'N/A'}</p>
            </div>

            <div className="mb-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                            <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Description</th>
                            <th className="py-3 px-4 font-semibold text-gray-700 text-sm text-center">Qty</th>
                            <th className="py-3 px-4 font-semibold text-gray-700 text-sm text-right">Unit Price</th>
                            <th className="py-3 px-4 font-semibold text-gray-700 text-sm text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                                <td className="py-3 px-4 text-sm text-gray-800">{item.product_name}</td>
                                <td className="py-3 px-4 text-sm text-gray-800 text-center">{item.quantity}</td>
                                <td className="py-3 px-4 text-sm text-gray-800 text-right">₹{item.unit_price.toFixed(2)}</td>
                                <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">₹{item.item_total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mb-8">
                <div className="w-1/2 md:w-1/3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Subtotal:</span>
                        <span className="text-sm font-medium text-gray-800">₹{totals.subtotal.toFixed(2)}</span>
                    </div>
                    {totals.discount > 0 && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Discount:</span>
                            <span className="text-sm font-medium text-red-500">-₹{totals.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">CGST (8%):</span>
                        <span className="text-sm font-medium text-gray-800">₹{totals.cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">SGST (8%):</span>
                        <span className="text-sm font-medium text-gray-800">₹{totals.sgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-3">
                        <span className="text-lg font-bold text-gray-900">Total:</span>
                        <span className="text-lg font-bold text-primary-600">₹{totals.final_total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mt-12 text-center">
                <p className="text-gray-500 text-sm">Thank you for your business!</p>
            </div>
        </div>
    );
};

export default InvoiceUI;
