import React, { useState, useEffect } from 'react';
import { AiOutlineEnvironment, AiOutlineLink, AiOutlinePhone } from 'react-icons/ai';
import EditBusiness from './EditBusiness';
import { useNavigate } from 'react-router-dom';

const Business = () => {
    const [currentComponent, setCurrentComponent] = useState();
    const [businessInfo, setBusinessInfo] = useState(null);
    const [showContent, setShowContent] = useState(true);
    const navigate = useNavigate();

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

    const handleEditBusinessClick = () => {
        setCurrentComponent(<EditBusiness />);
        setShowContent(false);
    };

    return (
        <div className="flex-1 overflow-y-auto p-container-margin w-full bg-background font-body-md text-on-background">
            <div className="flex flex-col gap-gutter max-w-[1600px] mx-auto">
                {showContent && (
                    <>
                        <div className="mb-4 flex justify-between items-center">
                            <div>
                                <h2 className="font-h1 text-h1 text-on-surface">Business Profile</h2>
                                <p className="font-body-md text-on-surface-variant mt-1">Manage your company information and settings</p>
                            </div>
                            <button 
                                onClick={handleEditBusinessClick}
                                className="px-5 py-2.5 bg-primary text-on-primary font-medium rounded-lg shadow-sm transition-colors text-sm"
                            >
                                Edit Profile
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-8">
                            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col overflow-hidden">
                                <div className="p-density-medium border-b border-outline-variant bg-surface-container-lowest">
                                    <h3 className="font-h3 text-[16px] text-on-surface">Contact Information</h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <AiOutlinePhone className="text-xl" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-on-surface">{businessInfo?.phone_no1 || '-'}</p>
                                            <p className="text-sm text-on-surface-variant mt-1">{businessInfo?.phone_no2 || '-'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <AiOutlineLink className="text-xl" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-on-surface">{businessInfo?.website_link || '-'}</p>
                                            <p className="text-sm text-on-surface-variant mt-1">{businessInfo?.email_id || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <AiOutlineEnvironment className="text-xl" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-on-surface whitespace-pre-wrap">{businessInfo?.address || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col overflow-hidden items-center justify-center p-8 text-center">
                                <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-4xl mb-4 shadow-sm border border-outline-variant overflow-hidden">
                                    {businessInfo?.business_name ? businessInfo.business_name[0].toUpperCase() : 'B'}
                                </div>
                                <h3 className="font-h2 text-h2 text-on-surface mb-2">{businessInfo?.business_name || 'No business information'}</h3>
                                <p className="text-on-surface-variant font-body-md">{businessInfo?.name || '-'}</p>
                            </div>
                        </div>
                    </>
                )}
                {currentComponent}
            </div>
        </div>
    );
};

export default Business;
