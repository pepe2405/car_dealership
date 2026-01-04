import { useEffect, useState } from "react";
import {
  getTestDriveRequests,
  updateTestDriveRequest,
} from "../services/testDriveService";
import authService from "../services/authService";
import { FaCar, FaUser, FaCheck, FaTimes, FaClock } from "react-icons/fa";

interface TestDrive {
  _id: string;
  car: { _id: string; brand: string; carModel: string };
  buyer: { name: string; email: string };
  seller: { name: string; email: string };
  date: string;
  status: "pending" | "approved" | "rejected";
  message?: string;
}

const TestDrives = () => {
  const [requests, setRequests] = useState<TestDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const currentUser = authService.getCurrentUser();
  const token = authService.getToken();

  useEffect(() => {
    if (!token) {
      setError("Трябва да сте влезли, за да виждате тест драйв заявки.");
      setLoading(false);
      return;
    }
    getTestDriveRequests(token)
      .then(setRequests)
      .catch(() => setError("Грешка при зареждане на тест драйв заявките."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    setActionError("");
    setActionSuccess("");
    if (!token) return;
    try {
      await updateTestDriveRequest(id, status, token);
      setRequests((reqs) =>
        reqs.map((r) => (r._id === id ? { ...r, status } : r)),
      );
      setActionSuccess("Статусът е обновен!");
    } catch {
      setActionError("Грешка при обновяване на статуса.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-primary-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary-800 mb-8 flex items-center gap-2">
          <FaCar className="text-primary-500" /> Тест драйв заявки
        </h1>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 text-xl">{error}</div>
        ) : requests.length === 0 ? (
          <div className="text-center text-primary-700 text-xl">
            Няма намерени заявки.
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row md:items-center gap-4 border border-primary-100"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCar className="text-primary-400" />
                    <span className="font-bold">
                      {req.car
                        ? `${req.car.brand} ${req.car.carModel}`
                        : "Няма информация за колата"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <FaUser className="text-primary-400" />
                    <span>
                      Купувач: {req.buyer.name} ({req.buyer.email})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <FaUser className="text-primary-400" />
                    <span>
                      Продавач: {req.seller.name} ({req.seller.email})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <FaClock className="text-primary-400" />
                    <span>Дата: {new Date(req.date).toLocaleString("bg")}</span>
                  </div>
                  {req.message && (
                    <div className="text-sm text-gray-700 mt-2">
                      <span className="font-medium">Съобщение:</span>{" "}
                      {req.message}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2 min-w-[120px]">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${req.status === "pending" ? "bg-yellow-100 text-yellow-700" : req.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {req.status === "pending"
                      ? "Изчаква"
                      : req.status === "approved"
                        ? "Одобрена"
                        : "Отказана"}
                  </span>
                  {currentUser &&
                    (currentUser.role === "seller" ||
                      currentUser.role === "admin") &&
                    req.status === "pending" && (
                      <>
                        <button
                          className="btn-primary w-full py-1 rounded-xl mt-2"
                          onClick={() => handleAction(req._id, "approved")}
                        >
                          <FaCheck className="inline mr-1" /> Одобри
                        </button>
                        <button
                          className="btn-secondary w-full py-1 rounded-xl mt-1"
                          onClick={() => handleAction(req._id, "rejected")}
                        >
                          <FaTimes className="inline mr-1" /> Откажи
                        </button>
                      </>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
        {actionError && (
          <div className="text-red-600 text-center mt-4 animate-fade-in">
            {actionError}
          </div>
        )}
        {actionSuccess && (
          <div className="text-green-600 text-center mt-4 animate-fade-in">
            {actionSuccess}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDrives;
