import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Car } from '../services/carService';
import axios from 'axios';

const CarDetails = () => {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mainImageIdx, setMainImageIdx] = useState(0);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/cars/${id}`);
        setCar(response.data);
        setMainImageIdx(0);
      } catch (err) {
        setError('Failed to load car details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  if (loading) return <div className="py-12 text-center">Loading...</div>;
  if (error) return <div className="py-12 text-center text-red-600">{error}</div>;
  if (!car) return <div className="py-12 text-center">Car not found.</div>;

  const images = car.images && car.images.length > 0 ? car.images : ['https://via.placeholder.com/400x200?text=No+Image'];

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4">
      <Link to="/cars" className="text-blue-600 hover:underline">&larr; Back to Cars</Link>
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        {/* Image Gallery */}
        <div className="mb-4">
          <img
            src={images[mainImageIdx]}
            alt={car.brand + ' ' + car.carModel}
            className="w-full h-60 object-cover rounded mb-2 transition-all duration-200"
          />
          {images.length > 1 && (
            <div className="flex gap-2 justify-center mt-2 flex-wrap">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMainImageIdx(idx)}
                  className={`border-2 rounded w-16 h-16 p-0 overflow-hidden focus:outline-none transition-all duration-150 ${mainImageIdx === idx ? 'border-blue-500' : 'border-gray-200'}`}
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
        <h1 className="text-2xl font-bold mb-2">{car.brand} {car.carModel}</h1>
        <p className="text-gray-600 mb-1">Year: {car.year}</p>
        <p className="text-gray-600 mb-1">Price: ${car.price.toLocaleString()}</p>
        <p className="text-gray-600 mb-1">Mileage: {car.mileage.toLocaleString()} km</p>
        <p className="text-gray-600 mb-1">Fuel: {car.fuelType}</p>
        <p className="text-gray-600 mb-1">Transmission: {car.transmission}</p>
        <p className="text-gray-600 mb-1">Status: {car.status}</p>
        {car.location && (
          <p className="text-gray-600 mb-1">Location: {car.location.city}, {car.location.state}, {car.location.country}</p>
        )}
        <p className="text-gray-500 text-sm mt-2">Seller: {car.seller?.name || 'N/A'} ({car.seller?.email || 'N/A'})</p>
        <p className="mt-4 text-gray-800">{car.description}</p>
        {car.features && car.features.length > 0 && (
          <div className="mt-4">
            <h2 className="font-semibold">Features:</h2>
            <ul className="list-disc list-inside">
              {car.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarDetails; 