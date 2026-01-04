import { useEffect, useState } from "react";
import { fetchUserDeposits, Deposit } from "../services/depositsService";
import authService from "../services/authService";
import DepositStatus from "../components/DepositStatus";
import { Link } from "react-router-dom";

const Deposits = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchDeposits = async () => {
      const token = authService.getToken();
      if (!token) {
        setError("Не сте влезли в профила си.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await fetchUserDeposits(token);
        setDeposits(data);
      } catch (err: any) {
        console.error("Error fetching deposits:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Грешка при зареждане на депозитите.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDeposits();
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Очаква одобрение";
      case "approved":
        return "Одобрен";
      case "rejected":
        return "Отхвърлен";
      case "refunded":
        return "Върнат";
      default:
        return status;
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
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredDeposits = deposits.filter(
    (deposit) => statusFilter === "all" || deposit.status === statusFilter,
  );

  const totalAmount = deposits.reduce(
    (sum, deposit) => sum + deposit.amount,
    0,
  );
  const pendingAmount = deposits
    .filter((deposit) => deposit.status === "pending")
    .reduce((sum, deposit) => sum + deposit.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Моите депозити
          </h1>
          <p className="text-gray-600">
            Управлявайте вашите депозити за автомобили
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Общо депозити
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {deposits.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Обща сума</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalAmount.toLocaleString("bg-BG")} лв.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Очакващи</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {pendingAmount.toLocaleString("bg-BG")} лв.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Филтър по статус:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Всички</option>
              <option value="pending">Очакващи</option>
              <option value="approved">Одобрени</option>
              <option value="rejected">Отхвърлени</option>
              <option value="refunded">Върнати</option>
            </select>
          </div>
        </div>

        {/* Deposits List */}
        {filteredDeposits.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Няма депозити
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter === "all"
                ? "Все още нямате депозити. Разгледайте нашите автомобили и направете депозит."
                : `Няма депозити със статус "${getStatusText(statusFilter)}"`}
            </p>
            {statusFilter === "all" && (
              <div className="mt-6">
                <Link
                  to="/cars"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Разгледай автомобили
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDeposits.map((deposit) => (
              <div
                key={deposit._id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                {/* Car Info Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {deposit.listingId.brand} {deposit.listingId.carModel}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(deposit.status)}`}
                    >
                      {getStatusText(deposit.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{deposit.listingId.year}</span>
                    <span className="font-semibold text-gray-900">
                      {deposit.listingId.price.toLocaleString("bg-BG")} лв.
                    </span>
                  </div>
                  {deposit.listingId.images &&
                    deposit.listingId.images.length > 0 && (
                      <div className="mt-3">
                        <img
                          src={deposit.listingId.images[0]}
                          alt={`${deposit.listingId.brand} ${deposit.listingId.carModel}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </div>
                    )}
                </div>

                {/* Deposit Details */}
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Депозит:</span>
                      <span className="font-semibold text-gray-900">
                        {deposit.amount.toLocaleString("bg-BG")} лв.
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Създаден:</span>
                      <span className="text-gray-900">
                        {new Date(deposit.createdAt).toLocaleDateString(
                          "bg-BG",
                        )}
                      </span>
                    </div>

                    {deposit.notes && (
                      <div>
                        <span className="text-gray-600 block mb-1">
                          Бележки:
                        </span>
                        <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded">
                          {deposit.notes}
                        </p>
                      </div>
                    )}

                    <div className="pt-3">
                      <Link
                        to={`/cars/${deposit.listingId._id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Виж детайли на автомобила →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Deposits;
