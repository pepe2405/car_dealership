import React, { useState } from "react";
import { FaCar, FaCreditCard, FaFileInvoice, FaUser } from "react-icons/fa";
import { createSale, CreateSaleData } from "../services/salesService";
import authService from "../services/authService";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: string;
  carPrice: number;
  carBrand: string;
  carModel: string;
  carYear: number;
  onPurchaseCreated: () => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  carId,
  carPrice,
  carBrand,
  carModel,
  carYear,
  onPurchaseCreated,
}) => {
  const [purchaseType, setPurchaseType] = useState<"full" | "leasing">("full");
  const [purchaseDetails, setPurchaseDetails] = useState({
    totalAmount: carPrice,
    downPayment: 0,
    monthlyPayment: 0,
    leaseTerm: 60,
    interestRate: 5.5,
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentUser = authService.getCurrentUser();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setPurchaseDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePurchaseTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const type = e.target.value as "full" | "leasing";
    setPurchaseType(type);

    if (type === "full") {
      setPurchaseDetails((prev) => ({
        ...prev,
        totalAmount: carPrice,
        downPayment: 0,
        monthlyPayment: 0,
      }));
    } else {
      const downPayment = carPrice * 0.2;
      const remainingAmount = carPrice - downPayment;
      const monthlyPayment = (remainingAmount * (1 + 0.055 * 5)) / 60;

      setPurchaseDetails((prev) => ({
        ...prev,
        totalAmount: carPrice,
        downPayment,
        monthlyPayment: Math.round(monthlyPayment),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Не сте влезли в профила си.");
      }

      if (!currentUser) {
        throw new Error("Не сте влезли в профила си.");
      }

      if (
        purchaseType === "leasing" &&
        (!purchaseDetails.downPayment || !purchaseDetails.monthlyPayment)
      ) {
        throw new Error(
          "За лизинг са необходими първоначална вноска и месечна вноска.",
        );
      }

      const purchaseData: CreateSaleData = {
        carId,
        buyerId: currentUser.id,
        saleType: purchaseType,
        totalAmount: purchaseDetails.totalAmount,
        notes: purchaseDetails.notes,
      };

      if (purchaseType === "leasing") {
        purchaseData.downPayment = purchaseDetails.downPayment;
        purchaseData.monthlyPayment = purchaseDetails.monthlyPayment;
        purchaseData.leaseTerm = purchaseDetails.leaseTerm;
        purchaseData.interestRate = purchaseDetails.interestRate;
      }

      const result = await createSale(purchaseData, token);

      setSuccess("Покупката е създадена успешно!");

      setTimeout(() => {
        onPurchaseCreated();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Грешка при създаване на покупката.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaCar className="text-primary-500" />
              Покупка на автомобил
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              &times;
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            {carBrand} {carModel} ({carYear}) - ${carPrice.toLocaleString()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Purchase Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип на покупката
            </label>
            <select
              value={purchaseType}
              onChange={handlePurchaseTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="full">Пълна покупка</option>
              <option value="leasing">Лизинг</option>
            </select>
          </div>

          {/* Buyer Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaUser className="text-primary-500" />
              Вашата информация
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Име
                </label>
                <input
                  type="text"
                  value={currentUser?.name || ""}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имейл
                </label>
                <input
                  type="email"
                  value={currentUser?.email || ""}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Purchase Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCreditCard className="text-primary-500" />
              Детайли на покупката
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Обща сума (€)
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  value={purchaseDetails.totalAmount}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {purchaseType === "leasing" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Първоначална вноска (€)
                    </label>
                    <input
                      type="number"
                      name="downPayment"
                      value={purchaseDetails.downPayment}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Месечна вноска (€)
                    </label>
                    <input
                      type="number"
                      name="monthlyPayment"
                      value={purchaseDetails.monthlyPayment}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Срок на лизинга (месеци)
                    </label>
                    <input
                      type="number"
                      name="leaseTerm"
                      value={purchaseDetails.leaseTerm}
                      onChange={handleInputChange}
                      min="12"
                      max="120"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Лихвен процент (%)
                    </label>
                    <input
                      type="number"
                      name="interestRate"
                      value={purchaseDetails.interestRate}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Бележки (по желание)
              </label>
              <textarea
                name="notes"
                value={purchaseDetails.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Допълнителна информация за покупката..."
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <FaFileInvoice className="text-blue-500" />
              Обобщение на покупката
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Автомобил:</span>
                <span className="font-medium">
                  {carBrand} {carModel} ({carYear})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Тип покупка:</span>
                <span className="font-medium">
                  {purchaseType === "full" ? "Пълна покупка" : "Лизинг"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Обща сума:</span>
                <span className="font-medium">
                  ${purchaseDetails.totalAmount.toLocaleString()}
                </span>
              </div>
              {purchaseType === "leasing" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Първоначална вноска:</span>
                    <span className="font-medium">
                      ${purchaseDetails.downPayment.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Месечна вноска:</span>
                    <span className="font-medium">
                      ${purchaseDetails.monthlyPayment.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Обработване...
                </>
              ) : (
                <>
                  <FaFileInvoice />
                  Направи покупка
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseModal;
