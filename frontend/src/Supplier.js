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

        const token = localStorage.getItem('access_item');

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
        <>
            <h1 class="supplier">Suppliers</h1>
            <div class="supplier-container">
                <div class="parent-supplier">
                    <h3>Supplier Details</h3>
                    <hr></hr>
                    <div class="new-supplier-entry">
                        <div class="data">
                            <label>Name</label><br></br>
                            <input type="text" placeholder="Enter name" name="name" value={newSupplier.name} onChange={handleInputChange}></input>
                        </div>
                        <div class="data">
                            <label>Email</label><br></br>
                            <input type="text" placeholder="Enter email" name="email" value={newSupplier.email} onChange={handleInputChange}></input>
                        </div>
                        <div class="data">
                            <label>Phone Number</label><br></br>
                            <input type="text" placeholder="Enter phone number" name="phoneNumber" value={newSupplier.phoneNumber} onChange={handleInputChange}></input>
                        </div>
                        <div class="data">
                            <label>Address</label><br></br>
                            <input type="text" placeholder="Enter address" name="address" value={newSupplier.address} onChange={handleInputChange}></input>
                        </div>
                        <div class="data">
                            <label></label><br></br>
                            <button onClick={handleNewSupplierSubmit}>New Supplier</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="supplier-data-show">
                <table class="supplier-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Address</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                    {suppliers.map((supplier, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{supplier.name}</td>
                            <td>{supplier.email}</td>
                            <td>{supplier.phoneNumber}</td>
                            <td>{supplier.address}</td>
                            <td>
                                <button onClick={() => handleDeleteSupplier(supplier.name)}>
                                    <AiOutlineDelete className="delete" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Supplier;
