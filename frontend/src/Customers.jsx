import React, { useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import Swal from 'sweetalert2'
import { useLocation, useNavigate } from 'react-router-dom';

const Customers = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchCustomers = async () => {
        const token = localStorage.getItem('access_token');
        if(!token) {
            navigate('/');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/customers/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if(response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('loggedInUser');
                navigate('/');
                return;
            }

            const data = await response.json();
            if(!response.ok) throw new Error(data.detail || 'Failed to fetch customers');

            setCustomers(data);
        } catch(error) {
            console.error(error);
            Swal.fire({title: 'Error!', text: 'Unable to load customers.', icon: 'error'});
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer({ ...newCustomer, [name]: value });
    };

    const handleNewCustomerSubmit = async () => {
        if (!newCustomer.name || !newCustomer.address) {
            Swal.fire({title: 'Missing information', text: 'Name and address are required.', icon: 'warning'});
            return;
        }

        const token = localStorage.getItem('access_token');
        if(!token) {
            navigate('/');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/customers/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newCustomer)
            });

            const data = await response.json();

            if(response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('loggedInUser');
                navigate('/');
                return;
            }

            if(!response.ok) throw new Error(data.detail || 'Failed to create customer');

            setCustomers([...customers, data]);
            setNewCustomer({ name: '', email: '', phone: '', address: '' });
            Swal.fire({ title: 'Success!', text: 'Customer added successfully.', icon: 'success' });
        } catch(error) {
            console.log(error);
            Swal.fire({ title: 'Error!', text: error.message, icon: 'error' });
        }
    };
    
    const handleDeleteCustomer = async (customerId) => {
        if (!customerId) return;
        const token = localStorage.getItem('access_token');
        if(!token) {
            navigate('/');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/customers/${customerId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if(response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('loggedInUser');
                navigate('/');
                return;
            }

            if(!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.detail || 'Failed to delete customer');
            }

            setCustomers(customers.filter(c => c.id !== customerId));
            Swal.fire({ title: 'Deleted!', icon: 'success' });
        } catch(error) {
            console.error(error);
            Swal.fire({ title: 'Error!', text: error.message, icon: 'error' });
        }
    };
    
    return (
        <div className="flex-1 overflow-y-auto p-container-margin w-full bg-background font-body-md text-on-background">
            <div className="flex flex-col gap-gutter max-w-[1600px] mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="font-h1 text-h1 text-on-surface">Customers Directory</h2>
                        <p className="font-body-md text-on-surface-variant mt-1">Manage your customer relationships and contact info</p>
                    </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col overflow-hidden mb-8">
                    <div className="p-density-medium border-b border-outline-variant bg-surface-container-lowest">
                        <h3 className="font-h3 text-[16px] text-on-surface">Add New Customer</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                                <input type="text" name="name" value={newCustomer.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" name="email" value={newCustomer.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input type="text" name="phone" value={newCustomer.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Physical Address <span className="text-red-500">*</span></label>
                                <input type="text" name="address" value={newCustomer.address} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={handleNewCustomerSubmit} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm">Save Customer</button>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col overflow-hidden">
                    <div className="p-density-medium border-b border-outline-variant bg-surface-container-lowest">
                        <h3 className="font-h3 text-[16px] text-on-surface">Customer List</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">ID</th>
                                    <th className="px-6 py-4 font-semibold">Name</th>
                                    <th className="px-6 py-4 font-semibold">Email</th>
                                    <th className="px-6 py-4 font-semibold">Phone</th>
                                    <th className="px-6 py-4 font-semibold">Address</th>
                                    <th className="px-6 py-4 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {customers.length > 0 ? customers.map((c, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                                        <td className="px-6 py-4 text-blue-600 hover:text-blue-800">{c.email}</td>
                                        <td className="px-6 py-4 text-gray-600">{c.phone}</td>
                                        <td className="px-6 py-4 text-gray-600">{c.address}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleDeleteCustomer(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors inline-flex justify-center"><AiOutlineDelete className="text-lg" /></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No customers found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Customers;
