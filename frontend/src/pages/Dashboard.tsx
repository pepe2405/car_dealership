import { useEffect, useState, useCallback } from "react";
import { fetchMyCars, updateCar, deleteCar, Car } from "../services/carService";
import { useDropzone } from "react-dropzone";

const Dashboard = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editCar, setEditCar] = useState<Car | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);

  const token = JSON.parse(localStorage.getItem("user") || "{}").token;

  const loadCars = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyCars(token);
      setCars(data);
    } catch (err: any) {
      setError("Failed to load your cars.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;
    try {
      await deleteCar(id, token);
      setSuccess("Car deleted successfully!");
      loadCars();
    } catch (err) {
      setError("Failed to delete car.");
    }
  };

  const openEdit = (car: Car) => {
    setEditCar(car);
    setEditForm({
      brand: car.brand,
      carModel: car.carModel,
      year: car.year,
      price: car.price,
      mileage: car.mileage,
      fuelType: car.fuelType,
      transmission: car.transmission,
      images: car.images.join(", "),
      description: car.description,
      features: car.features.join(", "),
      location: car.location || { city: "", state: "", country: "" },
    });
    setEditImages([]);
    setEditImagePreviews([]);
    setError("");
    setSuccess("");
  };

  const closeEdit = () => {
    setEditCar(null);
    setEditForm({});
    setEditImages([]);
    setEditImagePreviews([]);
  };

  const handleEditChange = (e: any) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      setEditForm({
        ...editForm,
        location: { ...editForm.location, [name.split(".")[1]]: value },
      });
    } else if (name === "images") {
      setEditForm({ ...editForm, images: value });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const onEditDrop = useCallback((acceptedFiles: File[]) => {
    setEditImages(acceptedFiles);
    setEditImagePreviews(
      acceptedFiles.map((file) => URL.createObjectURL(file)),
    );
  }, []);

  const {
    getRootProps: getEditRootProps,
    getInputProps: getEditInputProps,
    isDragActive: isEditDragActive,
  } = useDropzone({
    onDrop: onEditDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const handleEditSubmit = async (e: any) => {
    e.preventDefault();
    setEditLoading(true);
    setError("");
    setSuccess("");
    try {
      let imagesArray: string[] = [];
      if (editImages.length > 0) {
        imagesArray = editImagePreviews;
      } else {
        imagesArray = editForm.images
          .split(",")
          .map((img: string) => img.trim())
          .filter(Boolean);
      }
      await updateCar(
        editCar!._id,
        {
          ...editForm,
          year: Number(editForm.year),
          price: Number(editForm.price),
          mileage: Number(editForm.mileage),
          features: editForm.features
            .split(",")
            .map((f: string) => f.trim())
            .filter(Boolean),
          images: imagesArray,
        },
        token,
      );
      setSuccess("Car updated successfully!");
      closeEdit();
      loadCars();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (Array.isArray(err.response?.data?.errors) &&
            err.response.data.errors[0]?.msg) ||
          err.message ||
          "Failed to update car.",
      );
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">My Car Listings</h1>
      {error && (
        <div className="rounded-md bg-red-100 border border-red-400 p-4 mb-4 text-red-700 font-semibold text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-100 border border-green-400 p-4 mb-4 text-green-700 font-semibold text-center">
          {success}
        </div>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : cars.length === 0 ? (
        <p className="text-center text-gray-500">
          You have not listed any cars yet.
        </p>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <div
              key={car._id}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col relative"
            >
              <div className="mb-4">
                <img
                  src={
                    car.images[0] ||
                    "https://via.placeholder.com/400x200?text=No+Image"
                  }
                  alt={car.brand + " " + car.carModel}
                  className="w-full h-40 object-cover rounded"
                />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                {car.brand} {car.carModel}
              </h2>
              <p className="text-gray-600 mb-1">Year: {car.year}</p>
              <p className="text-gray-600 mb-1">
                Price: ${car.price.toLocaleString()}
              </p>
              <p className="text-gray-600 mb-1">
                Mileage: {car.mileage.toLocaleString()} km
              </p>
              <p className="text-gray-600 mb-1">Fuel: {car.fuelType}</p>
              <p className="text-gray-600 mb-1">
                Transmission: {car.transmission}
              </p>
              <p className="text-gray-500 text-sm mt-2">Status: {car.status}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEdit(car)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(car._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editCar && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in-down max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeEdit}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Edit Car</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  name="brand"
                  value={editForm.brand}
                  onChange={handleEditChange}
                  required
                  className="input block w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  name="carModel"
                  value={editForm.carModel}
                  onChange={handleEditChange}
                  required
                  className="input block w-full"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    name="year"
                    value={editForm.year}
                    onChange={handleEditChange}
                    required
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="input block w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    name="price"
                    value={editForm.price}
                    onChange={handleEditChange}
                    required
                    type="number"
                    min="0"
                    className="input block w-full"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mileage (km)
                  </label>
                  <input
                    name="mileage"
                    value={editForm.mileage}
                    onChange={handleEditChange}
                    required
                    type="number"
                    min="0"
                    className="input block w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Type
                  </label>
                  <select
                    name="fuelType"
                    value={editForm.fuelType}
                    onChange={handleEditChange}
                    required
                    className="input block w-full"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transmission
                  </label>
                  <select
                    name="transmission"
                    value={editForm.transmission}
                    onChange={handleEditChange}
                    required
                    className="input block w-full"
                  >
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images
                  </label>
                  <div
                    {...getEditRootProps()}
                    className="border-2 border-dashed p-4 rounded-lg text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <input {...getEditInputProps()} />
                    {isEditDragActive ? (
                      <p>Drop the images here ...</p>
                    ) : (
                      <p>Drag & drop images here, or click to select files</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editImagePreviews.length > 0
                      ? editImagePreviews.map((src, idx) => (
                          <img
                            key={idx}
                            src={src}
                            alt={`preview ${idx}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                        ))
                      : editForm.images
                          .split(",")
                          .map((src: string, idx: number) => (
                            <img
                              key={idx}
                              src={src.trim()}
                              alt={`preview ${idx}`}
                              className="w-20 h-20 object-cover rounded"
                            />
                          ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    You can upload new images or edit URLs (comma separated).
                  </span>
                  <input
                    name="images"
                    value={editForm.images}
                    onChange={handleEditChange}
                    className="input block w-full mt-2"
                    placeholder="Comma separated URLs"
                    disabled={editImagePreviews.length > 0}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  required
                  className="input block w-full"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Features
                </label>
                <input
                  name="features"
                  value={editForm.features}
                  onChange={handleEditChange}
                  className="input block w-full"
                />
                <span className="text-xs text-gray-400">
                  Comma separated features
                </span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    name="location.city"
                    value={editForm.location.city}
                    onChange={handleEditChange}
                    className="input block w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    name="location.state"
                    value={editForm.location.state}
                    onChange={handleEditChange}
                    className="input block w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    name="location.country"
                    value={editForm.location.country}
                    onChange={handleEditChange}
                    className="input block w-full"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
