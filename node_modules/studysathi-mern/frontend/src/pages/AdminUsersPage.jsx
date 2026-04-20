import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const adminEmails = ['studysathi@gmail.com', 'admin@studysathi.com'];

function AdminUsersPage({ user }) {
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState('Loading registered users...');
  const navigate = useNavigate();

  const hasAdminEmail = useMemo(
    () => adminEmails.includes((user?.email || '').toLowerCase()),
    [user?.email]
  );
  const isAdmin = useMemo(() => Boolean(user?.isAdmin || hasAdminEmail), [user?.isAdmin, hasAdminEmail]);

  const filteredUsers = useMemo(() => {
    const query = userSearchTerm.trim().toLowerCase();
    if (!query) return users;

    return users.filter((account) =>
      [account.name, account.email].some((value) => value?.toLowerCase().includes(query))
    );
  }, [users, userSearchTerm]);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/auth/users');

        if (!isMounted) {
          return;
        }

        setUsers(Array.isArray(data) ? data : []);
        setStatusMessage('');
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setUsers([]);
        setStatusMessage(error.response?.data?.message || 'Unable to load registered users right now.');
      }
    };

    if (user && isAdmin) {
      fetchUsers();
    }

    return () => {
      isMounted = false;
    };
  }, [isAdmin, user]);

  return (
    <main className="section admin-page" id="admin-users">
      <div className="container">
        {!user ? (
          <div className="admin-locked-box">
            <p className="danger admin-alert">Login first to view registered users.</p>
            <div className="note-actions">
              <button className="btn" type="button" onClick={() => navigate('/login')}>
                Login as Admin
              </button>
            </div>
          </div>
        ) : null}

        {user && !isAdmin ? (
          <div className="admin-locked-box">
            <p className="danger admin-alert">This account does not have admin access for registered users.</p>
            <div className="note-actions">
              <button className="btn secondary" type="button" onClick={() => navigate('/admin')}>
                Back to Admin
              </button>
            </div>
          </div>
        ) : null}

        {user && isAdmin ? (
          <div className="panel admin-notes-panel">
            <div className="top-row">
              <div>
                <span className="tag">Admin Workspace</span>
                <h2 style={{ textAlign: 'left', marginTop: '10px' }}>Registered Users</h2>
                <p className="muted">All signed up users appear here with name, email, role, and joined date.</p>
              </div>
              <div className="note-actions" style={{ marginTop: 0 }}>
                <Link className="btn secondary" to="/admin">Back to Admin</Link>
              </div>
            </div>

            <div className="admin-search-row">
              <input
                type="text"
                placeholder="Search users by name or email"
                value={userSearchTerm}
                onChange={(event) => setUserSearchTerm(event.target.value)}
              />
              <span className="tag">{filteredUsers.length} users</span>
            </div>

            {statusMessage ? <p className="muted" style={{ marginBottom: '16px' }}>{statusMessage}</p> : null}

            <div className="admin-users-list">
              {filteredUsers.length ? (
                <>
                  <div className="admin-user-row admin-user-row-head">
                    <span>Name</span>
                    <span>Email ID</span>
                    <span>Role</span>
                    <span>Joined</span>
                  </div>
                  {filteredUsers.map((account) => (
                    <div key={account._id || account.email} className="admin-user-row">
                      <strong>{account.name || 'Unnamed User'}</strong>
                      <span className="admin-user-email">{account.email}</span>
                      <span>{account.isAdmin ? 'Admin' : 'Member'}</span>
                      <span>{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="card">
                  <h3>No matching users</h3>
                  <p className="muted">Users will appear here after signup, or change the search text.</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default AdminUsersPage;
