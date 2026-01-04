import { useEffect, useState } from "react";
import { Car } from "../services/carService";
import authService from "../services/authService";
import { getAllCars, updateCar, deleteCar } from "../services/adminService";

interface CarWithId extends Car {
  _id: string;
}

const AdminCars = () => {
  const [cars, setCars] = useState<CarWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingCar, setEditingCar] = useState<CarWithId | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError("");
      const token = authService.getToken();
      if (!token) throw new Error("Not authenticated");
      const data = await getAllCars(token);
      setCars(data);
    } catch (err: any) {
      setError("Failed to load cars");
      console.error("Error fetching cars:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (car: CarWithId) => {
    setEditingCar({ ...car });
  };

  const handleSave = async () => {
    if (!editingCar) return;
    try {
      setError("");
      setSuccess("");
      const token = authService.getToken();
      if (!token) throw new Error("Not authenticated");
      await updateCar(token, editingCar._id, editingCar);
      setCars(cars.map((c) => (c._id === editingCar._id ? editingCar : c)));
      setEditingCar(null);
      setSuccess("Car updated successfully");
    } catch (err: any) {
      setError("Failed to update car");
      console.error("Error updating car:", err);
    }
  };

  const handleDelete = async (carId: string) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;
    try {
      setError("");
      setSuccess("");
      const token = authService.getToken();
      if (!token) throw new Error("Not authenticated");
      await deleteCar(token, carId);
      setCars(cars.filter((c) => c._id !== carId));
      setSuccess("Car deleted successfully");
    } catch (err: any) {
      setError("Failed to delete car");
      console.error("Error deleting car:", err);
    }
  };

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.carModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || car.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">
              Car Listings Management
            </h1>
            <p className="mt-2 text-primary-100">
              Manage and moderate car listings
            </p>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search cars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input w-full"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Messages */}
          {success && (
            <div className="p-4 bg-green-50 border-l-4 border-green-400">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Cars Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Car
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCars.map((car) => (
                  <tr key={car._id}>
                    <td className="px-6 py-4">
                      {editingCar?._id === car._id ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingCar.brand}
                              onChange={(e) =>
                                setEditingCar({
                                  ...editingCar,
                                  brand: e.target.value,
                                })
                              }
                              placeholder="Brand"
                              className="input flex-1"
                            />
                            <input
                              type="text"
                              value={editingCar.carModel}
                              onChange={(e) =>
                                setEditingCar({
                                  ...editingCar,
                                  carModel: e.target.value,
                                })
                              }
                              placeholder="Model"
                              className="input flex-1"
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={editingCar.year}
                              onChange={(e) =>
                                setEditingCar({
                                  ...editingCar,
                                  year: parseInt(e.target.value),
                                })
                              }
                              placeholder="Year"
                              className="input flex-1"
                            />
                            <input
                              type="number"
                              value={editingCar.price}
                              onChange={(e) =>
                                setEditingCar({
                                  ...editingCar,
                                  price: parseFloat(e.target.value),
                                })
                              }
                              placeholder="Price"
                              className="input flex-1"
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={editingCar.mileage}
                              onChange={(e) =>
                                setEditingCar({
                                  ...editingCar,
                                  mileage: parseInt(e.target.value),
                                })
                              }
                              placeholder="Mileage"
                              className="input flex-1"
                            />
                            <select
                              value={editingCar.status}
                              onChange={(e) =>
                                setEditingCar({
                                  ...editingCar,
                                  status: e.target.value,
                                })
                              }
                              className="input flex-1"
                            >
                              <option value="available">Available</option>
                              <option value="sold">Sold</option>
                              <option value="reserved">Reserved</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          {car.images && car.images[0] && (
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={car.images[0]}
                                alt={car.brand}
                              />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {car.brand} {car.carModel}
                            </div>
                            <div className="text-sm text-gray-500">
                              {car.year} • {car.mileage}km
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${car.price.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {car.seller?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {car.seller?.email || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          car.status === "available"
                            ? "bg-green-100 text-green-800"
                            : car.status === "sold"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {car.status.charAt(0).toUpperCase() +
                          car.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingCar?._id === car._id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSave}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCar(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(car)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(car._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCars;
