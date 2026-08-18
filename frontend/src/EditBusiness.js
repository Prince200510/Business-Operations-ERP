import React, { useState, useEffect } from 'react';
import database from './firebase';
import { ref, get, set } from 'firebase/database';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';

const EditBusiness = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userName } = location.state;
    const [businessInfo, setBusinessInfo] = useState({
        name: '',
        businessName: '',
        phoneNumber1: '',
        phoneNumber2: '',
        websiteName1: '',
        websiteName2: '',
        address: ''
    });

    useEffect(() => {
        const fetchBusinessInfo = async () => {
            try {
                const businessRef = ref(database, `${userName}BusinessInfo`);
                const snapshot = await get(businessRef);
                if (snapshot.exists()) {
                    setBusinessInfo(snapshot.val());
                } else {
                    console.log("No business information available.");
                }
            } catch (error) {
                console.error('Error fetching business information:', error);
            }
        };

        fetchBusinessInfo();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setBusinessInfo(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const handleUpdate = () => {
        set(ref(database, `${userName}BusinessInfo`), businessInfo)
            .then(() => {
                console.log('Business information updated successfully!');
                Swal.fire({
                    title: 'Success!',
                    text: 'Business Information is Updated successfully.',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                });
                navigate("/Bussiness");
            })
            .catch((error) => {
                console.error('Error updating business information:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Error updating business information',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            });
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
                                id="businessName" 
                                type="text" 
                                value={businessInfo.businessName} 
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
                                id="phoneNumber1" 
                                type="text" 
                                value={businessInfo.phoneNumber1} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                                placeholder="+1 (234) 567-8900"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Secondary Phone</label>
                            <input 
                                id="phoneNumber2" 
                                type="text" 
                                value={businessInfo.phoneNumber2} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                                placeholder="+1 (234) 567-8901"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Primary Website</label>
                            <input 
                                id="websiteName1" 
                                type="text" 
                                value={businessInfo.websiteName1} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                                placeholder="https://www.example.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Secondary Website</label>
                            <input 
                                id="websiteName2" 
                                type="text" 
                                value={businessInfo.websiteName2} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none text-sm"
                                placeholder="https://store.example.com"
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