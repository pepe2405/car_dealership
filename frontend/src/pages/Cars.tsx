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
    <div className="w-full max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Browse Cars</h1>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Brand and Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedModel(''); // Reset model when brand changes
              }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Brands</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!selectedBrand}
            >
              <option value="">All Models</option>
              {filteredModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          {/* Additional Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Description & Features</label>
            <input
              type="text"
              placeholder="Search in description and features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price ($)</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price ($)</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Year Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Year</label>
            <input
              type="number"
              name="minYear"
              value={filters.minYear}
              onChange={handleFilterChange}
              min="1900"
              max={new Date().getFullYear()}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Year</label>
            <input
              type="number"
              name="maxYear"
              value={filters.maxYear}
              onChange={handleFilterChange}
              min="1900"
              max={new Date().getFullYear()}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
            <select
              name="fuelType"
              value={filters.fuelType}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
            <select
              name="transmission"
              value={filters.transmission}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="year-desc">Year: Newest First</option>
              <option value="year-asc">Year: Oldest First</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="lg:col-span-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-gray-600">
        Showing {filteredCars.length} of {cars.length} cars
      </div>

      {/* Car Listings */}
      {loading ? (
        <p>Loading cars...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : filteredCars.length === 0 ? (
        <p className="text-center text-gray-500">No cars found matching your criteria.</p>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCars.map(car => (
            <Link to={`/cars/${car._id}`} key={car._id} className="bg-white rounded-lg shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <img
                  src={car.images[0] || 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt={car.brand + ' ' + car.carModel}
                  className="w-full h-40 object-cover rounded"
                />
              </div>
              <h2 className="text-xl font-semibold mb-2">{car.brand} {car.carModel}</h2>
              <p className="text-gray-600 mb-1">Year: {car.year}</p>
              <p className="text-gray-600 mb-1">Price: ${car.price.toLocaleString()}</p>
              <p className="text-gray-600 mb-1">Mileage: {car.mileage.toLocaleString()} km</p>
              <p className="text-gray-600 mb-1">Fuel: {car.fuelType}</p>
              <p className="text-gray-600 mb-1">Transmission: {car.transmission}</p>
              <p className="text-gray-500 text-sm mt-2">Seller: {car.seller?.name || 'N/A'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cars; 