import { useState, useEffect } from 'react';
import { getLeaseOptions, LeaseOption, calculateLease } from '../../services/leaseService';

const LeaseCalculator: React.FC = () => {
  const [leaseOptions, setLeaseOptions] = useState<LeaseOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<LeaseOption | null>(null);
  const [carPrice, setCarPrice] = useState<number>(0);
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaseOptions();
  }, []);

  useEffect(() => {
    if (selectedOption && carPrice > 0) {
      const result = calculateLease(carPrice, selectedOption);
      setCalculation(result);
    } else {
      setCalculation(null);
    }
  }, [selectedOption, carPrice]);

  const fetchLeaseOptions = async () => {
    try {
      setLoading(true);
      const options = await getLeaseOptions();
      setLeaseOptions(options);
      if (options.length > 0) {
        setSelectedOption(options[0]);
      }
    } catch (err) {
      console.error('Error fetching lease options:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCarPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCarPrice(value);
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const option = leaseOptions.find(opt => opt._id === e.target.value);
    setSelectedOption(option || null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-primary-800 mb-6">Калкулатор за лизинг</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input секция */}
        <div className="space-y-4">
          <div>
            <label htmlFor="carPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Цена на автомобила (лв.)
            </label>
            <input
              type="number"
              id="carPrice"
              value={carPrice || ''}
              onChange={handleCarPriceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Въведете цена на автомобила"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="leaseOption" className="block text-sm font-medium text-gray-700 mb-2">
              Опция за лизинг
            </label>
            <select
              id="leaseOption"
              value={selectedOption?._id || ''}
              onChange={handleOptionChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {leaseOptions.map((option) => (
                <option key={option._id} value={option._id}>
                  {option.name} - {option.duration} месеца
                </option>
              ))}
            </select>
          </div>

          {selectedOption && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Избрана опция:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Първоначална вноска: {selectedOption.downPayment}%</div>
                <div>Лихвен процент: {selectedOption.interestRate}%</div>
                <div>Продължителност: {selectedOption.duration} месеца</div>
              </div>
            </div>
          )}
        </div>

        {/* Резултати секция */}
        <div className="bg-primary-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-primary-800 mb-4">Резултат от изчислението</h3>

          {calculation ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Цена на автомобила:</span>
                <span className="font-semibold">{calculation.carPrice.toLocaleString('bg')} лв.</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Първоначална вноска:</span>
                <span className="font-semibold text-primary-600">
                  {calculation.downPaymentAmount.toLocaleString('bg')} лв.
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Финансирана сума:</span>
                <span className="font-semibold">
                  {calculation.financedAmount.toLocaleString('bg')} лв.
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Общо лихви:</span>
                <span className="font-semibold text-red-600">
                  {calculation.totalInterest.toLocaleString('bg')} лв.
                </span>
              </div>

              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between items-center text-lg font-bold text-primary-800">
                  <span>Месечна вноска:</span>
                  <span>{calculation.monthlyPayment.toLocaleString('bg')} лв.</span>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Общо плащания:</span>
                  <span>{calculation.totalPayments.toLocaleString('bg')} лв.</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <div className="text-sm text-yellow-800">
                  <strong>Важно:</strong> Това са приблизителни изчисления. За точни условия се свържете с нас.
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Въведете цена на автомобила, за да видите изчисленията.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaseCalculator; 