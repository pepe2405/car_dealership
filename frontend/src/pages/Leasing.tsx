import { useState } from "react";
import LeaseOptions from "../components/leasing/LeaseOptions";
import LeaseCalculator from "../components/leasing/LeaseCalculator";
import LeaseOptionsAdmin from "../components/leasing/LeaseOptionsAdmin";
import authService from "../services/authService";

const Leasing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "options" | "calculator" | "admin"
  >("options");
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-primary-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-800 mb-4">
            Лизинг на автомобили
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Открийте нашите изгодни опции за лизинг и изчислете вашите месечни
            вноски. Гъвкави условия и конкурентни цени за всички бюджети.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setActiveTab("options")}
              className={`px-6 py-3 rounded-md font-semibold transition-colors duration-200 ${
                activeTab === "options"
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:text-primary-600"
              }`}
            >
              Опции за лизинг
            </button>
            <button
              onClick={() => setActiveTab("calculator")}
              className={`px-6 py-3 rounded-md font-semibold transition-colors duration-200 ${
                activeTab === "calculator"
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:text-primary-600"
              }`}
            >
              Калкулатор
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-6 py-3 rounded-md font-semibold transition-colors duration-200 ${
                  activeTab === "admin"
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:text-primary-600"
                }`}
              >
                Управление
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {activeTab === "options" && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-primary-800 mb-4">
                  Нашите опции за лизинг
                </h2>
                <p className="text-gray-600">
                  Изберете от нашите предварително одобрени планове за лизинг
                </p>
              </div>
              <LeaseOptions />
            </div>
          )}

          {activeTab === "calculator" && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-primary-800 mb-4">
                  Калкулатор за лизинг
                </h2>
                <p className="text-gray-600">
                  Изчислете вашите месечни вноски според цената на автомобила
                </p>
              </div>
              <LeaseCalculator />
            </div>
          )}

          {activeTab === "admin" && isAdmin && (
            <div>
              <LeaseOptionsAdmin />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leasing;
