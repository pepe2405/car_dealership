import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import authService from "../../services/authService";
import {
  FaCar,
  FaUser,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaUserCircle,
  FaTachometerAlt,
  FaPlusCircle,
  FaUsers,
  FaClipboardList,
  FaInfoCircle,
  FaBars,
  FaComments,
  FaHeart,
  FaCheckCircle,
  FaCreditCard,
  FaMoneyBillWave,
} from "react-icons/fa";

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, onLogout }) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isSeller =
    currentUser?.role === "seller" || currentUser?.role === "admin";
  const isOnlySeller = currentUser?.role === "seller";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ left: number; top: number } | null>(
    null,
  );

  useEffect(() => {
    if (menuOpen && menuBtnRef.current) {
      const rect = menuBtnRef.current.getBoundingClientRect();
      setMenuPos({ left: rect.left, top: rect.bottom });
    }
  }, [menuOpen]);

  const handleLogout = () => {
    authService.logout();
    onLogout();
    navigate("/");
  };

  return (
    <nav className="w-full sticky top-0 z-50 bg-primary-900 shadow-2xl backdrop-blur-md">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3 relative">
          <Link to="/" className="flex items-center gap-2">
            <FaCar className="text-3xl text-primary-200 drop-shadow" />
            <span className="text-2xl font-extrabold text-white tracking-wide">
              AutoMarket
            </span>
          </Link>
          <button
            ref={menuBtnRef}
            className="ml-4 flex items-center gap-2 px-3 py-1 rounded-full border border-primary-700 bg-primary-700 text-white font-bold text-sm shadow hover:bg-primary-900 hover:text-yellow-300 transition-all focus:outline-none"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <FaBars className="text-lg" /> Меню
          </button>
          {menuOpen && menuPos && (
            <div
              className="fixed z-50 min-w-[180px] bg-white rounded-2xl shadow-2xl border border-primary-100 py-2 flex flex-col gap-1 animate-fade-in"
              style={{ left: menuPos.left, top: menuPos.top + 4 }}
            >
              <Link
                to="/cars"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-primary-900 hover:bg-primary-100 transition-all"
              >
                <FaClipboardList className="text-base" /> Обяви
              </Link>
              <Link
                to="/leasing"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-primary-900 hover:bg-primary-100 transition-all"
              >
                <FaCreditCard className="text-base" /> Лизинг
              </Link>
              {isOnlySeller && (
                <Link
                  to="/sell"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-primary-900 hover:bg-primary-100 transition-all"
                >
                  <FaPlusCircle className="text-base" /> Публикувай
                </Link>
              )}
              {isSeller && (
                <Link
                  to="/test-drives"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-primary-900 hover:bg-primary-100 transition-all"
                >
                  <FaCheckCircle className="text-base text-green-600" /> Тест
                  драйв заявки
                </Link>
              )}
              {isOnlySeller && (
                <Link
                  to="/owner/deposits"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-primary-900 hover:bg-primary-100 transition-all"
                >
                  <FaMoneyBillWave className="text-base text-blue-600" />{" "}
                  Депозити за моите коли
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to="/messages"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-primary-900 hover:bg-primary-100 transition-all"
                >
                  <FaComments className="text-base" /> Съобщения
                </Link>
              )}
              {isAuthenticated && currentUser?.role === "buyer" && (
                <Link
                  to="/favorites"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-primary-900 hover:bg-primary-100 transition-all"
                >
                  <FaHeart className="text-base text-red-500" /> Любими
                </Link>
              )}
              {isAuthenticated && currentUser?.role === "buyer" && (
                <Link
                  to="/deposits"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-primary-900 hover:bg-primary-100 transition-all"
                >
                  <FaMoneyBillWave className="text-base text-green-600" />{" "}
                  Депозити
                </Link>
              )}
              {currentUser?.role === "admin" && (
                <Link
                  to="/admin/users"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-primary-900 hover:bg-primary-100 transition-all"
                >
                  <FaUsers className="text-base" /> Потребители
                </Link>
              )}
              {currentUser?.role === "admin" && (
                <Link
                  to="/admin/cars"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-primary-900 hover:bg-primary-100 transition-all"
                >
                  <FaCar className="text-base" /> Админ коли
                </Link>
              )}
              {isSeller && (
                <Link
                  to="/admin/cars-view"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-primary-900 hover:bg-primary-100 transition-all"
                >
                  <FaCar className="text-base" /> Всички коли
                </Link>
              )}
              {currentUser?.role === "admin" && (
                <Link
                  to="/admin/deposits"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-primary-900 hover:bg-primary-100 transition-all"
                >
                  <FaMoneyBillWave className="text-base" /> Админ депозити
                </Link>
              )}
              <Link
                to="/about"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-primary-900 hover:bg-primary-100 transition-all"
              >
                <FaInfoCircle className="text-base" /> За нас
              </Link>
              <Link
                to="/forums"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-primary-900 hover:bg-primary-100 transition-all"
              >
                <FaComments className="text-base" /> Форуми
              </Link>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-primary-700 bg-primary-800 text-yellow-300 font-bold shadow hover:bg-yellow-400 hover:text-primary-900 hover:border-yellow-400 transition-all"
              >
                <FaUserCircle className="text-lg" /> Профил
              </Link>
              {isSeller && (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-yellow-400 bg-yellow-400 text-primary-900 font-bold shadow hover:bg-primary-700 hover:text-white hover:border-primary-700 transition-all"
                >
                  <FaTachometerAlt className="text-lg" /> Табло
                </Link>
              )}
              <Link
                to="/messages"
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-primary-700 bg-primary-700 text-white font-bold shadow hover:bg-primary-900 hover:text-yellow-300 transition-all"
              >
                <FaComments className="text-lg" /> Съобщения
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-red-600 bg-red-600 text-white font-bold shadow hover:bg-white hover:text-red-600 hover:border-white transition-all"
              >
                <FaSignOutAlt className="text-lg" /> Изход
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-primary-700 bg-primary-800 text-yellow-300 font-bold shadow hover:bg-yellow-400 hover:text-primary-900 hover:border-yellow-400 transition-all"
              >
                <FaSignInAlt className="text-lg" /> Вход
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-yellow-400 bg-yellow-400 text-primary-900 font-bold shadow hover:bg-primary-700 hover:text-white hover:border-primary-700 transition-all"
              >
                <FaUserPlus className="text-lg" /> Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
