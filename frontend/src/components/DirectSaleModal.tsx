import React, { useState } from 'react';
import { FaCar, FaUser, FaCreditCard, FaFileInvoice } from 'react-icons/fa';
import { createSale, CreateSaleData } from '../services/salesService';
import authService from '../services/authService';

interface DirectSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: string;
  carPrice: number;
  carBrand: string;
  carModel: string;
  carYear: number;
  onSaleCreated: () => void;
}

const DirectSaleModal: React.FC<DirectSaleModalProps> = ({
  isOpen,
  onClose,
  carId,
  carPrice,
  carBrand,
  carModel,
  carYear,
  onSaleCreated,
}) => {
  const [saleType, setSaleType] = useState<'full' | 'leasing'>('full');
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [saleDetails, setSaleDetails] = useState({
    totalAmount: carPrice,
    downPayment: 0,
    monthlyPayment: 0,
    leaseTerm: 60,
    interestRate: 5.5,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentUser = authService.getCurrentUser();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('buyer.')) {
      const field = name.split('.')[1];
      setBuyerInfo(prev => ({ ...prev, [field]: value }));
    } else {
      setSaleDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as 'full' | 'leasing';
    setSaleType(type);
    
    if (type === 'full') {
      setSaleDetails(prev => ({
        ...prev,
        totalAmount: carPrice,
        downPayment: 0,
        monthlyPayment: 0,
      }));
    } else {
      // Calculate leasing payments
      const downPayment = carPrice * 0.2; // 20% down payment
      const remainingAmount = carPrice - downPayment;
      const monthlyPayment = (remainingAmount * (1 + 0.055 * 5)) / 60; // 5 years, 5.5% interest
      
      setSaleDetails(prev => ({
        ...prev,
        totalAmount: carPrice,
        downPayment,
        monthlyPayment: Math.round(monthlyPayment),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Не сте влезли в профила си.');
      }

      // Validate required fields
      if (!buyerInfo.name || !buyerInfo.email) {
        throw new Error('Името и имейлът на купувача са задължителни.');
      }

      if (saleType === 'leasing' && (!saleDetails.downPayment || !saleDetails.monthlyPayment)) {
        throw new Error('За лизинг са необходими първоначална вноска и месечна вноска.');
      }

      // Create sale data
      const saleData: CreateSaleData = {
        carId,
        buyerId: currentUser?.id || '', // This should be the actual buyer ID
        saleType,
        totalAmount: saleDetails.totalAmount,
        notes: saleDetails.notes,
      };

      // Add leasing details if applicable
      if (saleType === 'leasing') {
        saleData.downPayment = saleDetails.downPayment;
        saleData.monthlyPayment = saleDetails.monthlyPayment;
        saleData.leaseTerm = saleDetails.leaseTerm;
        saleData.interestRate = saleDetails.interestRate;
      }

      const result = await createSale(saleData, token);
      
      setSuccess('Продажбата е създадена успешно!');
      
      // Close modal after a short delay
      setTimeout(() => {
        onSaleCreated();
        onClose();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Грешка при създаване на продажбата.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaCar className="text-primary-500" />
              Директна продажба
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              &times;
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            {carBrand} {carModel} ({carYear}) - ${carPrice.toLocaleString()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Sale Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип на продажбата
            </label>
            <select
              value={saleType}
              onChange={handleSaleTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="full">Пълна покупка</option>
              <option value="leasing">Лизинг</option>
            </select>
          </div>

          {/* Buyer Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaUser className="text-primary-500" />
              Информация за купувача
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Име *
                </label>
                <input
                  type="text"
                  name="buyer.name"
                  value={buyerInfo.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имейл *
                </label>
                <input
                  type="email"
                  name="buyer.email"
                  value={buyerInfo.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <input
                  type="tel"
                  name="buyer.phone"
                  value={buyerInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Адрес
                </label>
                <input
                  type="text"
                  name="buyer.address"
                  value={buyerInfo.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Sale Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCreditCard className="text-primary-500" />
              Детайли на продажбата
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Обща сума ($)
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  value={saleDetails.totalAmount}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {saleType === 'leasing' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Първоначална вноска ($)
                    </label>
                    <input
                      type="number"
                      name="downPayment"
                      value={saleDetails.downPayment}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Месечна вноска ($)
                    </label>
                    <input
                      type="number"
                      name="monthlyPayment"
                      value={saleDetails.monthlyPayment}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Срок на лизинга (месеци)
                    </label>
                    <input
                      type="number"
                      name="leaseTerm"
                      value={saleDetails.leaseTerm}
                      onChange={handleInputChange}
                      min="12"
                      max="120"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Лихвен процент (%)
                    </label>
                    <input
                      type="number"
                      name="interestRate"
                      value={saleDetails.interestRate}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Бележки
              </label>
              <textarea
                name="notes"
                value={saleDetails.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Допълнителна информация за продажбата..."
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-primary-900 mb-2 flex items-center gap-2">
              <FaFileInvoice className="text-primary-600" />
              Обобщение
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Автомобил:</span>
                <span className="font-medium">{carBrand} {carModel} ({carYear})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Тип продажба:</span>
                <span className="font-medium">
                  {saleType === 'full' ? 'Пълна покупка' : 'Лизинг'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Обща сума:</span>
                <span className="font-medium">${saleDetails.totalAmount.toLocaleString()}</span>
              </div>
              {saleType === 'leasing' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Първоначална вноска:</span>
                    <span className="font-medium">${saleDetails.downPayment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Месечна вноска:</span>
                    <span className="font-medium">${saleDetails.monthlyPayment.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Обработване...
                </>
              ) : (
                <>
                  <FaFileInvoice />
                  Създай продажба
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DirectSaleModal; 