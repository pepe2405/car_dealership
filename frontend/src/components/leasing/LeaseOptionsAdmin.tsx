import { useState, useEffect } from 'react';
import { 
  getLeaseOptions, 
  createLeaseOption, 
  updateLeaseOption, 
  deleteLeaseOption, 
  LeaseOption 
} from '../../services/leaseService';
import authService from '../../services/authService';

const LeaseOptionsAdmin: React.FC = () => {
  const [leaseOptions, setLeaseOptions] = useState<LeaseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<LeaseOption | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    downPayment: '',
    interestRate: ''
  });
  const token = authService.getToken();

  useEffect(() => {
    fetchLeaseOptions();
  }, []);

  const fetchLeaseOptions = async () => {
    try {
      setLoading(true);
      const options = await getLeaseOptions();
      setLeaseOptions(options);
    } catch (err) {
      setError('Грешка при зареждане на опциите за лизинг.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Трябва да сте влезли в профила си.');
      return;
    }

    try {
      const newOption = await createLeaseOption({
        name: formData.name,
        duration: parseInt(formData.duration),
        downPayment: parseFloat(formData.downPayment),
        interestRate: parseFloat(formData.interestRate)
      }, token);

      setLeaseOptions([...leaseOptions, newOption]);
      setIsCreateModalOpen(false);
      setFormData({ name: '', duration: '', downPayment: '', interestRate: '' });
      setSuccess('Опцията за лизинг е създадена успешно!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Грешка при създаване на опцията.');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingOption) return;

    try {
      const updatedOption = await updateLeaseOption(editingOption._id, {
        name: formData.name,
        duration: parseInt(formData.duration),
        downPayment: parseFloat(formData.downPayment),
        interestRate: parseFloat(formData.interestRate)
      }, token);

      setLeaseOptions(leaseOptions.map(opt => opt._id === editingOption._id ? updatedOption : opt));
      setIsEditModalOpen(false);
      setEditingOption(null);
      setFormData({ name: '', duration: '', downPayment: '', interestRate: '' });
      setSuccess('Опцията за лизинг е обновена успешно!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Грешка при обновяване на опцията.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !window.confirm('Сигурни ли сте, че искате да изтриете тази опция?')) return;

    try {
      await deleteLeaseOption(id, token);
      setLeaseOptions(leaseOptions.filter(opt => opt._id !== id));
      setSuccess('Опцията за лизинг е изтрита успешно!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Грешка при изтриване на опцията.');
    }
  };

  const handleToggleActive = async (option: LeaseOption) => {
    if (!token) return;

    try {
      const updatedOption = await updateLeaseOption(option._id, {
        isActive: !option.isActive
      }, token);

      setLeaseOptions(leaseOptions.map(opt => opt._id === option._id ? updatedOption : opt));
      setSuccess(`Опцията е ${updatedOption.isActive ? 'активирана' : 'деактивирана'} успешно!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Грешка при промяна на статуса.');
    }
  };

  const openEditModal = (option: LeaseOption) => {
    setEditingOption(option);
    setFormData({
      name: option.name,
      duration: option.duration.toString(),
      downPayment: option.downPayment.toString(),
      interestRate: option.interestRate.toString()
    });
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    setFormData({ name: '', duration: '', downPayment: '', interestRate: '' });
    setIsCreateModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary-800">Управление на опции за лизинг</h2>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          + Добави нова опция
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Име
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Продължителност
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Първоначална вноска
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Лихвен %
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaseOptions.map((option) => (
              <tr key={option._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {option.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {option.duration} месеца
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {option.downPayment}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {option.interestRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    option.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {option.isActive ? 'Активна' : 'Неактивна'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => openEditModal(option)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Редактирай
                  </button>
                  <button
                    onClick={() => handleToggleActive(option)}
                    className={`${
                      option.isActive 
                        ? 'text-red-600 hover:text-red-900' 
                        : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {option.isActive ? 'Деактивирай' : 'Активирай'}
                  </button>
                  <button
                    onClick={() => handleDelete(option._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Изтрий
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Добави нова опция за лизинг</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Име</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Продължителност (месеци)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="1"
                  max="60"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Първоначална вноска (%)</label>
                <input
                  type="number"
                  value={formData.downPayment}
                  onChange={(e) => setFormData({...formData, downPayment: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Лихвен процент (%)</label>
                <input
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md"
                >
                  Създай
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-md"
                >
                  Отказ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingOption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Редактирай опция за лизинг</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Име</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Продължителност (месеци)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="1"
                  max="60"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Първоначална вноска (%)</label>
                <input
                  type="number"
                  value={formData.downPayment}
                  onChange={(e) => setFormData({...formData, downPayment: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Лихвен процент (%)</label>
                <input
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md"
                >
                  Запази
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-md"
                >
                  Отказ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaseOptionsAdmin; 