import React, { useState, useEffect } from 'react';
import database from './firebase';
import { ref, onValue, get, child } from 'firebase/database';
import { useLocation } from 'react-router-dom';
import { FaTruck, FaChartBar, FaShoppingCart, FaBoxOpen, FaUser, FaUserFriends } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const Report1 = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [purchaseOrderCount, setPurchaseOrderCount] = useState(0);
    const [supplierCount, setSupplierCount] = useState(0);
    const [historycount, sethistorycount] = useState(0);
    const [purchaseHistory, setPurchaseHistory] = useState({});
    const [chartType, setChartType] = useState('bar');
    const [sale, setSale] = useState(0);
    const [sale1, setSale1] = useState(0);
    const [customerName, SetCustomerName] = useState('');
    const location = useLocation();
    const { userName } = location.state; 

    useEffect(() => {
        const productsRef = ref(database, `${userName}Products`);
        onValue(productsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const productsArray = Object.values(data);
                setProducts(productsArray);

                if (productsArray.length > 0) {
                    setSelectedProduct(productsArray[0].name1);
                    setQuantity(productsArray[0].quantity);
                }
            } else {
                setProducts([]);
            }
        });

        const suppliersRef = ref(database, `${userName}suppliers`);
        onValue(suppliersRef, (snapshot) => {
        console.log("Suppliers Snapshot:", snapshot.val()); 
        if (snapshot.exists()) {
            let count = 0;
            snapshot.forEach(() => {
                count++;
            });
            setSupplierCount(count);
        } else {
            setSupplierCount(0);
        }
        });

        const saleRef = ref(database, `${userName}Customers`);
        onValue(saleRef, (snapshot) => {
        console.log("Sales Snapshot:", snapshot.val()); 
        if (snapshot.exists()) {
            let count = 0;
            snapshot.forEach(() => {
                count++;
            });
            setSale(count);
        } else {
            setSale(0);
        }
        });

        const currentDate = new Date();
const currentMonth1 = currentDate.getMonth() + 1; 

onValue(saleRef, (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        let currentMonthCount = 0; 
        Object.values(data).forEach(order => {
            const dateTime = order.date; 
            if (dateTime) { 
                const [datePart, timePart] = dateTime.split(", "); 
                const [dateStr, timeStr] = datePart.split("/");
                const month = parseInt(dateStr); 
                const year = parseInt(timeStr);
                if (month === currentMonth1) {
                    currentMonthCount++;
                }
            }
        });
        
        console.log("Count of orders for the current month:", currentMonthCount);
        setSale1(currentMonthCount);
    } else {
        console.log("No data available.");
        setSale1(0);
    }
});

        
        

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const purchaseOrdersRef = ref(database, `${userName}purchase`);
    onValue(purchaseOrdersRef, (snapshot) => {
        if (snapshot.exists()) {
            let count = 0;
            snapshot.forEach((childSnapshot) => {
                const dateTime = childSnapshot.val().dateTime;
                const [datePart, timePart] = dateTime.split(", "); 
                const [dateStr, timeStr] = datePart.split("/");
                const month = parseInt(dateStr); 
                if (month === currentMonth) {
                    count++;
                }
            });
            setPurchaseOrderCount(count);
        } else {
            setPurchaseOrderCount(0);
        }

    });
    
    

    onValue(purchaseOrdersRef, (snapshot) => {
        if (snapshot.exists()) {
            let counts = 0;
            snapshot.forEach(() => {
                counts++;
            });
            sethistorycount(counts);
        } else {
            sethistorycount(0);
        }
    });

    onValue(purchaseOrdersRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const history = {};
            Object.values(data).forEach(order => {
                const dateTime = order.dateTime;
                const [datePart, timePart] = dateTime.split(", "); 
                const [dateStr, timeStr] = datePart.split("/");
                const month = parseInt(dateStr); 
                const year = parseInt(timeStr);

                if (!history[year]) {
                    history[year] = {};
                }

                if (!history[year][month]) {
                    history[year][month] = 0;
                }

                history[year][month]++;
            });

            setPurchaseHistory(history);
        } else {
            setPurchaseHistory({});
        }
    });

    onValue(saleRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const uniqueCustomers = new Set(); 
            Object.values(data).forEach(order => {
                const dateTime = order.date; 
                const customerName = order.customerName; 
                if (dateTime && customerName) { 
                    const [datePart, timePart] = dateTime.split(", "); 
                    const [dateStr, timeStr] = datePart.split("/");
                    const month = parseInt(dateStr); 
                    const year = parseInt(timeStr);
                    if (month === currentMonth) {
                        uniqueCustomers.add(customerName); 
                    }
                }
            });
            
            console.log("Count of unique customer names for the current month:", uniqueCustomers.size);
            SetCustomerName(uniqueCustomers.size);
        } else {
            console.log("No data available.");
            SetCustomerName('');
        }
    });

    }, []);

    const prepareChartData = () => {
        const data = [];
        const monthlyCounts = Array.from({ length: 12 }, () => 0);
        for (const year in purchaseHistory) {
            const yearData = purchaseHistory[year];
            for (let month = 1; month <= 12; month++) {
                const count = yearData[month] || 0;
                monthlyCounts[month - 1] += count; 
            }
        }
        for (let month = 1; month <= 12; month++) {
            data.push({ x: `${month}`, y: monthlyCounts[month - 1] });
        }
        return data;
    };
    const handleProductChange = (e) => {
        const selectedProductName = e.target.value;
        setSelectedProduct(selectedProductName);
        const selectedProduct = products.find(product => product.name1 === selectedProductName);
        if (selectedProduct) {
            setQuantity(selectedProduct.quantity);
        } else {
            setQuantity(0);
        }
    };
    
    const generateYAxisTicks = () => {
        const maxYValue = Math.ceil(Math.max(...prepareChartData().map(dataPoint => dataPoint.y)));
        return Array.from({ length: maxYValue }, (_, index) => index + 1);
    };
    const handleChangeChartType = (event) => {
        const selectedChartType = event.target.value;
        console.log("Selected Chart Type:", selectedChartType); 
        setChartType(selectedChartType);
    };
    
    return (
        <div className="w-full">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-500 mt-1">Real-time business metrics and analytics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <FaTruck className="text-xl text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Purchases</p>
                        <h3 className="text-2xl font-bold text-gray-900">{historycount}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <FaChartBar className="text-xl text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Sales</p>
                        <h3 className="text-2xl font-bold text-gray-900">{sale}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                        <FaShoppingCart className="text-xl text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Monthly Sales</p>
                        <h3 className="text-2xl font-bold text-gray-900">{sale1}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                        <FaUser className="text-xl text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Suppliers</p>
                        <h3 className="text-2xl font-bold text-gray-900">{supplierCount}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Purchase Analytics</h3>
                            <p className="text-sm text-gray-500">Monthly purchase volume trends</p>
                        </div>
                        <select 
                            value={chartType} 
                            onChange={handleChangeChartType}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2 outline-none"
                        >
                            <option value="bar">Bar Chart</option>
                            <option value="line">Line Chart</option>
                            <option value="area">Area Chart</option>
                        </select>
                    </div>
                    <div className="h-72 w-full flex items-center justify-center">
                        {chartType === 'bar' && (
                            <Bar 
                                data={{
                                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                    datasets: [{
                                        label: 'Purchases',
                                        data: prepareChartData().map(d => d.y),
                                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                                        borderRadius: 4,
                                    }]
                                }} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } }
                                }} 
                            />
                        )}
                        {chartType === 'line' && (
                            <Line 
                                data={{
                                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                    datasets: [{
                                        label: 'Purchases',
                                        data: prepareChartData().map(d => d.y),
                                        borderColor: 'rgba(59, 130, 246, 1)',
                                        tension: 0.4,
                                        borderWidth: 3,
                                        pointBackgroundColor: '#fff',
                                        pointBorderColor: 'rgba(59, 130, 246, 1)',
                                        pointBorderWidth: 2,
                                    }]
                                }} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } }
                                }} 
                            />
                        )}
                        {chartType === 'area' && (
                            <Line 
                                data={{
                                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                    datasets: [{
                                        label: 'Purchases',
                                        data: prepareChartData().map(d => d.y),
                                        borderColor: 'rgba(59, 130, 246, 1)',
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        fill: true,
                                        tension: 0.4,
                                        borderWidth: 2,
                                    }]
                                }} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } }
                                }} 
                            />
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Inventory Check</h3>
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 flex-1 flex flex-col justify-center items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                            <FaBoxOpen className="text-3xl text-gray-400" />
                        </div>
                        <h4 className="text-3xl font-bold text-gray-900 mb-2">{quantity}</h4>
                        <p className="text-sm text-gray-500 font-medium mb-4">Current Stock Level</p>
                        
                        <select 
                            value={selectedProduct} 
                            onChange={handleProductChange}
                            className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2.5 outline-none font-medium shadow-sm"
                        >
                            <option value="">Select a product to view</option>
                            {products.map((product, index) => (
                                <option key={index} value={product.name1}>{product.name1}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Report1;