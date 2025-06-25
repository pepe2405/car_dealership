import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { FaCar, FaSearch, FaMoneyCheckAlt, FaUserCheck, FaQuoteLeft, FaStar } from 'react-icons/fa';

const Home = () => {
  const currentUser = authService.getCurrentUser();
  const isSeller = currentUser?.role === 'seller' || currentUser?.role === 'admin';

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 to-purple-100 relative overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] flex items-center justify-center bg-gradient-to-br from-primary-800 via-primary-600 to-yellow-400 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-700/60 to-yellow-400/60" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-3xl mx-auto text-center gap-6">
          <FaCar className="text-7xl text-yellow-300 drop-shadow-xl animate-bounce" />
          <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-white to-primary-200 drop-shadow-2xl">AutoMarket</h1>
          <p className="text-2xl md:text-3xl text-white font-semibold drop-shadow-lg">Твоят нов автомобил е на един клик разстояние</p>
          <div className="w-full flex justify-center mt-6">
            <Link to="/cars" className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-yellow-400 text-primary-900 font-bold text-xl shadow-xl hover:bg-yellow-300 transition-all">
              <FaSearch /> Търси
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="w-full py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-primary-700 text-center mb-10">Как работи?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-md hover:shadow-xl transition-all border-2 border-yellow-100">
              <FaSearch className="text-4xl text-primary-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Търси</h3>
              <p className="text-gray-600">Открий и филтрирай хиляди обяви за секунди.</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-md hover:shadow-xl transition-all border-2 border-yellow-100">
              <FaUserCheck className="text-4xl text-primary-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Свържи се</h3>
              <p className="text-gray-600">Пиши директно на продавача и уговори оглед.</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-md hover:shadow-xl transition-all border-2 border-yellow-100">
              <FaMoneyCheckAlt className="text-4xl text-primary-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Купи или продай</h3>
              <p className="text-gray-600">Сделката е лесна, сигурна и бърза през AutoMarket.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 bg-gradient-to-r from-primary-900 via-primary-700 to-yellow-400 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 text-2xl font-bold">
            <FaCar className="text-3xl" /> AutoMarket
          </div>
          <div className="text-lg">&copy; {new Date().getFullYear()} AutoMarket. Всички права запазени.</div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 