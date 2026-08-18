import React, { useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import Swal from 'sweetalert2'
import { useNavigate, useNavigation } from 'react-router-dom';

const Product = () => {
    const [Products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({
        supplier_id: '',
        name: '',
        purchase_price: '',
        sale_price: '',
        quantity: ''
    });
    const [supplierNames, setSupplierNames] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    
    const navigate = useNavigate();

    const fetch_supplier = async () => {
        const token = localStorage.getItem('access_token');

        if(!token) {
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/suppliers/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if(response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('loggedInUser');
                navigate('/');
                return;
            }

            const data = await response.json();

            if(!response.ok) {
                throw new Error(data.detail || 'Failed to fetch suppliers');
            }

            setSupplierNames(data);

        } catch(error) {
            console.error(error);
        }
    }

    const fetch_products = async () => {
        const token = localStorage.getItem('access_token');

        if(!token) {
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if(response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('loggedInUser');
                navigate('/');
                return;
            }

            const data = await response.json();

            if(!response.ok) {
                throw new Error(data.detail || 'Failed to fetch products');
            }

            setProducts(data);
            setFilteredProducts(data);
            calculateTotals(data);
        } catch(error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetch_supplier();
        fetch_products();
    }, []);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value }); 
    };

    const handleNewProductSubmit = async () => {
        const {supplier_id, name, purchase_price, sale_price, quantity } = newProduct;

        if (!supplier_id || !name || !purchase_price || !sale_price || !quantity) {
            // alert("Please fill out all fields");
            Swal.fire({
                title: 'Missing information',
                text: 'Please fill out all fields.',
                icon: 'warning'
            });

            return;
        }

        const token = localStorage.getItem('access_token');

        if(!token) {
            navigate('/');
            return;
        }

        try {
            const response = await fetch( `${process.env.REACT_APP_API_URL}/products/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    supplier_id: Number(supplier_id),
                    name: name,
                    purchase_price: Number(purchase_price),
                    sale_price: Number(sale_price),
                    quantity: Number(quantity)
                })
            });

            const data = await response.json();

            if(!response.ok) {
                throw new Error(data.detail || 'Failed to create product');
            }

            setProducts([...Products, data]);
            setFilteredProducts([...Products, data]);
            calculateTotals([...Products, data]);
            setNewProduct({
                supplier_id: '',
                name: '',
                purchase_price: '',
                sale_price: '',
                quantity: ''
            });

            Swal.fire({
                title: 'Success!',
                text: 'Product added successfully.',
                icon: 'success'
            })
        } catch(error) {
            console.error(error);
            Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error'
            });
        }
    };
    const handleSearch = () => {
        const trimmedQuery = searchQuery.trim().toLowerCase();
        if (trimmedQuery === '') {
            setFilteredProducts(Products);
        } else {
            const filtered = Products.filter(product =>
                product.name.toLowerCase().includes(trimmedQuery)
            );
            setFilteredProducts(filtered);
        }
    };
    
    const handleDeleteProduct = async (productId) => {
        const token = localStorage.getItem('access_token');

        if(!token) {
            navigate('/');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if(!response.ok) {
                throw new Error(data.detail || 'Failed to delete product');
            }

            const update_products = Products.filter(product => product.id !== productId);
            setProducts(update_products);
            setFilteredProducts(update_products);
            calculateTotals(update_products);

            Swal.fire({
                title: 'Success!',
                text: 'Product deleted successfully.',
                icon: 'success'
            })
        } catch(error) {
            console.error(error);
            Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error'
            });
        }
    };

    
    
    const calculateTotalPurchasePrice = (quantity, purchaseprice) => {
        return (quantity * purchaseprice).toFixed(2);
    };

    const calculateTotalSalePrice = (quantity, saleprice) => {
        return (quantity * saleprice).toFixed(2);
    };
    

    const profit = (quantity, saleprice, purchaseprice) => {
        const salePrice = parseInt(calculateTotalSalePrice(quantity, saleprice));
        const purchasePrice = parseInt(calculateTotalPurchasePrice(quantity, purchaseprice));
        
        if (isNaN(salePrice) || isNaN(purchasePrice)) {
            return "Invalid input";
        }
        const profitValue = (salePrice - purchasePrice).toFixed(2); 
        return `${profitValue}`; 
    };

    const [totalProfit, setTotalProfit] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [totalPurchase, setTotalPurchase] = useState(0);
    const [purchase, setPurchase] = useState(0);
    const [sales, setSales] = useState(0);

    const calculateTotals = (products) => {
        let totalSalesValue = 0;
        let totalPurchaseValue = 0;
        let totalProfitValue = 0;
        let purchaseValue = 0;
        let salesValue = 0;
    
        products.forEach((product) => {
            const salePrice = parseFloat(product.sale_price);
            const purchasePrice = parseFloat(product.purchase_price);
            const quantity = parseInt(product.quantity);
    
            if (!isNaN(salePrice) && !isNaN(purchasePrice) && !isNaN(quantity)) {
                const totalSalePrice = salePrice * quantity;
                const totalPurchasePrice = purchasePrice * quantity;
                const profit = totalSalePrice - totalPurchasePrice;
    
                totalSalesValue += totalSalePrice;
                totalPurchaseValue += totalPurchasePrice;
                totalProfitValue += profit;
    
                purchaseValue += purchasePrice;
                salesValue += salePrice;
            }
        });
    
        setTotalSales(totalSalesValue.toFixed(2));
        setTotalPurchase(totalPurchaseValue.toFixed(2));
        setTotalProfit(totalProfitValue.toFixed(2));
        setPurchase(purchaseValue.toFixed(2));
        setSales(salesValue.toFixed(2));
    };
    

    
    return (
        <div className="flex-1 overflow-y-auto p-container-margin w-full bg-background font-body-md text-on-background">
            <div className="flex flex-col gap-gutter max-w-[1600px] mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="font-h1 text-h1 text-on-surface">Products Management</h2>
                        <p className="font-body-md text-on-surface-variant mt-1">Manage your inventory, prices, and stock levels</p>
                    </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col overflow-hidden mb-8">
                    <div className="p-density-medium border-b border-outline-variant bg-surface-container-lowest">
                        <h3 className="font-h3 text-[16px] text-on-surface">Add New Product</h3>
                    </div>
                    <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Supplier <span className="text-red-500">*</span></label>
                            <select 
                                name="supplier_id" 
                                value={newProduct.supplier_id} 
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm bg-white"
                            >
                                <option value="">Select Supplier</option>
                                {supplierNames.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Product Name <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                placeholder="E.g., Office Chair" 
                                name="name" 
                                value={newProduct.name} 
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Purchase Price (₹) <span className="text-red-500">*</span></label>
                            <input 
                                type="number" 
                                min={1} 
                                placeholder="0.00" 
                                name="purchase_price" 
                                value={newProduct.purchase_price} 
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Sale Price (₹) <span className="text-red-500">*</span></label>
                            <input 
                                type="number" 
                                min={1} 
                                placeholder="0.00" 
                                name="sale_price" 
                                value={newProduct.sale_price} 
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Quantity <span className="text-red-500">*</span></label>
                            <input 
                                type="number" 
                                min={1} 
                                placeholder="0" 
                                name="quantity" 
                                value={newProduct.quantity} 
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button 
                            onClick={handleNewProductSubmit}
                            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
                        >
                            Save Product
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col overflow-hidden">
                <div className="p-density-medium border-b border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="font-h3 text-[16px] text-on-surface">Product Inventory</h3>
                    <div className="flex w-full sm:w-auto">
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 px-3 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                        />
                        <button 
                            onClick={handleSearch}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-r-lg border border-l-0 border-gray-200 transition-colors text-sm"
                        >
                            Search
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">ID</th>
                                <th className="px-6 py-4 font-semibold">Supplier</th>
                                <th className="px-6 py-4 font-semibold">Product Name</th>
                                <th className="px-6 py-4 font-semibold text-right">Qty</th>
                                <th className="px-6 py-4 font-semibold text-right">Purchase (₹)</th>
                                <th className="px-6 py-4 font-semibold text-right">Sale (₹)</th>
                                <th className="px-6 py-4 font-semibold text-right">Total Purchase (₹)</th>
                                <th className="px-6 py-4 font-semibold text-right">Total Sale (₹)</th>
                                <th className="px-6 py-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(searchQuery.trim() === '' ? Products : filteredProducts).length > 0 ? (
                                (searchQuery.trim() === '' ? Products : filteredProducts).map((Product, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                                        <td className="px-6 py-4 text-gray-600">{supplierNames.find(s => s.id === Product.supplier_id)?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{Product.name}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                {Product.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-right">{parseFloat(Product.purchase_price).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-gray-600 text-right">{parseFloat(Product.sale_price).toFixed(2)}</td>
                                        <td className="px-6 py-4 font-medium text-gray-700 text-right">{calculateTotalPurchasePrice(Product.quantity, Product.purchase_price)}</td>
                                        <td className="px-6 py-4 font-medium text-gray-700 text-right">{calculateTotalSalePrice(Product.quantity, Product.sale_price)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleDeleteProduct(Product.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors inline-flex justify-center"
                                                title="Delete Product"
                                            >
                                                <AiOutlineDelete className="text-lg" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                                        No products found matching your search.
                                    </td>
                                </tr>
                            )}
                            
                            {(searchQuery.trim() === '' ? Products : filteredProducts).length > 0 && (
                                <tr className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                                    <td className="px-6 py-4 text-gray-900" colSpan="4">Total Summary</td>
                                    <td className="px-6 py-4 text-right text-gray-900">{purchase}</td>
                                    <td className="px-6 py-4 text-right text-gray-900">{sales}</td>
                                    <td className="px-6 py-4 text-right text-primary-700">{totalPurchase}</td>
                                    <td className="px-6 py-4 text-right text-emerald-600">{totalSales}</td>
                                    <td className="px-6 py-4"></td>
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

export default Product;
