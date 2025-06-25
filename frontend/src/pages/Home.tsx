import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { FaCar, FaSearch, FaMoneyCheckAlt, FaUserCheck, FaQuoteLeft, FaStar } from 'react-icons/fa';

const testimonials = [
  {
    name: 'Иван Петров',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    text: 'Намерих мечтаната си кола за 2 дни! Интерфейсът е супер лесен и красив.',
    rating: 5,
  },
  {
    name: 'Мария Георгиева',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: 'Продадох автомобила си за по-малко от седмица. Препоръчвам на всички!',
    rating: 5,
  },
  {
    name: 'Георги Стоянов',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
    text: 'Чатът с продавачите е много удобен, а дизайнът е уникален!',
    rating: 4,
  },
];

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
          <div className="w-full flex flex-col md:flex-row items-center gap-4 mt-6">
            <input type="text" placeholder="Търси марка, модел или ключова дума..." className="w-full md:flex-1 px-6 py-4 rounded-2xl text-lg shadow-lg focus:ring-4 focus:ring-yellow-300 outline-none" />
            <Link to="/cars" className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-yellow-400 text-primary-900 font-bold text-xl shadow-xl hover:bg-yellow-300 transition-all">
              <FaSearch /> Търси
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="w-full py-20 px-2 md:px-0">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold text-primary-800 mb-10 text-left pl-2">Топ оферти</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Example Featured Car Card */}
            <div className="relative group rounded-3xl overflow-hidden shadow-2xl border-4 border-yellow-200 bg-white hover:scale-105 transition-transform">
              <img src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3" alt="Car" className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute top-4 left-4 bg-yellow-400 text-primary-900 px-4 py-2 rounded-full font-bold shadow-lg">Промо</div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-900/80 to-transparent p-6">
                <h3 className="text-2xl font-bold text-white">2023 Tesla Model S</h3>
                <p className="text-lg text-yellow-200 mt-2">Електрическа • Автоматик • 396 км пробег</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-yellow-400 drop-shadow">$89,990</span>
                  <button className="btn-primary text-lg rounded-xl px-6 py-2 bg-yellow-400 text-primary-900 font-bold shadow hover:bg-yellow-300">Виж</button>
                </div>
              </div>
            </div>
            {/* Add more featured car cards here */}
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