import React, { useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import Swal from 'sweetalert2'
import { useLocation, useNavigate } from 'react-router-dom';

const Leads = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [newLead, setNewLead] = useState({
        name: '',
        email: '',
        phone: '',
        status: 'New'
    });

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchLeads = async () => {
        const token = localStorage.getItem('access_token');
        if(!token) { navigate('/'); return; }

        try {
            const response = await fetch(`${API_URL}/leads/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if(response.status === 401) {
                localStorage.removeItem('access_token');
                navigate('/'); return;
            }

            const data = await response.json();
            if(!response.ok) throw new Error(data.detail || 'Failed to fetch');
            setLeads(data);
        } catch(error) {
            Swal.fire({title: 'Error!', text: 'Unable to load leads.', icon: 'error'});
        }
    };

    useEffect(() => { fetchLeads(); }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLead({ ...newLead, [name]: value });
    };

    const handleNewLeadSubmit = async () => {
        if (!newLead.name) {
            Swal.fire({title: 'Missing information', text: 'Name is required.', icon: 'warning'});
            return;
        }

        const token = localStorage.getItem('access_token');
        if(!token) return;

        try {
            const response = await fetch(`${API_URL}/leads/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newLead)
            });

            const data = await response.json();
            if(!response.ok) throw new Error(data.detail);

            setLeads([data, ...leads]);
            setNewLead({ name: '', email: '', phone: '', status: 'New' });
            Swal.fire({ title: 'Success!', icon: 'success' });
        } catch(error) {
            Swal.fire({ title: 'Error!', text: error.message, icon: 'error' });
        }
    };
    
    const handleDeleteLead = async (id) => {
        const token = localStorage.getItem('access_token');
        try {
            await fetch(`${API_URL}/leads/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            setLeads(leads.filter(l => l.id !== id));
        } catch(error) {
            Swal.fire({ title: 'Error!', icon: 'error' });
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        const token = localStorage.getItem('access_token');
        const lead = leads.find(l => l.id === id);
        try {
            const res = await fetch(`${API_URL}/leads/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...lead, status: newStatus })
            });
            const data = await res.json();
            if (res.ok) setLeads(leads.map(l => l.id === id ? data : l));
        } catch(error) {}
    };
    
    return (
        <div className="flex-1 overflow-y-auto p-container-margin w-full bg-background font-body-md text-on-background">
            <div className="flex flex-col gap-gutter max-w-[1600px] mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="font-h1 text-h1 text-on-surface">Lead Tracking</h2>
                    </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col mb-8 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="space-y-1.5"><label className="block text-sm">Name *</label><input type="text" name="name" value={newLead.name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                        <div className="space-y-1.5"><label className="block text-sm">Email</label><input type="email" name="email" value={newLead.email} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                        <div className="space-y-1.5"><label className="block text-sm">Phone</label><input type="text" name="phone" value={newLead.phone} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                        <div className="space-y-1.5"><label className="block text-sm">Status</label><select name="status" value={newLead.status} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg"><option value="New">New</option><option value="Contacted">Contacted</option><option value="Qualified">Qualified</option><option value="Lost">Lost</option></select></div>
                        <div className="flex justify-end"><button onClick={handleNewLeadSubmit} className="px-5 py-2.5 bg-primary-600 text-white rounded-lg">Save</button></div>
                    </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Name</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Actions</th></tr>
                        </thead>
                        <tbody>
                            {leads.map((l, i) => (
                                <tr key={l.id} className="border-b">
                                    <td className="px-6 py-4">{i + 1}</td>
                                    <td className="px-6 py-4">{l.name}</td>
                                    <td className="px-6 py-4">{l.email} <br/> {l.phone}</td>
                                    <td className="px-6 py-4">
                                        <select value={l.status} onChange={(e) => handleStatusChange(l.id, e.target.value)} className="border rounded p-1">
                                            <option value="New">New</option><option value="Contacted">Contacted</option><option value="Qualified">Qualified</option><option value="Lost">Lost</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleDeleteLead(l.id)} className="text-red-500"><AiOutlineDelete className="text-lg" /></button>
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

export default Leads;
