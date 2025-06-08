import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCars, Car } from '../services/carService';

const Cars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and filter states
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
    sortBy: 'newest',
  });

  // Get unique brands and models
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
        const data = await fetchCars();
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

    // Apply brand and model filters
    if (selectedBrand) {
      result = result.filter(car => car.brand === selectedBrand);
    }
    if (selectedModel) {
      result = result.filter(car => car.carModel === selectedModel);
    }

    // Apply text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        car =>
          car.description.toLowerCase().includes(searchLower) ||
          car.features.some(feature => feature.toLowerCase().includes(searchLower))
      );
    }

    // Apply other filters
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

    // Apply sorting
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
      sortBy: 'newest',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Cars</h1>
          <p className="text-lg text-gray-600 mb-8">Find your perfect match from our extensive collection</p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Brand and Model Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedModel('');
                }}
                className="input"
              >
                <option value="">All Brands</option>
                {uniqueBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="input"
                disabled={!selectedBrand}
              >
                <option value="">All Models</option>
                {filteredModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Additional Search */}
            <div className="lg:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">Search Description & Features</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search in description and features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Min Price ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="input pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Max Price ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="input pl-8"
                />
              </div>
            </div>

            {/* Year Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Min Year</label>
              <input
                type="number"
                name="minYear"
                value={filters.minYear}
                onChange={handleFilterChange}
                min="1900"
                max={new Date().getFullYear()}
                className="input"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Max Year</label>
              <input
                type="number"
                name="maxYear"
                value={filters.maxYear}
                onChange={handleFilterChange}
                min="1900"
                max={new Date().getFullYear()}
                className="input"
              />
            </div>

            {/* Fuel Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
              <select
                name="fuelType"
                value={filters.fuelType}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">All</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Transmission */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Transmission</label>
              <select
                name="transmission"
                value={filters.transmission}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">All</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Sort By</label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="year-desc">Year: Newest First</option>
                <option value="year-asc">Year: Oldest First</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.map(car => (
              <div key={car.id} className="card group hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 overflow-hidden rounded-t-xl">
                  <img
                    src={car.imageUrl}
                    alt={`${car.brand} ${car.carModel}`}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-500 text-white">
                      {car.year}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{car.brand} {car.carModel}</h3>
                  <p className="mt-2 text-gray-600">{car.fuelType} • {car.transmission}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-600">${car.price.toLocaleString()}</span>
                    <Link to={`/cars/${car._id}`} className="btn-primary text-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredCars.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No cars found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cars; 