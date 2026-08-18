import { useLocation, Navigate, useNavigate, Link, Route, Routes, Outlet } from 'react-router-dom';

import { AiOutlineSearch, AiOutlineDown } from 'react-icons/ai';
import { FaPalette, FaNewspaper, FaTruck, FaBox } from 'react-icons/fa';
import { IoCartOutline, IoPeopleOutline, IoSettingsOutline } from 'react-icons/io5';
import React, { useState } from 'react';
import Report1 from './Report1';
import Supplier from './Supplier';
import Product from './Product';
import Purchase from './Purchase';
import NewSale from './NewSale.js';
import HistorySale from './HistorySale';
import Bussiness from './Bussiness.js';

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get username from location state OR from localStorage if navigated automatically
    const loggedInUserStr = localStorage.getItem('loggedInUser');
    const storedUser = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;
    const username = location?.state?.userName || (storedUser && storedUser.username);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDropdownOpen1, setIsDropdownOpen1] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    }; 

    const toggleDropdown1 = () => {
        setIsDropdownOpen1(!isDropdownOpen1);
    };

    const [currentComponent, setCurrentComponent] = useState(<Report1 />);
    
    const handleDashboardClick = () => {
        setCurrentComponent(<Report1 />);
    };

    const handleSupplierClick = () => {
        setCurrentComponent(<Supplier />);
    };

    const handleProductClick = () => {
        setCurrentComponent(<Product />);
    };

    const handlePurchaseClick = () => {
        setCurrentComponent(<Purchase />);
    }

    const handleNewSaleClick = () => {
        setCurrentComponent(<NewSale />);
    }

    const handleHistorySaleClick = () => {
        setCurrentComponent(<HistorySale />);
    }

    const handleBussinessClick = () => {
        setCurrentComponent(<Bussiness />);
    }


    if (!location.state || !location.state.userName) {
        if (storedUser && storedUser.username) {
            return <Navigate to="/Dashboard" state={{ userName: storedUser.username }} replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('access_token');
        navigate('/');
      };
    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            <div className="w-64 bg-sidebar text-white flex flex-col shadow-xl z-20 transition-all duration-300 shrink-0">
                <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-gray-900 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary-500 flex items-center justify-center font-bold text-lg shadow-inner">N</div>
                        <span className="text-xl font-bold tracking-tight">Nexora ERP</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                    <nav className="space-y-1 px-3">
                        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-2">Overview</p>
                        <div onClick={handleDashboardClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 cursor-pointer text-gray-300 hover:text-white transition-colors group">
                            <FaPalette className="text-gray-400 group-hover:text-primary-400 text-lg" />
                            <span className="font-medium text-sm">Dashboard</span>
                        </div>
                        <div onClick={handleNewSaleClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 cursor-pointer text-gray-300 hover:text-white transition-colors group">
                            <FaNewspaper className="text-gray-400 group-hover:text-primary-400 text-lg" />
                            <span className="font-medium text-sm">New Sale</span>
                        </div>
                        
                        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Management</p>
                        <div className="space-y-1">
                            <div onClick={toggleDropdown} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-800 cursor-pointer text-gray-300 hover:text-white transition-colors group">
                                <div className="flex items-center gap-3">
                                    <IoCartOutline className="text-gray-400 group-hover:text-primary-400 text-xl" />
                                    <span className="font-medium text-sm">Sales</span>
                                </div>
                                <AiOutlineDown className={`text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>
                            {isDropdownOpen && (
                                <div className="pl-11 pr-3 space-y-1 mt-1">
                                    <div onClick={handleNewSaleClick} className="py-2 text-sm text-gray-400 hover:text-white cursor-pointer transition-colors">Create Sale</div>
                                    <div onClick={handleHistorySaleClick} className="py-2 text-sm text-gray-400 hover:text-white cursor-pointer transition-colors">Sales History</div>
                                </div>
                            )}
                        </div>

                        <div onClick={handlePurchaseClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 cursor-pointer text-gray-300 hover:text-white transition-colors group">
                            <FaTruck className="text-gray-400 group-hover:text-primary-400 text-lg" />
                            <span className="font-medium text-sm">Purchases</span>
                        </div>
                        <div onClick={handleProductClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 cursor-pointer text-gray-300 hover:text-white transition-colors group">
                            <FaBox className="text-gray-400 group-hover:text-primary-400 text-lg" />
                            <span className="font-medium text-sm">Products</span>
                        </div>
                        <div onClick={handleSupplierClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 cursor-pointer text-gray-300 hover:text-white transition-colors group">
                            <IoPeopleOutline className="text-gray-400 group-hover:text-primary-400 text-xl" />
                            <span className="font-medium text-sm">Suppliers</span>
                        </div>

                        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Configuration</p>
                        <div className="space-y-1">
                            <div onClick={toggleDropdown1} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-800 cursor-pointer text-gray-300 hover:text-white transition-colors group">
                                <div className="flex items-center gap-3">
                                    <IoSettingsOutline className="text-gray-400 group-hover:text-primary-400 text-xl" />
                                    <span className="font-medium text-sm">Settings</span>
                                </div>
                                <AiOutlineDown className={`text-xs transition-transform ${isDropdownOpen1 ? 'rotate-180' : ''}`} />
                            </div>
                            {isDropdownOpen1 && (
                                <div className="pl-11 pr-3 space-y-1 mt-1">
                                    <div onClick={handleBussinessClick} className="py-2 text-sm text-gray-400 hover:text-white cursor-pointer transition-colors">Business Profile</div>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </div>

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
                    <div className="flex items-center text-gray-500 text-sm font-medium">
                        <span className="text-gray-400">Nexora ERP</span>
                        <span className="mx-2 text-gray-300">/</span>
                        <span className="text-gray-900">Workspace</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 pr-4 border-r border-gray-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900 leading-tight capitalize">{username || 'Admin'}</p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold border border-primary-200 shadow-sm">
                                {(username || 'A')[0].toUpperCase()}
                            </div>
                        </div>
                        <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded transition-colors">
                            Logout
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto">
                        {currentComponent}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
