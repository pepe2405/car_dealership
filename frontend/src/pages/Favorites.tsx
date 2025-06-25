import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchFavorites, removeFavorite, Car } from '../services/carService';
import authService from '../services/authService';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const Favorites = () => {
  const [favorites, setFavorites] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = authService.getToken();

  useEffect(() => {
    if (!token) {
      setError('Трябва да сте влезли, за да виждате любими коли.');
      setLoading(false);
      return;
    }
    fetchFavorites(token)
      .then(setFavorites)
      .catch(() => setError('Грешка при зареждане на любимите коли.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleRemove = async (carId: string) => {
    if (!token) return;
    try {
      await removeFavorite(carId, token);
      setFavorites(favorites.filter(car => car._id !== carId));
    } catch {
      setError('Грешка при премахване от любими.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-primary-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary-800 mb-8 flex items-center gap-2"><FaHeart className="text-red-500" /> Любими коли</h1>
        {favorites.length === 0 ? (
          <div className="text-center text-primary-700 text-xl">Нямате добавени любими коли.</div>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map(car => (
              <div key={car._id} className="card group hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl overflow-hidden border border-primary-100 animate-fade-in relative">
                <div className="relative h-56 overflow-hidden rounded-t-2xl">
                  <img
                    src={car.images[0] || 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={car.brand + ' ' + car.carModel}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 z-10">
                    <button onClick={() => handleRemove(car._id)} className="focus:outline-none">
                      <FaHeart className="text-red-500 text-2xl drop-shadow animate-pulse" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-primary-700">{car.brand} {car.carModel}</h3>
                  <p className="mt-2 text-gray-600">{car.year} • {car.fuelType} • {car.transmission}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-600">${car.price.toLocaleString()}</span>
                    <Link to={`/cars/${car._id}`} className="btn-primary text-sm rounded-xl px-4 py-2">Виж</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites; 