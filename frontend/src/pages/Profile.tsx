import { useEffect, useState } from 'react';
import { getProfile, updateProfile, UserProfile } from '../services/userService';
import authService from '../services/authService';

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = authService.getToken();
        if (!token) throw new Error('Not authenticated');
        const data = await getProfile(token);
        setProfile(data);
        setForm({ name: data.name, phone: data.phone || '', address: data.address || '' });
      } catch (err: any) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = authService.getToken();
      if (!token) throw new Error('Not authenticated');
      const updated = await updateProfile(token, form);
      setProfile(updated);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-12 text-center">Loading...</div>;
  if (error) return <div className="py-12 text-center text-red-600">{error}</div>;
  if (!profile) return <div className="py-12 text-center">Profile not found.</div>;

  return (
    <div className="w-full max-w-lg mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      {success && <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4">{success}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input name="name" value={form.name || ''} onChange={handleChange} required className="input block w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input name="email" value={profile.email} readOnly className="input block w-full bg-gray-100 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input name="phone" value={form.phone || ''} onChange={handleChange} className="input block w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input name="address" value={form.address || ''} onChange={handleChange} className="input block w-full" />
        </div>
        <div>
          <button type="submit" disabled={saving} className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile; 