import React, { useState, useEffect } from 'react';
import { fetchOwnerDeposits, approveDeposit, rejectDeposit, OwnerDeposit, UpdateDepositData } from '../services/ownerDepositsService';
import authService from '../services/authService';

const OwnerDeposits = () => {
  const [deposits, setDeposits] = useState<OwnerDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingDeposit, setUpdatingDeposit] = useState<string | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<OwnerDeposit | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const token = authService.getToken();

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOwnerDeposits(token!);
      setDeposits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при зареждане на депозитите');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (deposit: OwnerDeposit, action: 'approve' | 'reject') => {
    setSelectedDeposit(deposit);
    setActionType(action);
    setNotes('');
    setShowNotesModal(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedDeposit || !actionType) return;

    try {
      setUpdatingDeposit(selectedDeposit._id);
      const data: UpdateDepositData = {};
      if (notes.trim()) {
        data.notes = notes.trim();
      }

      if (actionType === 'approve') {
        await approveDeposit(selectedDeposit._id, data, token!);
      } else {
        await rejectDeposit(selectedDeposit._id, data, token!);
      }

      await loadDeposits(); // Reload to get updated data
      setShowNotesModal(false);
      setSelectedDeposit(null);
      setActionType(null);
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при обновяване на депозита');
    } finally {
      setUpdatingDeposit(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Чакащ';
      case 'approved': return 'Одобрен';
      case 'rejected': return 'Отхвърлен';
      case 'refunded': return 'Върнат';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Депозити за моите автомобили</h1>
          <p className="text-gray-600">Преглед и управление на всички депозити за вашите автомобили</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {deposits.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Няма депозити</h3>
            <p className="mt-1 text-sm text-gray-500">Все още няма депозити за вашите автомобили.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {deposits.map((deposit) => (
                <li key={deposit._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {deposit.listingId.images && deposit.listingId.images.length > 0 ? (
                                <img
                                  className="h-16 w-24 object-cover rounded-lg"
                                  src={deposit.listingId.images[0]}
                                  alt={`${deposit.listingId.brand} ${deposit.listingId.carModel}`}
                                />
                              ) : (
                                <div className="h-16 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {deposit.listingId.brand} {deposit.listingId.carModel} ({deposit.listingId.year})
                              </p>
                              <p className="text-sm text-gray-500">
                                Клиент: {deposit.userId.name} ({deposit.userId.email})
                              </p>
                              <p className="text-sm text-gray-500">
                                Сума: {deposit.amount.toLocaleString('bg-BG')} лв.
                              </p>
                              <p className="text-sm text-gray-500">
                                Дата: {formatDate(deposit.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                            {getStatusText(deposit.status)}
                          </span>
                          {deposit.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleActionClick(deposit, 'approve')}
                                disabled={updatingDeposit === deposit._id}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                              >
                                {updatingDeposit === deposit._id ? 'Обновяване...' : 'Одобри'}
                              </button>
                              <button
                                onClick={() => handleActionClick(deposit, 'reject')}
                                disabled={updatingDeposit === deposit._id}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                              >
                                {updatingDeposit === deposit._id ? 'Обновяване...' : 'Отхвърли'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {deposit.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Бележки:</span> {deposit.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes Modal */}
        {showNotesModal && selectedDeposit && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {actionType === 'approve' ? 'Одобри депозит' : 'Отхвърли депозит'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {actionType === 'approve' 
                    ? 'Одобрявате депозит за автомобил ' + selectedDeposit.listingId.brand + ' ' + selectedDeposit.listingId.carModel
                    : 'Отхвърляте депозит за автомобил ' + selectedDeposit.listingId.brand + ' ' + selectedDeposit.listingId.carModel
                  }
                </p>
                <div className="mb-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Бележки (по желание)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Добавете бележки за депозита..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowNotesModal(false);
                      setSelectedDeposit(null);
                      setActionType(null);
                      setNotes('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Отказ
                  </button>
                  <button
                    onClick={handleActionConfirm}
                    disabled={updatingDeposit === selectedDeposit._id}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                      actionType === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    } disabled:opacity-50`}
                  >
                    {updatingDeposit === selectedDeposit._id ? 'Обновяване...' : (actionType === 'approve' ? 'Одобри' : 'Отхвърли')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDeposits; 