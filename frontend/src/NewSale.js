import React, { useState, useEffect } from 'react';
import { AiOutlineDelete, AiFillFileAdd } from 'react-icons/ai';
import database from './firebase';
import { ref, onValue, update, get, push, set } from 'firebase/database';
import Swal from 'sweetalert2';
import { useLocation, useNavigate, Link, Route, Routes, Outlet } from 'react-router-dom';
import Bill from './Bill';

const NewSale = () => {
    const location = useLocation();
    const { userName } = location.state;
    const [currentComponent, setCurrentComponent] = useState();
    const [showContent, setShowContent] = useState(true);
    const username = location?.state?.userName;
    const [rows, setRows] = useState([{ id: 1 }]);
    const [productNames, setProductNames] = useState([]);
    const [salePrices, setSalePrices] = useState({});
    const [quantities, setQuantities] = useState({});
    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [discount, setDiscount] = useState(0);
    const [custid, setcustid] = useState(0);
    const [orderSubmitted, setOrderSubmitted] = useState(false);


    useEffect(() => {
        const fetchCustomerIDs = () => {
            const customerRef = ref(database, `${userName}Customers`);
            onValue(customerRef, (snapshot) => {
                if (snapshot.exists()) {
                    const customerData = snapshot.val();
                    const customerIDs = Object.keys(customerData).map(id => parseInt(id));
                    const maxID = Math.max(...customerIDs);
                    setcustid(maxID + 1); 
                } else {
                    setcustid(1); 
                }
            });
        };

        fetchCustomerIDs();
    }, []);

    const addNewRow = () => {
        const newRow = { id: rows.length + 1 };
        setRows([...rows, newRow]);
    };

    const handleDeleteRow = (id) => {
        const updatedRows = rows.filter(row => row.id !== id);
        setRows(updatedRows);
    };

    const handleviewbill = () => {
        setCurrentComponent(<Bill />);
        setShowContent(false);
    };

    const handleProductChange = (event, id) => {
        const selectedProductName = event.target.value;
        const productRef = ref(database, `${userName}Products/${selectedProductName}/saleprice`);
        onValue(productRef, (snapshot) => {
            if (snapshot.exists()) {
                setSalePrices(prevPrices => ({
                    ...prevPrices,
                    [id]: snapshot.val()
                }));
                setRows(prevRows => prevRows.map(row => {
                    if (row.id === id) {
                        return { ...row, productName: selectedProductName };
                    }
                    return row;
                }));
            } else {
                setSalePrices(prevPrices => ({
                    ...prevPrices,
                    [id]: ''
                }));
                setRows(prevRows => prevRows.map(row => {
                    if (row.id === id) {
                        return { ...row, productName: '' };
                    }
                    return row;
                }));
            }
        });
    };
    
    const handleQuantityChange = (event, id) => {
        const value = event.target.value;
        const salePrice = salePrices[id] || 0; 
        const itemTotal = parseFloat(value) * parseFloat(salePrice);
        
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [id]: value
        }));
    
        setRows(prevRows => prevRows.map(row => {
            if (row.id === id) {
                return { ...row, itemTotal: itemTotal };
            }
            return row;
        }));
    };

    const handleFinalButtonClick = async () => {
        if (!customerName || !customerAddress || !custid) {
            Swal.fire({
                title: 'Error!',
                text: 'Please fill in all the required fields.',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return;
        }
    
        const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        const orderDetails = {
            username: username,
            customerName: customerName,
            customerAddress: customerAddress,
            date: currentTime,
            products: [],
            orderTotal: calculateOrderTotal(),
            discount: discount,
            cgst: calculateCGST(),
            sgst: calculateSGST(),
            finalTotal: calculateFinalTotal(),
        };
    
      
        const customerDataRef = push(ref(database, `${userName}Customers/${custid}`),null);
        set(ref(database, `${userName}Customers/${custid}`), orderDetails)
        .then(() => {
        })
    
        let shouldSubmitData = true; 
    
        for (const id in quantities) {
            if (Object.prototype.hasOwnProperty.call(quantities, id)) {
                const selectedRow = rows.find(row => row.id === parseInt(id));
                if (selectedRow && selectedRow.productName) {
                    const selectedProductName = selectedRow.productName;
                    const productRef = ref(database, `${userName}Products/${selectedProductName}`);
                    const snapshot = await get(productRef);
                    if (snapshot.exists()) {
                        const productData = snapshot.val();
                        const requestedQuantity = parseInt(quantities[id]);
                        if (productData.quantity <= 0 || requestedQuantity > productData.quantity) {
                            // Product is out of stock or requested quantity exceeds available quantity
                            shouldSubmitData = false;
                            Swal.fire({
                                title: 'Out of Stock!',
                                text: 'One or more selected products are out of stock or requested quantity exceeds available quantity.',
                                icon: 'warning',
                                confirmButtonText: 'Ok'
                            });
                            break; // Exit the loop
                        }
                        const updatedQuantity = productData.quantity - requestedQuantity;
                        update(ref(database), { [`${userName}Products/${selectedProductName}/quantity`]: updatedQuantity });
                        orderDetails.products.push({
                            productName: selectedProductName,
                            salePrice: productData.saleprice,
                            quantity: requestedQuantity,
                            itemTotal: parseFloat(productData.saleprice) * requestedQuantity
                        });

                    }
                }
            }
        }
    
        if (shouldSubmitData) {
            setCustomerName('');
            setCustomerAddress('');
            setcustid(0);
            setRows([{ id: 1 }]);
            setDiscount(0);
            setQuantities({});
            setSalePrices({});
            setOrderSubmitted(true); 

            Swal.fire({
                title: 'Success!',
                text: 'Sale order has been placed successfully.',
                icon: 'success',
                confirmButtonText: 'Ok'
            });
    
            // Update order details in database
            update(customerDataRef, orderDetails)
            set(ref(database, `${userName}Customers/${custid}`), orderDetails)
                .then(() => {
                    console.log("Order details submitted successfully:", orderDetails);
                })
                .catch(error => {
                    console.error("Error submitting order details:", error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to submit sale order. Please try again.',
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                });
        } else {
            // Clear the customer data reference if submission is not required
            set(ref(database, `${userName}Customers/${custid}`), null);
        }
    };
    
    
    useEffect(() => {
        const productRef = ref(database, `${userName}Products`);
        onValue(productRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const productNamesArray = Object.keys(data);
                setProductNames(productNamesArray);
            } else {
                setProductNames([]);
            }
        });
    }, []);

    const calculateOrderTotal = () => {
        let total = 0;
        for (const row of rows) {
            total += row.itemTotal || 0;
        }
        return total;
    };
    
    const calculateCGST = () => {
        const orderTotal = calculateOrderTotal();
        const cgst = orderTotal * 0.08;
        return cgst.toFixed(2);
    };
    
    const calculateSGST = () => {
        const orderTotal = calculateOrderTotal();
        const sgst = orderTotal * 0.08;
        return sgst.toFixed(2);
    };
    
    const calculateFinalTotal = () => {
        const orderTotal = calculateOrderTotal();
        const discountAmount = discount || 0;
        const cgst = orderTotal * 0.08;
        const sgst = orderTotal * 0.08;
        const finalTotal = orderTotal - discountAmount + cgst + sgst;
        return finalTotal.toFixed(2);
    };
    
    return (
        <div className="flex-1 overflow-y-auto p-container-margin w-full bg-background font-body-md text-on-background">
            {showContent && (
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Customer ID</label>
                                    <input 
                                        type="text" 
                                        value={custid} 
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Customer Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter customer name" 
                                        value={customerName} 
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Address <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter customer address" 
                                        value={customerAddress} 
                                        onChange={(e) => setCustomerAddress(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
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
                                            {rows.map(row => (
                                                <tr key={row.id} className="bg-white border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                                    <td className="px-4 py-3">
                                                        <select 
                                                            onChange={(event) => handleProductChange(event, row.id)}
                                                            className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm bg-white"
                                                        >
                                                            <option value="">Select Product</option>
                                                            {productNames.map(productName => (
                                                                <option key={productName} value={productName}>{productName}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input 
                                                            type="text" 
                                                            value={salePrices[row.id] || ''} 
                                                            placeholder="0.00" 
                                                            readOnly 
                                                            className="w-full px-3 py-1.5 border border-gray-200 rounded bg-gray-50 text-gray-500 outline-none text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input 
                                                            type="number" 
                                                            placeholder="0" 
                                                            onChange={(event) => handleQuantityChange(event, row.id)} 
                                                            className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input 
                                                            type="text" 
                                                            value={row.itemTotal || ''} 
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
                                            ))}
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
                                    <select className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm bg-white">
                                        <option value="1">Cash Payment</option>
                                        <option value="2">Cheque Payment</option>
                                        <option value="3">UPI Payment</option>
                                        <option value="4">Google Pay Payment</option>
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
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-gray-600">CGST (8%)</label>
                                        <input type="text" value={calculateCGST()} readOnly className="w-32 px-3 py-1.5 border border-gray-200 rounded bg-white text-right outline-none text-sm font-medium" placeholder="0.00" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-gray-600">SGST (8%)</label>
                                        <input type="text" value={calculateSGST()} readOnly className="w-32 px-3 py-1.5 border border-gray-200 rounded bg-white text-right outline-none text-sm font-medium" placeholder="0.00" />
                                    </div>
                                    <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                                        <label className="text-base font-bold text-gray-900">Final Total</label>
                                        <span className="text-xl font-bold text-gray-900">₹{calculateFinalTotal()}</span>
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button 
                                            onClick={handleviewbill}
                                            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-lg shadow-sm transition-colors text-sm"
                                        >
                                            View Bill
                                        </button>
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
            )}
            {currentComponent}
        </div>
    );
};

export default NewSale;
