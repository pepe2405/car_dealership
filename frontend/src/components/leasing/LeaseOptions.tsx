import { useEffect, useState } from 'react';
import { getLeaseOptions, LeaseOption } from '../../services/leaseService';

const LeaseOptions: React.FC = () => {
  const [leaseOptions, setLeaseOptions] = useState<LeaseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        {error}
      </div>
    );
  }

  if (leaseOptions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Няма налични опции за лизинг в момента.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {leaseOptions.map((option) => (
        <div
          key={option._id}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-primary-800 mb-2">
              {option.name}
            </h3>
            <div className="text-3xl font-bold text-primary-600">
              {option.duration} месеца
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Първоначална вноска:</span>
              <span className="font-semibold">{option.downPayment}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Лихвен процент:</span>
              <span className="font-semibold">{option.interestRate}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Продължителност:</span>
              <span className="font-semibold text-lg">
                {option.duration} месеца
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500 text-center">
              * Цените са приблизителни и могат да се променят
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaseOptions; 