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
                product.name1.toLowerCase().includes(trimmedQuery)
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
        <>
            <h1 className="supplier">Products</h1>
            <div className="supplier-container">
                <div className="parent-supplier">
                    <h3>Product Details</h3>
                    <hr />
                    <div className="new-supplier-entry">
                        <div className="data">
                            <label>Supplier Name</label><br />
                            <select name="supplier_id" value={newProduct.supplier_id} onChange={handleInputChange}>
                                <option value="">Select Supplier</option>
                                {supplierNames.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="data">
                            <label>Product Name</label><br />
                            <input type="text" placeholder="Enter product name" name="name" value={newProduct.name} onChange={handleInputChange}></input>
                        </div>
                        <div className="data">
                            <label>Purchase Price</label><br />
                            <input type="number" min={1} max={1000000} placeholder="Purchase ₹" name="purchase_price" value={newProduct.purchase_price} onChange={handleInputChange}></input>
                        </div>
                        <div className="data">
                            <label>Sale Price</label><br />
                            <input type="number" min={1} max={10000000} placeholder="sale ₹" name="sale_price" value={newProduct.sale_price} onChange={handleInputChange}></input>
                        </div>
                        <div className="data">
                            <label>Quantity</label><br />
                            <input type="number" min={1} max={100} placeholder="Qtn." name="quantity" value={newProduct.quantity} onChange={handleInputChange}></input>
                        </div>
                        <div className="data">
                            <label></label><br />
                            <button onClick={handleNewProductSubmit}>New Product</button>
                        </div>
                        <div className="data">
                            <label>Search</label><br />
                            <input     type="text"     placeholder="Search product name"     value={searchQuery}     onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="data">
                            <label></label><br />
                            <button onClick={handleSearch}>Go</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="supplier-data-show">
                <table className="supplier-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Supplier Name</th>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Purchase Price</th>
                            <th>Sale Price</th>
                            <th>Total Purchase Price</th>
                            <th>Total Sale Price</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                    {(searchQuery.trim() === '' ? Products : filteredProducts).length > 0 ? (
        (searchQuery.trim() === '' ? Products : filteredProducts).map((Product, index) => (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{supplierNames.find(s => s.id === Product.supplier_id)?.name || 'Unknown'}</td>
                <td>{Product.name}</td>
                <td>{Product.quantity}</td>
                <td>{parseFloat(Product.purchase_price).toFixed(2)}</td>
                <td>{parseFloat(Product.sale_price).toFixed(2)}</td>
                <td>{calculateTotalPurchasePrice(Product.quantity, Product.purchase_price)}</td>
                <td>{calculateTotalSalePrice(Product.quantity, Product.sale_price)}</td>
                <td>
                    <button onClick={() => handleDeleteProduct(Product.id)}>
                        <AiOutlineDelete className="delete" />
                    </button>
                </td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="10">No products found</td>
        </tr>
    )}

                    <td style={{fontWeight: "700"}}>Total</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td style={{fontWeight: "700"}}>{purchase}</td>
                    <td style={{fontWeight: "700"}}>{sales}</td>
                    <td style={{fontWeight: "700"}}>{totalPurchase}</td>
                    <td style={{fontWeight: "700"}}>{totalSales}</td>
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Product;
