import React, { useState, useEffect } from 'react';
import database from './firebase';
import { ref, get, set } from 'firebase/database';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';

const EditBusiness = () => {
    const navigate = useNavigate();
    const [businessInfo, setBusinessInfo] = useState({
        name: '',
        business_name: '',
        phone_no1: '',
        phone_no2: '',
        email_id: '',
        website_link: '',
        address: ''
    });

    const fetch_business_info = async () => {
        try {
            const token = localStorage.getItem('access_token');

            if(!token) {
                navigate('/');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/business/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if(response.ok) {
                const data = await response.json();
                setBusinessInfo(data);
            }
        } catch(error) {
            console.error(error);
        }
    }

    useEffect(() => {
       fetch_business_info();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setBusinessInfo(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const handleUpdate = async () => {
        const token = localStorage.getItem('access_token');

        if(!token) {
            navigate('/');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/business/`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({
                    name: businessInfo.name,
                    business_name: businessInfo.business_name,
                    phone_no1: businessInfo.phone_no1,
                    phone_no2: businessInfo.phone_no2,
                    email_id: businessInfo.email_id,
                    website_link: businessInfo.website_link,
                    address: businessInfo.address
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to create sale");
            }

            if(response.ok) {
                console.log('Business information updated successfully!');
                Swal.fire({
                    title: 'Success!',
                    text: 'Business Information is Updated successfully.',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                });
                navigate("/Dashboard");
            }
        } catch(error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update business information. Please try again later.',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            })
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Edit Business Info</h2>
                    <p className="text-gray-500 mt-1">Update your company details and contact information</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-800">Company Profile</h3>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                            <input 
                                id="name" 
                                type="text" 
                                value={businessInfo.name} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                                placeholder="Enter owner name"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Business Name</label>
                            <input 
                                id="business_name" 
                                type="text" 
                                value={businessInfo.business_name} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                                placeholder="Enter business name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Primary Phone</label>
                            <input 
                                id="phone_no1" 
                                type="text" 
                                value={businessInfo.phone_no1} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                                placeholder="+91 (234) 567-8900"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Secondary Phone</label>
                            <input 
                                id="phone_no2" 
                                type="text" 
                                value={businessInfo.phone_no2} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                                placeholder="+91 (234) 567-8901"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Email ID</label>
                            <input 
                                id="email_id" 
                                type="email" 
                                value={businessInfo.email_id} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                                placeholder="user@example.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Primary Website</label>
                            <input 
                                id="website_link" 
                                type="url" 
                                value={businessInfo.website_link} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                                placeholder="https://www.example.com"
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Business Address</label>
                            <textarea 
                                id="address" 
                                value={businessInfo.address} 
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm resize-none h-28"
                                placeholder="Enter full business address"
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button 
                            onClick={handleUpdate}
                            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default EditBusiness;