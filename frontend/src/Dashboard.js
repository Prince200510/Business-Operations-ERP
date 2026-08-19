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

    const [activeTab, setActiveTab] = useState('dashboard');
    const [currentComponent, setCurrentComponent] = useState(<Report1 />);
    
    const handleNavigation = (tabName, component) => {
        setActiveTab(tabName);
        setCurrentComponent(component);
    };

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

    const getNavItemClass = (tabName) => {
        return activeTab === tabName
            ? "flex items-center gap-3 px-3 py-2 bg-secondary-container text-on-secondary-container border-l-4 border-primary font-bold rounded-r-sm transition-all duration-200 ease-in-out cursor-pointer"
            : "flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high border-l-4 border-transparent rounded-r-sm transition-all duration-200 ease-in-out cursor-pointer";
    };

    const getIconClass = (tabName) => {
        return activeTab === tabName 
            ? "material-symbols-outlined icon-fill text-[20px]" 
            : "material-symbols-outlined text-[20px]";
    };

    return (
        <div className="bg-background text-on-background font-body-md h-screen w-full overflow-hidden flex flex-col">
            <header className="bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center w-full px-container-margin h-16 sticky top-0 z-50 shrink-0">
                <div className="flex items-center gap-gutter">
                    <div className="font-h1 text-h1 font-bold text-primary">Business ERP</div>
                </div>
                <div className="flex items-center gap-gutter">
                    <div className="relative hidden md:block w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                        <input className="w-full h-8 pl-9 pr-3 bg-surface-container-low border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-on-surface placeholder:text-on-surface-variant transition-all outline-none" placeholder="Search operations..." type="text"/>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                        </button>
                        <button className="p-2 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">help</span>
                        </button>
                    </div>
                    <div className="h-8 w-px bg-outline-variant mx-2"></div>
                    <div className="flex items-center gap-3 cursor-pointer opacity-80 transition-all hover:opacity-100" onClick={handleLogout}>
                        <div className="flex flex-col text-right hidden sm:flex">
                            <span className="font-body-sm text-[13px] text-on-surface font-semibold leading-tight capitalize">{username || 'Admin'}</span>
                            <span className="font-label-caps text-[10px] text-on-surface-variant">LOGOUT</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container border border-outline-variant flex items-center justify-center overflow-hidden font-bold">
                            {(username || 'A')[0].toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                <aside className="bg-surface border-r border-outline-variant fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 flex flex-col z-40 transition-all duration-200 ease-in-out hidden md:flex shrink-0">
                    <div className="p-container-margin border-b border-outline-variant flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg">
                            {(username || 'B')[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-h3 text-[14px] leading-tight text-on-surface font-semibold capitalize">{username || 'Business'} Workspace</span>
                            <span className="font-label-caps text-[11px] text-on-surface-variant">Enterprise Admin</span>
                        </div>
                    </div>                    
                    <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
                        <div className={getNavItemClass('dashboard')} onClick={() => handleNavigation('dashboard', <Report1 />)}>
                            <span className={getIconClass('dashboard')}>dashboard</span>
                            <span className="font-body-md text-[13px]">Dashboard</span>
                        </div>
                        
                        <div className={getNavItemClass('inventory')} onClick={() => handleNavigation('inventory', <Product />)}>
                            <span className={getIconClass('inventory')}>inventory_2</span>
                            <span className="font-body-md text-[13px]">Products & Inventory</span>
                        </div>
                        
                        <div className={getNavItemClass('new_sale')} onClick={() => handleNavigation('new_sale', <NewSale />)}>
                            <span className={getIconClass('new_sale')}>point_of_sale</span>
                            <span className="font-body-md text-[13px]">New Sale</span>
                        </div>

                        <div className={getNavItemClass('sales_history')} onClick={() => handleNavigation('sales_history', <HistorySale />)}>
                            <span className={getIconClass('sales_history')}>receipt_long</span>
                            <span className="font-body-md text-[13px]">Sales History</span>
                        </div>
                        
                        <div className={getNavItemClass('purchases')} onClick={() => handleNavigation('purchases', <Purchase />)}>
                            <span className={getIconClass('purchases')}>shopping_cart</span>
                            <span className="font-body-md text-[13px]">Purchases</span>
                        </div>
                        
                        <div className={getNavItemClass('suppliers')} onClick={() => handleNavigation('suppliers', <Supplier />)}>
                            <span className={getIconClass('suppliers')}>groups</span>
                            <span className="font-body-md text-[13px]">Suppliers</span>
                        </div>

                        <div className="my-2 border-t border-outline-variant mx-2"></div>
                        
                        <div className={getNavItemClass('settings')} onClick={() => handleNavigation('settings', <Bussiness />)}>
                            <span className={getIconClass('settings')}>settings</span>
                            <span className="font-body-md text-[13px]">Settings</span>
                        </div>
                    </nav>
                </aside>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background md:ml-64 w-full h-full">
                    <div className="w-full h-full">
                        {currentComponent}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
