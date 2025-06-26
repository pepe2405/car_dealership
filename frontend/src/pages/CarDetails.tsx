import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Car, fetchCarById } from '../services/carService';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import authService from '../services/authService';
import { addFavorite, removeFavorite, fetchFavorites } from '../services/carService';
import { createTestDriveRequest, getTestDriveRequestForCar, deleteTestDriveRequest } from '../services/testDriveService';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favError, setFavError] = useState('');
  const currentUser = authService.getCurrentUser();
  const [showTestDriveModal, setShowTestDriveModal] = useState(false);
  const [testDriveDate, setTestDriveDate] = useState('');
  const [testDriveMsg, setTestDriveMsg] = useState('');
  const [testDriveError, setTestDriveError] = useState('');
  const [testDriveSuccess, setTestDriveSuccess] = useState('');
  const [myTestDrive, setMyTestDrive] = useState<any>(null);

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) {
        setError('Invalid car ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const data = await fetchCarById(id);
        setCar(data);
        setMainImageIdx(0);
      } catch (err: any) {
        console.error('Error fetching car details:', err);
        setError(
          err.response?.data?.message || 
          'Failed to load car details. Please try again later.'
        );
        // Redirect to cars page if car not found
        if (err.response?.status === 404) {
          navigate('/cars');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id, navigate]);

  useEffect(() => {
    const token = authService.getToken();
    if (currentUser && token) {
      fetchFavorites(token)
        .then(favs => setFavorites(favs.map(car => car._id)))
        .catch(() => setFavorites([]));
    } else {
      setFavorites([]);
    }
  }, [authService.getToken()]);

  useEffect(() => {
    const fetchMyTestDrive = async () => {
      if (!car || !currentUser) return;
      const token = authService.getToken();
      if (!token) return;
      const req = await getTestDriveRequestForCar(car._id, token);
      setMyTestDrive(req);
    };
    fetchMyTestDrive();
  }, [car, currentUser]);

  const handleFavorite = async (carId: string) => {
    if (!currentUser) {
      setFavError('Трябва да сте влезли, за да добавите в любими.');
      return;
    }
    try {
      const token = authService.getToken();
      if (!token) {
        setFavError('Трябва да сте влезли, за да добавите в любими.');
        return;
      }
      if (favorites.includes(carId)) {
        await removeFavorite(carId, token);
        setFavorites(favorites.filter(id => id !== carId));
      } else {
        await addFavorite(carId, token);
        setFavorites([...favorites, carId]);
      }
      setFavError('');
    } catch (e) {
      setFavError('Грешка при добавяне/премахване от любими.');
    }
  };

  const handleTestDriveRequest = async () => {
    setTestDriveError(''); setTestDriveSuccess('');
    const token = authService.getToken();
    if (!token) { setTestDriveError('Трябва да сте влезли.'); return; }
    if (!testDriveDate) { setTestDriveError('Изберете дата и час.'); return; }
    try {
      const newReq = await createTestDriveRequest({ car: car!._id, date: testDriveDate, message: testDriveMsg }, token);
      setMyTestDrive(newReq);
      setTestDriveSuccess('Заявката е изпратена!');
      setShowTestDriveModal(false);
    } catch (e) {
      setTestDriveError('Грешка при заявката.');
    }
  };

  const handleCancelTestDrive = async () => {
    if (!myTestDrive) return;
    const token = authService.getToken();
    if (!token) return;
    try {
      await deleteTestDriveRequest(myTestDrive._id, token);
      setMyTestDrive(null);
    } catch (e) {
      setTestDriveError('Грешка при отказ на заявката.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
          <div className="mt-4">
            <Link to="/cars" className="text-primary-600 hover:text-primary-700">
              &larr; Back to Cars
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center text-gray-600">
            <p className="text-lg">Car not found.</p>
            <Link to="/cars" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
              &larr; Back to Cars
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = car.images && car.images.length > 0 ? car.images : ['https://via.placeholder.com/400x200?text=No+Image'];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link to="/cars" className="text-primary-600 hover:text-primary-700">&larr; Back to Cars</Link>
        <div className="bg-white rounded-lg shadow-md p-6 mt-4">
          {/* Image Gallery */}
          <div className="mb-6 relative">
            {car && (
              <div className="absolute top-4 right-4 z-10">
                <button onClick={() => handleFavorite(car._id)} className="focus:outline-none">
                  {favorites.includes(car._id) ? (
                    <FaHeart className="text-red-500 text-3xl drop-shadow animate-pulse" />
                  ) : (
                    <FaRegHeart className="text-gray-300 text-3xl hover:text-red-400 transition-colors" />
                  )}
                </button>
              </div>
            )}
            <img
              src={images[mainImageIdx]}
              alt={car.brand + ' ' + car.carModel}
              className="w-full h-80 object-cover rounded-lg mb-4 transition-all duration-200"
            />
            {images.length > 1 && (
              <div className="flex gap-2 justify-center mt-2 flex-wrap">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMainImageIdx(idx)}
                    className={`border-2 rounded-lg w-20 h-20 p-0 overflow-hidden focus:outline-none transition-all duration-150 ${
                      mainImageIdx === idx ? 'border-primary-500' : 'border-gray-200'
                    }`}
                    style={{ background: '#f9fafb' }}
                  >
                    <img
                      src={img}
                      alt={`thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{car.brand} {car.carModel}</h1>
              <p className="text-2xl font-semibold text-primary-600 mt-2">${car.price.toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Year</p>
                <p className="font-medium">{car.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mileage</p>
                <p className="font-medium">{car.mileage.toLocaleString()} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fuel Type</p>
                <p className="font-medium capitalize">{car.fuelType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Transmission</p>
                <p className="font-medium capitalize">{car.transmission}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">{car.status}</p>
              </div>
              {car.location && (
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{car.location.city}, {car.location.state}</p>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{car.description}</p>
            </div>
            {car.features && car.features.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h2 className="text-lg font-semibold mb-2">Features</h2>
                <ul className="grid grid-cols-2 gap-2">
                  {car.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-semibold mb-2">Seller Information</h2>
              <p className="text-gray-700">
                {car.seller?.name || 'N/A'} ({car.seller?.email || 'N/A'})
              </p>
            </div>
          </div>
          {favError && <div className="text-red-600 text-center mb-4 animate-fade-in">{favError}</div>}
          {myTestDrive ? (
            <div className="mt-8 flex flex-col items-center justify-center gap-2">
              <div className={`px-4 py-2 rounded-xl text-lg font-bold shadow ${myTestDrive.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : myTestDrive.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                Заявка за тест драйв: {myTestDrive.status === 'pending' ? 'Изчаква' : myTestDrive.status === 'approved' ? 'Одобрена' : 'Отказана'}
              </div>
              <div className="text-gray-700">Дата: {new Date(myTestDrive.date).toLocaleString('bg')}</div>
              {myTestDrive.message && <div className="text-gray-600 italic">"{myTestDrive.message}"</div>}
              {myTestDrive.status === 'pending' && (
                <button
                  className="btn-secondary mt-4 px-6 py-2 rounded-xl text-base font-bold shadow hover:bg-red-200 transition-all"
                  onClick={handleCancelTestDrive}
                >
                  Откажи заявката
                </button>
              )}
              {(myTestDrive.status === 'approved' || myTestDrive.status === 'rejected') && (
                <button
                  className="btn-primary mt-4 px-6 py-2 rounded-xl text-base font-bold shadow hover:bg-primary-700 transition-all"
                  onClick={() => setShowTestDriveModal(true)}
                >
                  Нова заявка
                </button>
              )}
            </div>
          ) : (
            <div className="mt-8 flex justify-center">
              <button
                className="btn-primary px-8 py-3 rounded-xl text-lg font-bold shadow-lg hover:bg-primary-700 transition-all"
                onClick={() => setShowTestDriveModal(true)}
              >
                Заяви тест драйв
              </button>
            </div>
          )}
          {showTestDriveModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
                <button className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-700" onClick={() => setShowTestDriveModal(false)}>&times;</button>
                <h2 className="text-2xl font-bold mb-4 text-center">Заяви тест драйв</h2>
                {testDriveError && <div className="text-red-600 mb-2 text-center">{testDriveError}</div>}
                {testDriveSuccess && <div className="text-green-600 mb-2 text-center">{testDriveSuccess}</div>}
                <label className="block mb-2 font-medium">Дата и час</label>
                <input type="datetime-local" className="input w-full mb-4" value={testDriveDate} onChange={e => setTestDriveDate(e.target.value)} />
                <label className="block mb-2 font-medium">Съобщение (по избор)</label>
                <textarea className="input w-full mb-4" value={testDriveMsg} onChange={e => setTestDriveMsg(e.target.value)} />
                <button className="btn-primary w-full py-2 rounded-xl font-bold" onClick={handleTestDriveRequest}>Изпрати заявка</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarDetails; 