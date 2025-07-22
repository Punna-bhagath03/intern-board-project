import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  username: string;
  email: string;
}

const AdminSendMail: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.filter((u: User) => u.email));
      } catch (err: any) {
        setError('Failed to fetch users');
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    // Validate all fields before sending
    if (!selectedUser || !subject.trim() || !message.trim()) {
      setError('All fields are required.');
      window.alert('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.post(
        '/api/admin/send-mail',
        {
          to: selectedUser,
          subject: subject.trim(),
          message: message.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('Email sent successfully!');
      window.alert('Email sent successfully!');
      setSubject('');
      setMessage('');
      setSelectedUser('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send email');
      window.alert(err.response?.data?.message || 'Failed to send email');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 py-8 px-4">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-700 flex flex-col gap-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-blue-300 mb-2">Send Email to User</h1>
        <p className="text-center text-gray-300 mb-4">Select a user, enter a subject and message, and send a custom email directly from the admin panel.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block mb-2 font-semibold text-blue-200">Select User</label>
            <select
              className="w-full border border-gray-700 bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              required
            >
              <option value="">-- Select a user --</option>
              {users.map(user => (
                <option key={user._id} value={user.email}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 font-semibold text-blue-200">Subject</label>
            <input
              type="text"
              className="w-full border border-gray-700 bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
              placeholder="Enter email subject"
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-blue-200">Message</label>
            <textarea
              className="w-full border border-gray-700 bg-gray-800 text-white rounded-lg px-3 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              placeholder="Type your message here..."
            />
          </div>
          {error && <div className="text-red-400 font-semibold text-center">{error}</div>}
          {success && <div className="text-green-400 font-semibold text-center">{success}</div>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 transition"
            disabled={
              loading ||
              !selectedUser ||
              !subject.trim() ||
              !message.trim()
            }
          >
            {loading ? 'Sending...' : 'Send Email'}
          </button>
        </form>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="mt-4 w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
};

export default AdminSendMail; 