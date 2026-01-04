import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllCars, Car } from '../services/carService';
import { FaCar, FaSearch, FaFilter, FaDollarSign, FaCalendarAlt, FaGasPump, FaCogs, FaEye } from 'react-icons/fa';
import authService from '../services/authService';

const AdminCarsView = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    fuelType: '',
    transmission: '',
    status: '',
    sortBy: 'newest',
  });

 
  const uniqueBrands = [...new Set(cars.map(car => car.brand))].sort();
  const uniqueModels = [...new Set(cars.map(car => car.carModel))].sort();
  const filteredModels = selectedBrand
    ? uniqueModels.filter(model => 
        cars.some(car => car.brand === selectedBrand && car.carModel === model)
      )
    : uniqueModels;

  useEffect(() => {
    const getCars = async () => {
      try {
        setLoading(true);
        const token = authService.getToken();
        if (!token) {
          setError('Не сте влезли в профила си.');
          return;
        }
        const data = await fetchAllCars(token);
        setCars(data);
        setFilteredCars(data);
      } catch (err) {
        setError('Failed to load cars.');
      } finally {
        setLoading(false);
      }
    };
    getCars();
  }, []);

  useEffect(() => {
    let result = [...cars];

   
    if (selectedBrand) {
      result = result.filter(car => car.brand === selectedBrand);
    }
    if (selectedModel) {
      result = result.filter(car => car.carModel === selectedModel);
    }

   
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        car =>
          car.description.toLowerCase().includes(searchLower) ||
          car.features.some(feature => feature.toLowerCase().includes(searchLower))
      );
    }

   
    if (filters.minPrice) {
      result = result.filter(car => car.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(car => car.price <= Number(filters.maxPrice));
    }
    if (filters.minYear) {
      result = result.filter(car => car.year >= Number(filters.minYear));
    }
    if (filters.maxYear) {
      result = result.filter(car => car.year <= Number(filters.maxYear));
    }
    if (filters.fuelType) {
      result = result.filter(car => car.fuelType === filters.fuelType);
    }
    if (filters.transmission) {
      result = result.filter(car => car.transmission === filters.transmission);
    }
    if (filters.status) {
      result = result.filter(car => car.status === filters.status);
    }

   
    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'year-desc':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'year-asc':
        result.sort((a, b) => a.year - b.year);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        break;
    }

    setFilteredCars(result);
  }, [cars, searchTerm, selectedBrand, selectedModel, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('');
    setSelectedModel('');
    setFilters({
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      fuelType: '',
      transmission: '',
      status: '',
      sortBy: 'newest',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Достъпна';
      case 'reserved': return 'Заета';
      case 'sold': return 'Продадена';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-primary-100">
      <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in flex items-center gap-4 mb-8">
          <FaCar className="text-4xl text-primary-500 drop-shadow" />
          <h1 className="text-4xl font-bold text-primary-700 mb-2">Всички автомобили</h1>
        </div>
        <p className="text-lg text-primary-700 mb-8">Преглед на всички автомобили в системата (включително заети)</p>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 animate-slide-up border border-primary-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Brand and Model Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary-700 flex items-center gap-2"><FaFilter className="text-primary-400" />Марка</label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedModel('');
                }}
                className="input rounded-xl border-primary-200 focus:border-primary-500"
              >
                <option value="">Всички марки</option>
                {uniqueBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary-700 flex items-center gap-2"><FaFilter className="text-primary-400" />Модел</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="input rounded-xl border-primary-200 focus:border-primary-500"
                disabled={!selectedBrand}
              >
                <option value="">Всички модели</option>
                {filteredModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary-700 flex items-center gap-2"><FaFilter className="text-primary-400" />Статус</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="input rounded-xl border-primary-200 focus:border-primary-500"
              >
                <option value="">Всички</option>
                <option value="available">Достъпна</option>
                <option value="reserved">Заета</option>
                <option value="sold">Продадена</option>
              </select>
            </div>

            {/* Additional Search */}
            <div className="lg:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-primary-700 flex items-center gap-2"><FaSearch className="text-primary-400" />Търсене в описание</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Търсете в описанието и характеристиките..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 rounded-xl border-primary-200 focus:border-primary-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-300" />
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary-700 flex items-center gap-2"><FaDollarSign className="text-primary-400" />Мин. цена (лв.)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400">лв.</span>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="input pl-8 rounded-xl border-primary-200 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary-700 flex items-center gap-2"><FaDollarSign className="text-primary-400" />Макс. цена (лв.)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400">лв.</span>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="input pl-8 rounded-xl border-primary-200 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Year Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary-700 flex items-center gap-2"><FaCalendarAlt className="text-primary-400" />Мин. година</label>
              <input
                type="number"
                name="minYear"
                value={filters.minYear}
                onChange={handleFilterChange}
                min="1900"
                max={new Date().getFullYear()}
                className="input rounded-xl border-primary-200 focus:border-primary-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary-700 flex items-center gap-2"><FaCalendarAlt className="text-primary-400" />Макс. година</label>
              <input
                type="number"
                name="maxYear"
                value={filters.maxYear}
                onChange={handleFilterChange}
                min="1900"
                max={new Date().getFullYear()}
                className="input rounded-xl border-primary-200 focus:border-primary-500"
              />
            </div>

            {/* Fuel Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary-700 flex items-center gap-2"><FaGasPump className="text-primary-400" />Гориво</label>
              <select
                name="fuelType"
                value={filters.fuelType}
                onChange={handleFilterChange}
                className="input rounded-xl border-primary-200 focus:border-primary-500"
              >
                <option value="">Всички</option>
                <option value="petrol">Бензин</option>
                <option value="diesel">Дизел</option>
                <option value="electric">Електрически</option>
                <option value="hybrid">Хибриден</option>
              </select>
            </div>

            {/* Transmission */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary-700 flex items-center gap-2"><FaCogs className="text-primary-400" />Скоростна кутия</label>
              <select
                name="transmission"
                value={filters.transmission}
                onChange={handleFilterChange}
                className="input rounded-xl border-primary-200 focus:border-primary-500"
              >
                <option value="">Всички</option>
                <option value="manual">Ръчна</option>
                <option value="automatic">Автоматична</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary-700 flex items-center gap-2"><FaFilter className="text-primary-400" />Сортиране</label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="input rounded-xl border-primary-200 focus:border-primary-500"
              >
                <option value="newest">Най-нови</option>
                <option value="price-asc">Цена: Ниска към висока</option>
                <option value="price-desc">Цена: Висока към ниска</option>
                <option value="year-desc">Година: Нова към стара</option>
                <option value="year-asc">Година: Стара към нова</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button
              className="btn-secondary px-6 py-2 rounded-xl text-primary-700 border border-primary-200 hover:bg-primary-100 transition-all"
              onClick={clearFilters}
              type="button"
            >
              Изчисти филтрите
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCars.length === 0 ? (
              <div className="col-span-full text-center text-primary-600 text-xl font-semibold py-12 animate-fade-in">
                Не са намерени автомобили според критериите.
              </div>
            ) : (
              filteredCars.map(car => (
                <div key={car._id} className="card relative group hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl overflow-hidden border border-primary-100 animate-fade-in">
                  <div className="relative h-56 overflow-hidden rounded-t-2xl">
                    <img
                      src={car.images[0] || 'https://via.placeholder.com/400x200?text=No+Image'}
                      alt={car.brand + ' ' + car.carModel}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-500 text-white shadow">
                        {car.brand}
                      </span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(car.status)}`}>
                        {getStatusText(car.status)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary-700">{car.brand} {car.carModel}</h3>
                    <p className="mt-2 text-gray-600">{car.year} • {car.fuelType} • {car.transmission}</p>
                    <p className="mt-1 text-sm text-gray-500">Продавач: {car.seller?.name || 'N/A'}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary-600">{car.price.toLocaleString('bg-BG')} лв.</span>
                      <Link to={`/cars/${car._id}`} className="btn-primary text-sm rounded-xl px-4 py-2 flex items-center gap-2">
                        <FaEye className="text-sm" /> Детайли
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCarsView; 