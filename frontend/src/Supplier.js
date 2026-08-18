import React, { useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import Swal from 'sweetalert2'
import { useLocation, useNavigate } from 'react-router-dom';

const Supplier = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userName } = location.state; 
    const [suppliers, setSuppliers] = useState([]);
    const [newSupplier, setNewSupplier] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        address: ''
    });

    const API_URL = process.env.REACT_APP_API_URL;

    const fetch_supplier = async () => {
        const token = localStorage.getItem('access_token');

        if(!token) {
            navigate('/');
            return;
        }

        try {
            const response = await fetch( `${API_URL}/suppliers/`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

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

            setSuppliers(data);
        } catch(error) {
            console.error(error);
            Swal.fire({title: 'Error!', text: 'Unable to load suppliers.', icon: 'error'});
        }
    };

    useEffect(() => {
        fetch_supplier();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSupplier({ ...newSupplier, [name]: value });
    };

    const handleNewSupplierSubmit = async () => {
        if (!newSupplier.name || !newSupplier.email || !newSupplier.phoneNumber || !newSupplier.address) {
            // alert("Please fill out all fields");
            Swal.fire({title: 'Missing information', text: 'Please fill out all fields.', icon: 'warning'});
            return;
        }

        const token = localStorage.getItem('access_token');

        if(!token) {
            navigate('/');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/suppliers/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newSupplier.name,
                    email: newSupplier.email,
                    phone_number: newSupplier.phoneNumber,
                    address: newSupplier.address
                })
            });

            const data = await response.json();

            if(response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('loggedInUser');
                navigate('/');
                return;
            }

            if(!response.ok) {
                throw new Error(data.detail || 'Failed to create supplier');
            }

            setSuppliers([...suppliers, data]);
            setNewSupplier({
                name: '',
                email: '',
                phoneNumber: '',
                address: ''
            });

            Swal.fire({
                title: 'Success!',
                text: 'Supplier added successfully.',
                icon: 'success'
            });

        } catch(error) {
            console.log(error);
            Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error'
            });
        }
       
    };
    
    const handleDeleteSupplier = async (supplierId) => {
        if (!supplierId) {
            console.error('Supplier name is not defined.');
            Swal.fire({
                title: 'Error!',
                text: 'Supplier Id is missing.',
                icon: 'error',
              });
            return;
        }

        const token = localStorage.getItem('access_token');

        if(!token) {
            navigate('/');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/suppliers/${supplierId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if(response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('loggedInUser');
                navigate('/');
                return;
            }

            if(!response.ok) {
                throw new Error(data.detail || 'Failed to delete supplier');
            }

            setSuppliers(suppliers.filter(supplier => supplier.id !== supplierId));
            Swal.fire({
                title: 'Supplier deleted !',
                icon: 'success'
            });
        } catch(error) {
            console.error(error);
            Swal.fire({
                title: 'Error !',
                text: error.message,
                icon: 'error'
            });
        }
    };
    
    return (
        <div className="w-full">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Suppliers Management</h2>
                    <p className="text-gray-500 mt-1">Manage your suppliers, contacts, and vendor details</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-800">Add New Supplier</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Company / Name <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                placeholder="E.g., Acme Corp" 
                                name="name" 
                                value={newSupplier.name} 
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
                            <input 
                                type="email" 
                                placeholder="contact@supplier.com" 
                                name="email" 
                                value={newSupplier.email} 
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                placeholder="+1 234 567 890" 
                                name="phoneNumber" 
                                value={newSupplier.phoneNumber} 
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Physical Address <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                placeholder="123 Business Rd" 
                                name="address" 
                                value={newSupplier.address} 
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button 
                            onClick={handleNewSupplierSubmit}
                            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
                        >
                            Save Supplier
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-800">Supplier Directory</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">ID</th>
                                <th className="px-6 py-4 font-semibold">Name / Company</th>
                                <th className="px-6 py-4 font-semibold">Contact Email</th>
                                <th className="px-6 py-4 font-semibold">Phone Number</th>
                                <th className="px-6 py-4 font-semibold">Address</th>
                                <th className="px-6 py-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {suppliers.length > 0 ? (
                                suppliers.map((supplier, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{supplier.name}</td>
                                        <td className="px-6 py-4 text-blue-600 hover:text-blue-800">
                                            <a href={`mailto:${supplier.email}`}>{supplier.email}</a>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{supplier.phone_number}</td>
                                        <td className="px-6 py-4 text-gray-600">{supplier.address}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleDeleteSupplier(supplier.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors inline-flex justify-center"
                                                title="Delete Supplier"
                                            >
                                                <AiOutlineDelete className="text-lg" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No suppliers registered yet. Add a supplier to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Supplier;
