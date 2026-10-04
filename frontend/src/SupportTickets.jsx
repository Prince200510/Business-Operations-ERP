import React, { useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom';

const SupportTickets = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [newTicket, setNewTicket] = useState({
        customer_id: '',
        subject: '',
        description: '',
        status: 'Open'
    });

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchData = async () => {
        const token = localStorage.getItem('access_token');
        if(!token) return;

        try {
            const [ticRes, cusRes] = await Promise.all([
                fetch(`${API_URL}/support_tickets/`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/customers/`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if(ticRes.ok) setTickets(await ticRes.json());
            if(cusRes.ok) setCustomers(await cusRes.json());
        } catch(error) {}
    };

    useEffect(() => { fetchData(); }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTicket({ ...newTicket, [name]: value });
    };

    const handleSubmit = async () => {
        if (!newTicket.customer_id || !newTicket.subject || !newTicket.description) {
            Swal.fire({title: 'Missing info', icon: 'warning'});
            return;
        }

        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`${API_URL}/support_tickets/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(newTicket)
            });

            const data = await response.json();
            if(response.ok) {
                setTickets([data, ...tickets]);
                setNewTicket({ customer_id: '', subject: '', description: '', status: 'Open' });
            }
        } catch(error) {}
    };
    
    const handleDelete = async (id) => {
        const token = localStorage.getItem('access_token');
        try {
            await fetch(`${API_URL}/support_tickets/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            setTickets(tickets.filter(t => t.id !== id));
        } catch(error) {}
    };

    const handleStatusChange = async (id, newStatus) => {
        const token = localStorage.getItem('access_token');
        const ticket = tickets.find(t => t.id === id);
        try {
            const res = await fetch(`${API_URL}/support_tickets/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...ticket, status: newStatus })
            });
            const data = await res.json();
            if (res.ok) setTickets(tickets.map(t => t.id === id ? data : t));
        } catch(error) {}
    };

    const getCustomerName = (id) => {
        const c = customers.find(c => c.id === id);
        return c ? c.name : 'Unknown';
    };
    
    return (
        <div className="flex-1 overflow-y-auto p-container-margin w-full bg-background font-body-md text-on-background">
            <div className="flex flex-col gap-gutter max-w-[1600px] mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-h1 text-h1 text-on-surface">Support Tickets</h2>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col mb-8 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
                        <div className="space-y-1.5"><label className="block text-sm">Customer *</label><select name="customer_id" value={newTicket.customer_id} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg"><option value="">Select Customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                        <div className="space-y-1.5"><label className="block text-sm">Subject *</label><input type="text" name="subject" value={newTicket.subject} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                        <div className="space-y-1.5 lg:col-span-2"><label className="block text-sm">Description *</label><textarea name="description" value={newTicket.description} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg h-[42px]" /></div>
                        <div className="flex justify-end pt-6"><button onClick={handleSubmit} className="px-5 py-2.5 bg-primary-600 text-white rounded-lg w-full">Save</button></div>
                    </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Subject</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Actions</th></tr>
                        </thead>
                        <tbody>
                            {tickets.map((t, i) => (
                                <tr key={t.id} className="border-b">
                                    <td className="px-6 py-4">{i + 1}</td>
                                    <td className="px-6 py-4">{getCustomerName(t.customer_id)}</td>
                                    <td className="px-6 py-4"><strong>{t.subject}</strong><br/><span className="text-gray-500">{t.description}</span></td>
                                    <td className="px-6 py-4">
                                        <select value={t.status} onChange={(e) => handleStatusChange(t.id, e.target.value)} className="border rounded p-1">
                                            <option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleDelete(t.id)} className="text-red-500"><AiOutlineDelete className="text-lg" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupportTickets;
