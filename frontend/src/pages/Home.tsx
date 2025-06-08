import { Link } from 'react-router-dom';
import authService from '../services/authService';

const Home = () => {
  const currentUser = authService.getCurrentUser();
  const isSeller = currentUser?.role === 'seller' || currentUser?.role === 'admin';

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-primary-900 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-200">
              Find Your Perfect Car
            </h1>
            <p className="mt-6 max-w-md mx-auto text-lg text-primary-100 sm:text-xl md:mt-8 md:max-w-3xl">
              Browse through thousands of cars from trusted sellers. Find your dream car today.
            </p>
            <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-10 space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/cars"
                className="btn-primary inline-flex items-center px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Browse Cars
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              {isSeller && (
                <Link
                  to="/sell"
                  className="btn-secondary inline-flex items-center px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Sell Your Car
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="w-full py-16 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-slide-up">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Featured Cars
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Check out our most popular listings
            </p>
          </div>

          {/* Featured Cars Grid */}
          <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Example Featured Car Card */}
            <div className="card group hover:shadow-xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden rounded-t-xl">
                <img
                  src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3"
                  alt="Car"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-500 text-white">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">2023 Tesla Model S</h3>
                <p className="mt-2 text-gray-600">Electric • Automatic • 396 mi range</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-600">$89,990</span>
                  <button className="btn-primary text-sm">View Details</button>
                </div>
              </div>
            </div>

            {/* Add more featured car cards here */}
          </div>

          {/* View All Button */}
          <div className="mt-12 text-center">
            <Link
              to="/cars"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors duration-200"
            >
              View All Cars
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 