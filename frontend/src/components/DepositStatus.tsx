import { Deposit } from "../services/depositsService";

interface DepositStatusProps {
  deposit: Deposit;
  className?: string;
}

const DepositStatus = ({ deposit, className = "" }: DepositStatusProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "refunded":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bg-BG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Депозит</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(deposit.status)}`}
        >
          {getStatusText(deposit.status)}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Сума:</span>
          <span className="font-semibold text-gray-900">
            {deposit.amount.toLocaleString("bg-BG")} лв.
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Създаден на:</span>
          <span className="text-gray-900">{formatDate(deposit.createdAt)}</span>
        </div>

        {deposit.notes && (
          <div>
            <span className="text-gray-600 block mb-1">Бележки:</span>
            <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded">
              {deposit.notes}
            </p>
          </div>
        )}

        {deposit.status === "approved" && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">
              ✅ Вашият депозит е одобрен! Можете да продължите с покупката.
            </p>
          </div>
        )}

        {deposit.status === "rejected" && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">
              ❌ Вашият депозит е отхвърлен. Моля свържете се с нас за повече
              информация.
            </p>
          </div>
        )}

        {deposit.status === "refunded" && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700 text-sm">
              💰 Вашият депозит е върнат успешно.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositStatus;
