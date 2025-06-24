import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DashboardPage.css';
import api from '../utils/api'; 

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [activeDashboardView, setActiveDashboardView] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch logged-in user
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get('/user');
      setUser(res.data);
      if (res.data.role === 'admin') {
        setActiveDashboardView('viewUsersOnly');
        fetchAllUsers('');
      } else {
        setActiveDashboardView('viewProfile');
        setForm({ name: res.data.name, email: res.data.email, password: '', role: res.data.role });
      }
    } catch {
      localStorage.clear();
      navigate('/login');
    }
  }, [navigate]);

  // Fetch users (for admin)
  const fetchAllUsers = useCallback(async (query = '') => {
    try {
      const url = query
        ? `/admin/users/search?q=${query}`
        : `/admin/users`;
      const res = await api.get(url);
      setUsers(res.data.data || res.data);
    } catch {
      setUsers([]);
    }
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch {}
    localStorage.clear();
    navigate('/login');
  };

  // Update own profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/user/profile', form);
      alert('Profile updated!');
    } catch {
      alert('Update failed');
    }
  };

  // Admin: update user
  const handleAdminUserUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${editingUser.id}`, form);
      setEditingUser(null);
      fetchAllUsers('');
    } catch {
      alert('Update failed');
    }
  };

  // Admin: create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) {
      alert('All fields are required');
      return;
    }
    try {
      await api.post('/admin/users', form);
      setCreatingUser(false);
      setForm({ name: '', email: '', password: '', role: 'user' });
      fetchAllUsers('');
    } catch {
      alert('Creation failed');
    }
  };

  // Admin: delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchAllUsers('');
    } catch {
      alert('Delete failed');
    }
  };

  // Search users
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchAllUsers('');
    } else {
      fetchAllUsers(searchQuery.trim());
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    fetchUser();
  }, [fetchUser, navigate]);


  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">{user.role === 'admin' ? 'Admin Panel' : 'User Panel'}</div>
        <ul className="sidebar-nav">
          <li>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              if (user.role === 'admin') {
                setActiveDashboardView('viewUsersOnly');
                setEditingUser(null);
                setCreatingUser(false);
                fetchAllUsers('');
              } else {
                setActiveDashboardView('viewProfile');
              }
            }} className={activeDashboardView === (user.role === 'admin' ? 'viewUsersOnly' : 'viewProfile') ? 'active' : ''}>
              Dashboard
            </a>
          </li>
          {user.role === 'admin' && (
            <li>
              <a href="#" onClick={(e) => {
                e.preventDefault();
                setActiveDashboardView('manageUsers');
                setEditingUser(null);
                setCreatingUser(false);
                fetchAllUsers('');
              }} className={activeDashboardView === 'manageUsers' ? 'active' : ''}>Manage Users</a>
            </li>
          )}
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main-content">
        <header className="dashboard-header">
          <div className="header-title">{user.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}</div>
          <div className="user-info">Welcome, <strong>{user.name}</strong></div>
        </header>

        <div className="dashboard-content-area">
          {/* Profile (User) */}
          {user.role !== 'admin' && activeDashboardView === 'viewProfile' && (
            <div className="dashboard-card">
              <h3>Your Profile</h3>
              <form onSubmit={handleProfileUpdate}>
                <input type="text" className="form-control mb-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
                <input type="email" className="form-control mb-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
                <button className="btn btn-primary">Update</button>
              </form>
            </div>
          )}

          {/* Read-Only User List (Admin) */}
          {user.role === 'admin' && activeDashboardView === 'viewUsersOnly' && (
            <div className="dashboard-card">
              <h3>All Users</h3>
              <form onSubmit={handleSearch} className="mb-3 d-flex gap-2">
                <input type="text" className="form-control" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users..." />
                <button className="btn btn-secondary">Search</button>
              </form>
              <table className="table table-striped">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Manage Users (Admin CRUD) */}
          {user.role === 'admin' && activeDashboardView === 'manageUsers' && (
            <div className="dashboard-card">
              <h3>Manage Users</h3>
              <button className="btn btn-success mb-3" onClick={() => {
                setCreatingUser(true);
                setEditingUser(null);
                setForm({ name: '', email: '', password: '', role: 'user' });
              }}>Create New User</button>

              {creatingUser && (
                <form onSubmit={handleCreateUser}>
                  <input type="text" className="form-control mb-2" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  <input type="email" className="form-control mb-2" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  <input type="password" className="form-control mb-2" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <select className="form-control mb-2" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button className="btn btn-primary">Create</button>
                </form>
              )}

              {editingUser && (
                <form onSubmit={handleAdminUserUpdate}>
                  <h5>Editing: {editingUser.name}</h5>
                  <input type="text" className="form-control mb-2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  <input type="email" className="form-control mb-2" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  <select className="form-control mb-2" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button className="btn btn-primary">Save</button>
                </form>
              )}

              {users.map(u => (
                <div key={u.id} className="border p-2 mb-2">
                  <strong>{u.name}</strong> — {u.email} ({u.role})
                  <div className="float-end">
                    <button className="btn btn-sm btn-secondary me-2" onClick={() => {
                      setEditingUser(u);
                      setCreatingUser(false);
                      setForm({ name: u.name, email: u.email, password: '', role: u.role });
                    }}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
