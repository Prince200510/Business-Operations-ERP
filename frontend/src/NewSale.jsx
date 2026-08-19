import React, { useState, useEffect } from 'react';
import { AiOutlineDelete, AiFillFileAdd } from 'react-icons/ai';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';

const NewSale = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentComponent, setCurrentComponent] = useState();
    const [showContent, setShowContent] = useState(true);
    const [rows, setRows] = useState([{ id: 1, product_id: '', quantity: 1 }]);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [products, setProducts] = useState([]);

    const fetch_products = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/products/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if(response.status === 401) {
                localStorage.removeItem("access_token");
                navigate('/');
                return;
            }

            const data = await response.json();
            
            if(!response.ok) {
                throw new Error(data.detail || 'Failed to fetch products');
            }

            setProducts(data);
        } catch(error) {
            console.error(error);
        }
    }
    
    useEffect(() => {
        fetch_products();
    }, []);

    const addNewRow = () => {
        const newRow = { id: rows.length + 1, product_id: '', quantity: 1 };
        setRows([...rows, newRow]);
    };

    const handleDeleteRow = (id) => {
        if(rows.length === 1) return;
        const updatedRows = rows.filter(row => row.id !== id);
        setRows(updatedRows);
    };

    const handleProductChange = (event, id) => {
        const selectedProductId = event.target.value;
        setRows(prevRows => prevRows.map(row => {
            if (row.id === id) {
                return { ...row, product_id: selectedProductId };
            }
            return row;
        }));
    };
    
    const handleQuantityChange = (event, id) => {
        const value = parseInt(event.target.value) || 0;
        setRows(prevRows => prevRows.map(row => {
            if (row.id === id) {
                return { ...row, quantity: value };
            }
            return row;
        }));
    };

    const handleFinalButtonClick = async () => {
        if (!customerName || !customerAddress) {
            Swal.fire({
                title: "Error!",
                text: "Please enter customer name and address",
                icon: "error"
            });
            return;
        }

        const validItems = rows.filter(
            row => row.product_id && row.quantity > 0
        );

        if (validItems.length === 0) {
            Swal.fire({
                title: "Error!",
                text: "Please add at least one product",
                icon: "error"
            });
            return;
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate("/");
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/sales/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        customer_name: customerName,
                        customer_address: customerAddress,
                        items: validItems.map(
                            row => ({
                                product_id: Number(row.product_id),
                                quantity: Number(row.quantity)
                            })
                        ),
                        discount: Number(discount || 0),
                        payment_method: paymentMethod
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to create sale");
            }

            Swal.fire({
                title: "Sale Created!",
                text: `Sale Order #${data.id} created successfully.`,
                icon: "success"
            });

            console.log("Sale response:", data);

            await fetch_products();
            setCustomerName('');
            setCustomerAddress('');
            setRows([{ id: 1, product_id: '', quantity: 1 }]);
            setDiscount(0);
            setPaymentMethod('UPI');
        } catch (error) {
            console.error("Sale API error:", error);
            Swal.fire({
                title: "Error!",
                text: error.message,
                icon: "error"
            });
        }
    };

    const calculateOrderTotal = () => {
        let total = 0;
        for (const row of rows) {
            if(row.product_id) {
                const product = products.find(p => p.id === Number(row.product_id));
                if(product) {
                    total += (product.sale_price * row.quantity);
                }
            }
        }
        return total;
    };
    
    return (
        <div className="flex-1 overflow-y-auto p-container-margin w-full bg-background font-body-md text-on-background">
            {showContent ? (
                <div className="flex flex-col gap-gutter max-w-[1600px] mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="font-h1 text-h1 text-on-surface">Create Sale Order</h2>
                            <p className="font-body-md text-on-surface-variant mt-1">Generate a new sale order and billing</p>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col overflow-hidden">
                        <div className="p-density-medium border-b border-outline-variant bg-surface-container-lowest">
                            <h3 className="font-h3 text-[16px] text-on-surface">Customer Information</h3>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Customer Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={customerName} 
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Enter customer name"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm bg-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Address <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={customerAddress} 
                                        onChange={(e) => setCustomerAddress(e.target.value)}
                                        placeholder="Enter customer address"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm bg-white"
                                    />
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left whitespace-nowrap">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Product Name</th>
                                                <th className="px-4 py-3 font-semibold w-32">Sale Price (₹)</th>
                                                <th className="px-4 py-3 font-semibold w-24">Quantity</th>
                                                <th className="px-4 py-3 font-semibold w-32">Item Total (₹)</th>
                                                <th className="px-4 py-3 font-semibold w-16 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map(row => {
                                                const product = products.find(p => p.id === Number(row.product_id));
                                                const salePrice = product ? product.sale_price : 0;
                                                const itemTotal = salePrice * row.quantity;
                                                return (
                                                <tr key={row.id} className="bg-white border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                                    <td className="px-4 py-3">
                                                        <select 
                                                            value={row.product_id}
                                                            onChange={(event) => handleProductChange(event, row.id)}
                                                            className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm bg-white"
                                                        >
                                                            <option value="">Select Product</option>
                                                            {products.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input 
                                                            type="text" 
                                                            value={salePrice || ''} 
                                                            placeholder="0.00" 
                                                            readOnly 
                                                            className="w-full px-3 py-1.5 border border-gray-200 rounded bg-gray-50 text-gray-500 outline-none text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input 
                                                            type="number" 
                                                            placeholder="0"
                                                            value={row.quantity}
                                                            onChange={(event) => handleQuantityChange(event, row.id)} 
                                                            className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input 
                                                            type="text" 
                                                            value={itemTotal || ''} 
                                                            placeholder="0.00" 
                                                            readOnly 
                                                            className="w-full px-3 py-1.5 border border-gray-200 rounded bg-gray-50 text-gray-500 outline-none text-sm font-medium"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button 
                                                            onClick={() => handleDeleteRow(row.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete Row"
                                                        >
                                                            <AiOutlineDelete className="text-lg" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )})}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                                    <button 
                                        onClick={addNewRow}
                                        className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                    >
                                        <AiFillFileAdd className="text-lg" /> Add Another Row
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mt-6">
                                <div className="w-full md:w-1/2 space-y-4">
                                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                                    <select 
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm bg-white"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                    </select>
                                </div>
                                <div className="w-full md:w-80 bg-gray-50 p-6 rounded-lg border border-gray-100 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-gray-600">Order Total</label>
                                        <input type="text" value={calculateOrderTotal()} readOnly className="w-32 px-3 py-1.5 border border-gray-200 rounded bg-white text-right outline-none text-sm font-medium" placeholder="0.00" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-gray-600">Discount</label>
                                        <input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="w-32 px-3 py-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-primary-500 outline-none text-sm text-right bg-white" placeholder="0.00" />
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button 
                                            onClick={handleFinalButtonClick}
                                            className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
                                        >
                                            Submit Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : currentComponent}
        </div>
    );
};

export default NewSale;
