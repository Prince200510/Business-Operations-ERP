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

    useEffect(() => {
        fetch_supplier();
        fetch_products();
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
        <>
            <h1 className="supplier"><span>Purchase</span>Order</h1>
            <div className="supplier-container">
                <div class="parent-purchase">
                    <div className="parent-purchase-product">
                        <div className="child-purchase-product">
                            <label>Supplier Name</label><br />
                            <select name="name" onChange={handleSupplierChange} value={selectedSupplier}>
                                <option value="">Select Supplier</option>
                                {supplierNames.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="child-purchase-product">
                            <label>Supplier Address</label><br />
                            <input type="text" value={selectedSupplierAddress} readOnly />
                        </div>
                    </div>
                    <div class="parent-purchase-product-1">
                        <div class="child-purchase-product-1">
                            <table class="purchase-table">
                                <thead>
                                    <tr>
                                        <th>Product Name</th>
                                        <th>Purchase Price</th>
                                        <th>Quantity</th>
                                        <th>Item Total</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><input type="text" placeholder='Product Name' value={itemName} onChange={(e) => setItemName(e.target.value)}></input></td>
                                        <td><input type="text" placeholder='Price' size="8" value={itemPrice} onChange={handleItemPriceChange}></input></td>
                                        <td><input type="text" placeholder='Qtn.' size="3" value={itemQuantity} onChange={handleItemQuantityChange}></input></td>
                                        <td><input type="text" placeholder='₹' size="6" value={itemTotal} readOnly></input></td>
                                        <td><button onClick={handleclear}><AiOutlineDelete className="delete" /></button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="child-purchase-product-2">
                            <label>Item Total</label><input type="text" value={itemTotal} readOnly></input><br></br>
                            <label style={{ marginRight: '23px' }}>Discount  </label><input type="text" value={discount} onChange={handleDiscountChange}></input><br></br>
                            <label style={{ marginRight: '11px', fontWeight: "500" }}>Final Total  </label><input type="text" value={finalTotal} readOnly></input><br></br>
                            <label style={{ marginRight: '24px' }}>Payment  </label><select style={{ width: "181px" }} onChange={handlePaymentMethodChange}><option value="1">Cash Payment</option><br></br>
                                <option value="2">Cheque Payment</option>
                                <option value="3">Upi Payment</option>
                                <option value="4">Google Pay Payment</option></select><br></br>
                            <button onClick={handleSave}>Save & Print</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Purchase;
