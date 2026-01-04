import { useState } from 'react';
import { createDeposit, CreateDepositData } from '../services/depositsService';
import authService from '../services/authService';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: string;
  carPrice: number;
  onDepositCreated: () => void;
}

const DepositModal = ({ isOpen, onClose, carId, carPrice, onDepositCreated }: DepositModalProps) => {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const token = authService.getToken();
    if (!token) {
      setError('Не сте влезли в профила си.');
      setLoading(false);
      return;
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError('Моля въведете валидна сума.');
      setLoading(false);
      return;
    }

    if (depositAmount > carPrice) {
      setError('Депозитът не може да бъде по-голям от цената на колата.');
      setLoading(false);
      return;
    }

    try {
      const depositData: CreateDepositData = {
        listingId: carId,
        amount: depositAmount,
        notes: notes.trim() || undefined,
      };

      await createDeposit(depositData, token);
      setSuccess('Депозитът е създаден успешно!');
      setAmount('');
      setNotes('');
      
     
      setTimeout(() => {
        onDepositCreated();
        onClose();
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating deposit:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Грешка при създаване на депозита. Моля опитайте отново.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount('');
      setNotes('');
      setError('');
      setSuccess('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Създаване на депозит</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Сума на депозита (лв.)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Въведете сума"
                min="0"
                max={carPrice}
                step="0.01"
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Максимална сума: {carPrice.toLocaleString('bg-BG')} лв.
              </p>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Бележки (по желание)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Допълнителна информация..."
                rows={3}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 resize-none"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Отказ
              </button>
              <button
                type="submit"
                disabled={loading || !amount.trim()}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Създаване...
                  </div>
                ) : (
                  'Създай депозит'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DepositModal; 