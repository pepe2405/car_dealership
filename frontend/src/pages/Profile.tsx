import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaUser, FaShoppingCart, FaFileInvoice, FaCalendarAlt, FaDollarSign, FaEdit, FaKey } from 'react-icons/fa';
import authService from '../services/authService';
import { fetchSales, Sale } from '../services/salesService';
import { fetchUserDeposits, Deposit } from '../services/depositsService';
import { getProfile, updateProfile, UserProfile } from '../services/userService';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Profile editing state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'sales' | 'deposits'>('profile');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      setError('Не сте влезли в профила си.');
      setLoading(false);
      return;
    }

    setUser(currentUser);
    loadUserData();
    loadProfileData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Не сте влезни в профила си.');
      }

      // Load sales and deposits in parallel
      const [salesData, depositsData] = await Promise.all([
        fetchSales(token).catch(() => []), // Catch error if user doesn't have access
        fetchUserDeposits(token).catch(() => [])
      ]);

      setSales(salesData);
      setDeposits(depositsData);
    } catch (err: any) {
      setError(err.message || 'Грешка при зареждане на данните.');
    } finally {
      setLoading(false);
    }
  };

  const loadProfileData = async () => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('Not authenticated');
      const data = await getProfile(token);
      setProfile(data);
      setForm({
        name: data.name,
        phone: data.phone || '',
        address: data.address || '',
      });
    } catch (err: any) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
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
      setSuccess('Профилът е обновен успешно!');
    } catch (err: any) {
      setError('Грешка при обновяване на профила');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Новите пароли не съвпадат');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = authService.getToken();
      if (!token) throw new Error('Not authenticated');
      await authService.changePassword(token, passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('Паролата е променена успешно!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError('Грешка при промяна на паролата');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Изчаква';
      case 'completed':
        return 'Завършена';
      case 'cancelled':
        return 'Отменена';
      default:
        return 'Неизвестен';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{error}</div>
            <Link to="/login" className="btn-primary">
              Влез в профила си
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-3">
                <FaUser className="text-2xl text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Профил</h1>
                <p className="text-primary-100 mt-1">
                  {user?.name} ({user?.email})
                </p>
                <p className="text-primary-200 text-sm mt-1">
                  Роля: {user?.role === 'admin' ? 'Администратор' : user?.role === 'seller' ? 'Продавач' : 'Купувач'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-full p-3">
                <FaShoppingCart className="text-2xl text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {user?.role === 'buyer' ? 'Общо покупки' : 'Общо продажби'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 rounded-full p-3">
                <FaFileInvoice className="text-2xl text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {user?.role === 'buyer' ? 'Завършени покупки' : 'Завършени продажби'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {sales.filter(sale => sale.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 rounded-full p-3">
                <FaCar className="text-2xl text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {user?.role === 'buyer' ? 'Моите депозити' : 'Депозити'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{deposits.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 rounded-full p-3">
                <FaUser className="text-2xl text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Профил</p>
                <p className="text-2xl font-bold text-gray-900">Активен</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaEdit className="inline mr-2" />
                Профил
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaKey className="inline mr-2" />
                Парола
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'sales'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaShoppingCart className="inline mr-2" />
                {user?.role === 'buyer' ? 'Покупки' : 'Продажби'}
              </button>
              <button
                onClick={() => setActiveTab('deposits')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'deposits'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaCar className="inline mr-2" />
                Депозити
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && profile && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Име</label>
                    <input
                      name="name"
                      value={form.name || ''}
                      onChange={handleChange}
                      required
                      className="mt-1 input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Имейл</label>
                    <input
                      name="email"
                      value={profile.email}
                      readOnly
                      className="mt-1 input bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Роля</label>
                    <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-300 text-gray-700">
                      {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Телефон</label>
                    <input
                      name="phone"
                      value={form.phone || ''}
                      onChange={handleChange}
                      className="mt-1 input"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Адрес</label>
                    <input
                      name="address"
                      value={form.address || ''}
                      onChange={handleChange}
                      className="mt-1 input"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? 'Запазване...' : 'Запази промените'}
                  </button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Текуща парола</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="mt-1 input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Нова парола</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={8}
                      className="mt-1 input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Потвърди нова парола</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={8}
                      className="mt-1 input"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? 'Промяна на парола...' : 'Промени парола'}
                  </button>
                </div>
              </form>
            )}

            {/* Sales Tab */}
            {activeTab === 'sales' && (
              <div>
                {sales.length === 0 ? (
                  <div className="text-center py-8">
                    <FaShoppingCart className="text-4xl text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {user?.role === 'buyer' ? 'Няма покупки' : 'Няма продажби'}
                    </h3>
                    <p className="text-gray-600">
                      {user?.role === 'buyer' 
                        ? 'Все още не сте направили покупки.' 
                        : 'Все още не сте направили продажби.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sales.map((sale) => (
                      <div key={sale._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={sale.carId.images?.[0] || 'https://via.placeholder.com/60x40?text=No+Image'}
                              alt={sale.carId.brand + ' ' + sale.carId.carModel}
                              className="w-15 h-10 object-cover rounded"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {sale.carId.brand} {sale.carId.carModel} ({sale.carId.year})
                              </h3>
                              <p className="text-sm text-gray-600">
                                {sale.saleType === 'full' ? 'Пълна покупка' : 'Лизинг'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-primary-600">
                              ${sale.totalAmount.toLocaleString()}
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                              {getStatusText(sale.status)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FaUser className="text-gray-400" />
                            <span>
                              {user?.role === 'buyer' 
                                ? `Продавач: ${sale.sellerId?.name || 'Н/А'}` 
                                : `Купувач: ${sale.buyerId.name}`
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaCalendarAlt className="text-gray-400" />
                            <span>Дата: {new Date(sale.saleDate).toLocaleDateString('bg')}</span>
                          </div>
                          {sale.saleType === 'leasing' && (
                            <>
                              <div className="flex items-center gap-1">
                                <FaDollarSign className="text-gray-400" />
                                <span>Вноска: ${sale.downPayment?.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FaDollarSign className="text-gray-400" />
                                <span>Месечно: ${sale.monthlyPayment?.toLocaleString()}</span>
                              </div>
                            </>
                          )}
                        </div>
                        
                        {sale.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 italic">"{sale.notes}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Deposits Tab */}
            {activeTab === 'deposits' && (
              <div>
                {deposits.length === 0 ? (
                  <div className="text-center py-8">
                    <FaCar className="text-4xl text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Няма депозити</h3>
                    <p className="text-gray-600">Все още не сте направили депозити.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deposits.map((deposit) => (
                      <div key={deposit._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={deposit.listingId.images?.[0] || 'https://via.placeholder.com/60x40?text=No+Image'}
                              alt={deposit.listingId.brand + ' ' + deposit.listingId.carModel}
                              className="w-15 h-10 object-cover rounded"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {deposit.listingId.brand} {deposit.listingId.carModel} ({deposit.listingId.year})
                              </h3>
                              <p className="text-sm text-gray-600">
                                Депозит: ${deposit.amount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                              {getStatusText(deposit.status)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FaCalendarAlt className="text-gray-400" />
                            <span>Дата: {new Date(deposit.createdAt).toLocaleDateString('bg')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaDollarSign className="text-gray-400" />
                            <span>Цена на колата: ${deposit.listingId.price.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {deposit.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 italic">"{deposit.notes}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 