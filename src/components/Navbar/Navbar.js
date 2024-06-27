import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>snap360 appointments</h3>
      </div>
      <Nav className="flex-column">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>Dashboard</NavLink>
        <NavLink to="/bookings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>Bookings</NavLink>
        <NavLink to="/services" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>Services</NavLink>
        <NavLink to="/payments" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>Payments</NavLink>
        <NavLink to="/clients" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>Clients</NavLink>
      </Nav>
      <div className="sidebar-footer">
        <button className="btn btn-primary w-100" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
