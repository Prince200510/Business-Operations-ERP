import React, { useEffect, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Purchase = () => {
    const navigate = useNavigate();
    const [supplierNames, setSupplierNames] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedSupplierAddress, setSelectedSupplierAddress] = useState('');
    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [itemQuantity, setItemQuantity] = useState('');
    const [itemTotal, setItemTotal] = useState('');
    const [discount, setDiscount] = useState('');
    const [finalTotal, setFinalTotal] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [purchases, setPurchases] = useState([]);

    const fetch_supplier = async () => {
        const token = localStorage.getItem('access_token');

        const response = await fetch(`${process.env.REACT_APP_API_URL}/suppliers/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if(response.status === 401) {
            localStorage.removeItem('access_token');
            navigate('/');
            return;
        }

        const data = await response.json();

        if(!response.ok) {
            throw new Error(data.detail || 'Failed to fetch suppliers');
        }
        setSupplierNames(data);
    };

    const fetch_products = async () => {
        const token = localStorage.getItem('access_token');

        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if(!response.ok) {
            throw new Error(data.detail || 'Failed to fetch products');
        }
        setProducts(data);
    };

    const fetch_purchases = async () => {
        const token = localStorage.getItem('access_token');
        if(!token) return;
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/purchases/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(response.ok) {
                const data = await response.json();
                setPurchases(data);
            }
        } catch(error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetch_supplier();
        fetch_products();
        fetch_purchases();
    }, []);

    const handleSupplierChange = (event) => {
        const supplier_id = Number(event.target.value);
        setSelectedSupplier(supplier_id);
        const supplier = supplierNames.find(supplier => supplier.id === supplier_id);

        if(supplier) {
            setSelectedSupplierAddress(supplier.address);
        } else {
            setSelectedSupplierAddress('');
        }
    };

    const handleItemPriceChange = (event) => {
        const price = event.target.value;
        setItemPrice(price);
        calculateItemTotal(itemQuantity, price);
    };

    const handleItemQuantityChange = (event) => {
        const quantity = event.target.value;
        setItemQuantity(quantity);
        calculateItemTotal(quantity, itemPrice);
    };

    const calculateItemTotal = (quantity, price) => {
        const total = parseFloat(quantity) * parseFloat(price);
        setItemTotal(total.toFixed(2));
    };

    const handleDiscountChange = (event) => {
        const discountValue = event.target.value;
        setDiscount(discountValue);
        calculateFinalTotal(itemTotal, discountValue);
    };

    const calculateFinalTotal = (total, discount) => {
        const final = parseFloat(total) - parseFloat(discount);
        setFinalTotal(final.toFixed(2));
    };

    const getCurrentISTDateTime = () => {
        const currentIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        return currentIST;
    };

    const handleSave = async () => {
        if (!selectedSupplier || !itemName || !itemPrice || !itemQuantity || !discount) {
            Swal.fire({
                title: 'Error!',
                text: 'Please fill all the details',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return;
        }

        const token = localStorage.getItem('access_token');

        if(!token) {
            navigate('/');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/purchases/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`      
                },
                body: JSON.stringify({
                    supplier_id: Number(selectedSupplier),
                    product_name: itemName,
                    quantity: Number(itemQuantity),
                    purchase_price: Number(itemPrice),
                    discount: Number(discount),
                    payment_method: paymentMethod,
                })
            });

            const data = await response.json();

            if(!response.ok) {
                throw new Error(data.detail || 'Failed to save purchase order');
            }

            Swal.fire({
                title: 'Success!',
                text: 'Purchase order saved successfully',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then(() => {
                handleclear();
            });

            fetch_products();
            fetch_purchases();
        } catch(error) {
            Swal.fire({
                title: 'Error!',
                text: error.message || 'Failed to save purchase order',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            console.error(error);
        }
    };

    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);
    };

    const handleclear = () => {
        setSelectedSupplier('');
        setSelectedSupplierAddress('');
        setItemName('');
        setItemPrice('');
        setItemQuantity('');
        setItemTotal('');
        setDiscount('');
        setFinalTotal('');
        setPaymentMethod('');
    };

    return (
        <div className="flex-1 overflow-y-auto p-container-margin w-full bg-background font-body-md text-on-background">
            <div className="flex flex-col gap-gutter max-w-[1600px] mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="font-h1 text-h1 text-on-surface">Purchase Orders</h2>
                        <p className="font-body-md text-on-surface-variant mt-1">Create new purchase orders and view history</p>
                    </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col overflow-hidden mb-8">
                    <div className="p-density-medium border-b border-outline-variant bg-surface-container-lowest">
                        <h3 className="font-h3 text-[16px] text-on-surface">Create Purchase Order</h3>
                    </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Supplier Name <span className="text-red-500">*</span></label>
                            <select 
                                name="name" 
                                onChange={handleSupplierChange} 
                                value={selectedSupplier}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm bg-white"
                            >
                                <option value="">Select Supplier</option>
                                {supplierNames.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Supplier Address</label>
                            <input 
                                type="text" 
                                value={selectedSupplierAddress} 
                                readOnly 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm outline-none"
                            />
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Product Name</th>
                                        <th className="px-4 py-3 font-semibold w-32">Unit Price (₹)</th>
                                        <th className="px-4 py-3 font-semibold w-24">Quantity</th>
                                        <th className="px-4 py-3 font-semibold w-32">Item Total (₹)</th>
                                        <th className="px-4 py-3 font-semibold w-16 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white">
                                        <td className="px-4 py-3">
                                            <input 
                                                type="text" 
                                                placeholder="Enter product name" 
                                                value={itemName} 
                                                onChange={(e) => setItemName(e.target.value)}
                                                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input 
                                                type="number" 
                                                placeholder="0.00" 
                                                value={itemPrice} 
                                                onChange={handleItemPriceChange}
                                                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input 
                                                type="number" 
                                                placeholder="0" 
                                                value={itemQuantity} 
                                                onChange={handleItemQuantityChange}
                                                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input 
                                                type="text" 
                                                placeholder="0.00" 
                                                value={itemTotal} 
                                                readOnly
                                                className="w-full px-3 py-1.5 border border-gray-200 rounded bg-gray-50 text-gray-500 outline-none text-sm font-medium"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button 
                                                onClick={handleclear}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                title="Clear Row"
                                            >
                                                <AiOutlineDelete className="text-lg" />
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-6">
                
                <div className="w-full lg:w-1/3 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
                        {/* <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes</label>
                            <textarea 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm resize-none h-24"
                                placeholder="Add any notes or special instructions for this purchase order..."
                            ></textarea>
                        </div> */}
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-600">Subtotal</label>
                                <input type="text" value={itemTotal} readOnly className="w-32 px-3 py-1.5 border border-gray-200 rounded bg-white text-right outline-none text-sm font-medium" placeholder="0.00" />
                            </div>
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-600">Discount</label>
                                <input type="number" value={discount} onChange={handleDiscountChange} className="w-32 px-3 py-1.5 border border-gray-200 rounded bg-white text-right focus:ring-2 focus:ring-primary-500 outline-none text-sm" placeholder="0.00" />
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <label className="text-base font-bold text-gray-900">Final Total</label>
                                <input type="text" value={finalTotal} readOnly className="w-32 px-3 py-1.5 border-none bg-transparent text-right outline-none text-lg font-bold text-primary-700" placeholder="₹0.00" />
                            </div>
                            
                            <div className="pt-4 space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                                <select 
                                    onChange={handlePaymentMethodChange}
                                    value={paymentMethod}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm bg-white"
                                >
                                    <option value="">Select Method</option>
                                    <option value="1">Cash Payment</option>
                                    <option value="2">Cheque Payment</option>
                                    <option value="3">UPI Payment</option>
                                    <option value="4">Bank Transfer</option>
                                </select>
                            </div>
                            
                            <button 
                                onClick={handleSave}
                                className="w-full mt-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
                            >
                                Save Purchase Order
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-2/3 bg-surface-container-lowest rounded-lg border border-outline-variant flex flex-col overflow-hidden">
                    <div className="p-density-medium border-b border-outline-variant bg-surface-container-lowest">
                        <h3 className="font-h3 text-[16px] text-on-surface">Purchase History</h3>
                    </div>
                    
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="w-full text-sm text-left whitespace-nowrap min-w-[800px]">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Order ID</th>
                                    <th className="px-6 py-4 font-semibold">Supplier</th>
                                    <th className="px-6 py-4 font-semibold">Product</th>
                                    <th className="px-6 py-4 font-semibold text-right">Qty</th>
                                    <th className="px-6 py-4 font-semibold text-right">Unit Price (₹)</th>
                                    <th className="px-6 py-4 font-semibold text-right">Total (₹)</th>
                                    <th className="px-6 py-4 font-semibold text-right">Discount (₹)</th>
                                    <th className="px-6 py-4 font-semibold text-right">Final Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {purchases.map((purchase, index) => (
                                    <tr key={purchase.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">PO-{purchase.id.toString().padStart(4, '0')}</td>
                                        <td className="px-6 py-4 text-gray-600">{supplierNames.find(s => s.id === purchase.supplier_id)?.name || purchase.supplier_id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{products.find(p => p.id === purchase.product_id)?.name || purchase.product_name}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                {purchase.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-right">{parseFloat(purchase.purchase_price).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-gray-600 text-right">{parseFloat(purchase.item_total).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-gray-600 text-right text-red-500">-{parseFloat(purchase.discount).toFixed(2)}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900 text-right">{parseFloat(purchase.final_total).toFixed(2)}</td>
                                    </tr>
                                ))}
                                {purchases.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                            No purchase history found.
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

export default Purchase;
