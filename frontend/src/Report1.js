import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTruck, FaChartBar, FaShoppingCart, FaBoxOpen, FaUser, FaUserFriends } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const Report1 = () => {
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [chartType, setChartType] = useState('bar');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetch_dashboard = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');

            if(!token) {
                navigate('/');
                return;
            }

            const response = await fetch(`${process.env.REACT_APP_API_URL}/reports/dashbaord`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if(response.status === 401) {
                localStorage.removeItem('access_token');
                navigate('/');
                return;
            }

            const data = await response.json();
            setReport(data);
            setProducts(data.products || []);

            if(data.products && data.products.length > 0) {
                setSelectedProduct(data.products[0].name1);
                setQuantity(data.products[0].quantity);
            }
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetch_dashboard();
    }, []);

    const prepare_chart = () => {
        if(!report) {
            return Array(12).fill(0);
        }

        return report.monthly_sales.map(item => item.count);
    };

    const handle_product_change = (e) => {
        const selected_name = e.target.value;
        setSelectedProduct(selected_name);
        const product = products.find(prod => prod.name1 === selected_name);

        if(product) {
            setQuantity(product.quantity);
        } else {
            setQuantity(0);
        }
    }
        

    
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
        <div className="flex-1 overflow-y-auto p-container-margin w-full bg-background font-body-md text-on-background">
            <div className="flex flex-col gap-gutter max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-density-medium flex flex-col gap-2 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <span className="font-body-sm text-body-sm text-secondary uppercase tracking-wider">Total Sales</span>
                            <span className="material-symbols-outlined text-outline text-[20px]">payments</span>
                        </div>
                        <div className="font-h2 text-h2 text-on-surface">{report?.summary.total_sales ?? 0}</div>
                        <div className="flex items-center gap-1 mt-auto pt-2">
                            <span className="material-symbols-outlined text-[16px] text-primary">trending_up</span>
                            <span className="font-data-mono text-data-mono text-primary">Active</span>
                            <span className="font-body-sm text-[11px] text-on-surface-variant ml-1">all time records</span>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center pointer-events-none">
                            <span className="material-symbols-outlined text-[48px] text-primary/20">payments</span>
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-density-medium flex flex-col gap-2 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <span className="font-body-sm text-body-sm text-secondary uppercase tracking-wider">New Customers</span>
                            <span className="material-symbols-outlined text-outline text-[20px]">group_add</span>
                        </div>
                        <div className="font-h2 text-h2 text-on-surface">{report?.summary.sales_this_month ?? 0}</div>
                        <div className="flex items-center gap-1 mt-auto pt-2">
                            <span className="material-symbols-outlined text-[16px] text-primary">trending_up</span>
                            <span className="font-data-mono text-data-mono text-primary">Monthly</span>
                            <span className="font-body-sm text-[11px] text-on-surface-variant ml-1">orders this month</span>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-secondary/5 rounded-full flex items-center justify-center pointer-events-none">
                            <span className="material-symbols-outlined text-[48px] text-secondary/20">group_add</span>
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-density-medium flex flex-col gap-2 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <span className="font-body-sm text-body-sm text-secondary uppercase tracking-wider">Total Purchases</span>
                            <span className="material-symbols-outlined text-outline text-[20px]">shopping_cart</span>
                        </div>
                        <div className="font-h2 text-h2 text-on-surface">{report?.summary.total_purchases ?? 0}</div>
                        <div className="flex items-center gap-1 mt-auto pt-2">
                            <span className="material-symbols-outlined text-[16px] text-error">trending_down</span>
                            <span className="font-data-mono text-data-mono text-error">Volume</span>
                            <span className="font-body-sm text-[11px] text-on-surface-variant ml-1">total recorded</span>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-tertiary/5 rounded-full flex items-center justify-center pointer-events-none">
                            <span className="material-symbols-outlined text-[48px] text-tertiary/20">shopping_cart</span>
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-density-medium flex flex-col gap-2 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <span className="font-body-sm text-body-sm text-secondary uppercase tracking-wider">Active Suppliers</span>
                            <span className="material-symbols-outlined text-outline text-[20px]">inventory_2</span>
                        </div>
                        <div className="font-h2 text-h2 text-on-surface">{report?.summary.active_suppliers ?? 0}</div>
                        <div className="flex items-center gap-2 mt-auto pt-2 w-full">
                            <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: '100%' }}></div>
                            </div>
                            <span className="font-data-mono text-[11px] text-on-surface-variant">Active</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                    <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col">
                        <div className="p-density-medium border-b border-outline-variant flex justify-between items-center">
                            <h3 className="font-h3 text-[16px] text-on-surface">Monthly Purchase Trend</h3>
                            <div className="flex gap-2">
                                <select 
                                    value={chartType} 
                                    onChange={handleChangeChartType}
                                    className="bg-surface-container-low border border-outline-variant text-on-surface text-sm rounded focus:ring-1 focus:ring-primary focus:border-primary block py-1 px-2 outline-none cursor-pointer"
                                >
                                    <option value="bar">Bar Chart</option>
                                    <option value="line">Line Chart</option>
                                    <option value="area">Area Chart</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-density-medium flex-1 min-h-[300px] relative w-full h-full">
                            {chartType === 'bar' && (
                                <Bar 
                                    data={{
                                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                        datasets: [{
                                            label: 'Sales',
                                            data: prepare_chart(),
                                            backgroundColor: '#1d4ed8',
                                            borderRadius: 4,
                                        }]
                                    }} 
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            y: { beginAtZero: true, grid: { color: '#e0e3e5' } },
                                            x: { grid: { display: false } }
                                        }
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
                                            borderColor: '#1d4ed8',
                                            tension: 0.4,
                                            borderWidth: 3,
                                            pointBackgroundColor: '#ffffff',
                                            pointBorderColor: '#1d4ed8',
                                            pointBorderWidth: 2,
                                        }]
                                    }} 
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            y: { beginAtZero: true, grid: { color: '#e0e3e5' } },
                                            x: { grid: { display: false } }
                                        }
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
                                            borderColor: '#1d4ed8',
                                            backgroundColor: 'rgba(29, 78, 216, 0.15)',
                                            fill: true,
                                            tension: 0.4,
                                            borderWidth: 2,
                                        }]
                                    }} 
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            y: { beginAtZero: true, grid: { color: '#e0e3e5' } },
                                            x: { grid: { display: false } }
                                        }
                                    }} 
                                />
                            )}
                        </div>
                    </div>

                    {/* Quick Inventory Check */}
                    <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col">
                        <div className="p-density-medium border-b border-outline-variant flex justify-between items-center">
                            <h3 className="font-h3 text-[16px] text-on-surface">Quick Inventory Check</h3>
                            <button className="p-1 hover:bg-surface-container rounded text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[18px]">more_horiz</span></button>
                        </div>
                        <div className="p-density-medium flex-1 flex flex-col items-center justify-center gap-6 min-h-[300px]">
                            
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" fill="transparent" r="40" stroke="#1d4ed8" strokeDasharray="251.2" strokeDashoffset="60" strokeWidth="16"></circle>
                                    <circle className="transform origin-center rotate-[270deg]" cx="50" cy="50" fill="transparent" r="40" stroke="#e0e3e5" strokeDasharray="251.2" strokeDashoffset="190" strokeWidth="16"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="font-h2 text-[32px] text-on-surface">{quantity}</span>
                                    <span className="font-label-caps text-[9px] text-on-surface-variant">IN STOCK</span>
                                </div>
                            </div>

                            <div className="w-full flex flex-col gap-2 px-4 relative">
                                <select 
                                    value={selectedProduct} 
                                    onChange={handle_product_change}
                                    className="w-full appearance-none bg-surface-container-low border border-outline-variant text-on-surface text-sm rounded focus:ring-1 focus:ring-primary focus:border-primary p-2.5 outline-none font-medium cursor-pointer"
                                >
                                    <option value="" disabled>Select product to query...</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.name1}>{product.name1}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center px-2 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 3: Data Table */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-6">
                    <div className="lg:col-span-12 bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col overflow-hidden">
                        <div className="p-density-medium border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
                            <h3 className="font-h3 text-[16px] text-on-surface">Product Directory Preview</h3>
                            <button className="text-primary text-body-sm font-medium hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-surface-container-low font-label-caps text-on-surface-variant border-b border-outline-variant">
                                    <tr>
                                        <th className="p-density-high font-medium pl-density-medium">Product Name</th>
                                        <th className="p-density-high font-medium">Supplier Reference</th>
                                        <th className="p-density-high font-medium">Sale Price</th>
                                        <th className="p-density-high font-medium text-right pr-density-medium">Stock Status</th>
                                    </tr>
                                </thead>
                                <tbody className="font-body-sm text-on-surface">
                                    {products.slice(0, 5).map((prod) => (
                                        <tr key={prod.id} className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors">
                                            <td className="p-density-high pl-density-medium font-data-mono text-primary">{prod.name1}</td>
                                            <td className="p-density-high">{prod.supplier_id || 'N/A'}</td>
                                            <td className="p-density-high text-on-surface-variant">₹{parseFloat(prod.sale_price || 0).toFixed(2)}</td>
                                            <td className="p-density-high text-right pr-density-medium">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${prod.quantity > 50 ? 'bg-secondary-container text-on-secondary-container' : prod.quantity > 10 ? 'bg-error-container text-on-error-container' : 'bg-error text-on-error'}`}>{prod.quantity}{' '}Units</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-density-high text-center text-on-surface-variant py-8">No products found.</td>
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

export default Report1;