import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import authService from "../services/authService";
import {
  fetchCars,
  Car,
  fetchCarsUnauthenticated,
} from "../services/carService";
import {
  checkDepositStatus,
  DepositStatusResponse,
} from "../services/depositsService";
import {
  FaCar,
  FaSearch,
  FaMoneyCheckAlt,
  FaUserCheck,
  FaQuoteLeft,
  FaStar,
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import DepositModal from "../components/DepositModal";

const Home = () => {
  const currentUser = authService.getCurrentUser();
  const isSeller =
    currentUser?.role === "seller" || currentUser?.role === "admin";
  const isBuyer = currentUser?.role === "buyer";

  const [carsWithDeposits, setCarsWithDeposits] = useState<Car[]>([]);
  const [depositStatuses, setDepositStatuses] = useState<{
    [carId: string]: DepositStatusResponse;
  }>({});
  const [loading, setLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const isFetchingDeposits = useRef(false);

  useEffect(() => {
    const fetchCarsWithDeposits = async () => {
      if (!isBuyer || !currentUser) return;

      if (isFetchingDeposits.current) return;

      try {
        isFetchingDeposits.current = true;
        setLoading(true);
        const token = authService.getToken();
        if (!token) return;

        const allCars = await fetchCarsUnauthenticated();

        const carsWithDepositsData: Car[] = [];
        const depositStatusesData: { [carId: string]: DepositStatusResponse } =
          {};

        for (const car of allCars) {
          try {
            const status = await checkDepositStatus(car._id, token);
            if (status.hasDeposit) {
              carsWithDepositsData.push(car);
              depositStatusesData[car._id] = status;
            }
          } catch (err) {}
        }

        setCarsWithDeposits(carsWithDepositsData);
        setDepositStatuses(depositStatusesData);
      } catch (err) {
        console.error("Error fetching cars with deposits:", err);
      } finally {
        setLoading(false);
        isFetchingDeposits.current = false;
      }
    };

    fetchCarsWithDeposits();
  }, [isBuyer, currentUser?.id]);

  const handleNewDeposit = (car: Car) => {
    setSelectedCar(car);
    setShowDepositModal(true);
  };

  const handleDepositCreated = () => {
    if (selectedCar && currentUser) {
      const token = authService.getToken();
      if (token) {
        const existingCarIndex = carsWithDeposits.findIndex(
          (car) => car._id === selectedCar._id,
        );

        if (existingCarIndex === -1) {
          setCarsWithDeposits((prev) => [...prev, selectedCar]);
        }

        checkDepositStatus(selectedCar._id, token)
          .then((status) => {
            if (status.hasDeposit) {
              setDepositStatuses((prev) => ({
                ...prev,
                [selectedCar._id]: status,
              }));
            }
          })
          .catch((err) => {
            console.error("Error refreshing deposit status:", err);
          });
      }
    }

    setShowDepositModal(false);
    setSelectedCar(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <FaClock className="text-yellow-500" />;
      case "approved":
        return <FaCheckCircle className="text-green-500" />;
      case "rejected":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Изчаква";
      case "approved":
        return "Одобрен";
      case "rejected":
        return "Отхвърлен";
      default:
        return "Неизвестен";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 to-purple-100 relative overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] flex items-center justify-center bg-gradient-to-br from-primary-800 via-primary-600 to-yellow-400 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-700/60 to-yellow-400/60" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-3xl mx-auto text-center gap-6">
          <FaCar className="text-7xl text-yellow-300 drop-shadow-xl animate-bounce" />
          <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-white to-primary-200 drop-shadow-2xl">
            AutoMarket
          </h1>
          <p className="text-2xl md:text-3xl text-white font-semibold drop-shadow-lg">
            Твоят нов автомобил е на един клик разстояние
          </p>
          <div className="w-full flex justify-center mt-6">
            <Link
              to="/cars"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-yellow-400 text-primary-900 font-bold text-xl shadow-xl hover:bg-yellow-300 transition-all"
            >
              <FaSearch /> Търси
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="w-full py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-primary-700 text-center mb-10">
            Как работи?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-md hover:shadow-xl transition-all border-2 border-yellow-100">
              <FaSearch className="text-4xl text-primary-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Търси</h3>
              <p className="text-gray-600">
                Открий и филтрирай хиляди обяви за секунди.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-md hover:shadow-xl transition-all border-2 border-yellow-100">
              <FaUserCheck className="text-4xl text-primary-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Свържи се</h3>
              <p className="text-gray-600">
                Пиши директно на продавача и уговори оглед.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-md hover:shadow-xl transition-all border-2 border-yellow-100">
              <FaMoneyCheckAlt className="text-4xl text-primary-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Купи или продай</h3>
              <p className="text-gray-600">
                Сделката е лесна, сигурна и бърза през AutoMarket.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cars with Deposits Section - Only for buyers */}
      {isBuyer && (
        <section className="w-full py-20 bg-gradient-to-br from-yellow-50 to-orange-50">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <FaMoneyBillWave className="text-5xl text-primary-500 mx-auto mb-4" />
              <h2 className="text-3xl font-extrabold text-primary-700 mb-4">
                Моите депозити
              </h2>
              <p className="text-lg text-primary-600">
                Следете статуса на вашите депозити и направете нови
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : carsWithDeposits.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                  <FaMoneyBillWave className="text-4xl text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Нямате депозити
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Направете първия си депозит, за да запазите автомобил
                  </p>
                  <Link
                    to="/cars"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >
                    <FaSearch className="mr-2" />
                    Търси автомобили
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {carsWithDeposits.map((car) => {
                  const depositStatus = depositStatuses[car._id];
                  const deposit = depositStatus?.deposit;

                  return (
                    <div
                      key={car._id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-primary-100"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            car.images[0] ||
                            "https://via.placeholder.com/400x200?text=No+Image"
                          }
                          alt={car.brand + " " + car.carModel}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-500 text-white shadow">
                            {car.brand}
                          </span>
                        </div>
                        <div className="absolute top-4 right-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow ${getStatusColor(deposit?.status || "pending")}`}
                          >
                            {getStatusIcon(deposit?.status || "pending")}
                            <span className="ml-1">
                              {getStatusText(deposit?.status || "pending")}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-primary-700 mb-2">
                          {car.brand} {car.carModel}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {car.year} • {car.fuelType} • {car.transmission}
                        </p>

                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">
                              Цена на автомобила:
                            </span>
                            <span className="font-semibold text-primary-600">
                              ${car.price.toLocaleString()}
                            </span>
                          </div>
                          {deposit && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">
                                Вашият депозит:
                              </span>
                              <span className="font-semibold text-green-600">
                                ${deposit.amount.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Link
                            to={`/cars/${car._id}`}
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-lg text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
                          >
                            <FaSearch className="mr-2" />
                            Виж детайли
                          </Link>

                          {(deposit?.status === "rejected" ||
                            deposit?.status === "refunded") && (
                            <button
                              onClick={() => handleNewDeposit(car)}
                              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                            >
                              <FaMoneyBillWave className="mr-2" />
                              Нов депозит
                            </button>
                          )}
                        </div>

                        {deposit && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>Дата на депозита:</span>
                                <span>
                                  {new Date(
                                    deposit.createdAt,
                                  ).toLocaleDateString("bg")}
                                </span>
                              </div>
                              {deposit.notes && (
                                <div className="mt-2">
                                  <span className="text-gray-500">
                                    Бележки:
                                  </span>
                                  <p className="text-gray-700 italic">
                                    "{deposit.notes}"
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="w-full py-12 bg-gradient-to-r from-primary-900 via-primary-700 to-yellow-400 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 text-2xl font-bold">
            <FaCar className="text-3xl" /> AutoMarket
          </div>
          <div className="text-lg">
            &copy; {new Date().getFullYear()} AutoMarket. Всички права запазени.
          </div>
        </div>
      </footer>

      {/* Deposit Modal */}
      {showDepositModal && selectedCar && (
        <DepositModal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          carId={selectedCar._id}
          carPrice={selectedCar.price}
          onDepositCreated={handleDepositCreated}
        />
      )}
    </div>
  );
};

export default Home;
