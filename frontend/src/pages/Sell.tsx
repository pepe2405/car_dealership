import { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const initialState = {
  brand: "",
  carModel: "",
  year: "",
  price: "",
  mileage: "",
  fuelType: "petrol",
  transmission: "manual",
  description: "",
  features: "",
  location: { city: "", state: "", country: "" },
};

const Sell = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      setForm({
        ...form,
        location: { ...form.location, [name.split(".")[1]]: value },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
    setError("");
    setSuccess("");
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages((prev) => [...prev, ...acceptedFiles]);
    setImagePreviews((prev) => [
      ...prev,
      ...acceptedFiles.map((file) => URL.createObjectURL(file)),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const trimmedForm = {
      ...form,
      brand: form.brand.trim(),
      carModel: form.carModel.trim(),
      year: String(form.year).trim(),
      price: String(form.price).trim(),
      mileage: String(form.mileage).trim(),
      description: form.description.trim(),
      features: form.features.trim(),
      location: {
        city: form.location.city.trim(),
        state: form.location.state.trim(),
        country: form.location.country.trim(),
      },
    };

    if (!trimmedForm.brand) {
      setError("Brand is required");
      setLoading(false);
      return;
    }
    if (!trimmedForm.carModel) {
      setError("Model is required");
      setLoading(false);
      return;
    }
    if (!trimmedForm.year) {
      setError("Year is required");
      setLoading(false);
      return;
    }
    if (!trimmedForm.price) {
      setError("Price is required");
      setLoading(false);
      return;
    }
    if (!trimmedForm.mileage) {
      setError("Mileage is required");
      setLoading(false);
      return;
    }
    if (!trimmedForm.description) {
      setError("Description is required");
      setLoading(false);
      return;
    }
    if (images.length === 0) {
      setError("At least one image is required");
      setLoading(false);
      return;
    }
    console.log(trimmedForm);
    try {
      const token = JSON.parse(localStorage.getItem("user") || "{}").token;
      const featuresArray = trimmedForm.features
        ? trimmedForm.features
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean)
        : [];
      const imageUrlsArray = imagePreviews.map((url) => url);
      const carData = {
        brand: trimmedForm.brand,
        carModel: trimmedForm.carModel,
        year: Number(trimmedForm.year),
        price: Number(trimmedForm.price),
        mileage: Number(trimmedForm.mileage),
        fuelType: trimmedForm.fuelType,
        transmission: trimmedForm.transmission,
        description: trimmedForm.description,
        features: featuresArray,
        images: imageUrlsArray,
        location: {
          city: trimmedForm.location.city,
          state: trimmedForm.location.state,
          country: trimmedForm.location.country,
        },
      };
      await axios.post("http://localhost:5001/api/cars", carData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setSuccess("Car listed successfully!");
      setForm(initialState);
      setImages([]);
      setImagePreviews([]);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (Array.isArray(err.response?.data?.errors) &&
            err.response.data.errors[0]?.msg) ||
          err.message ||
          "An error occurred while listing the car.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-blue-50 to-white py-12 px-2">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 transition-transform duration-300 hover:scale-[1.01] hover:shadow-3xl">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-700 tracking-tight animate-fade-in">
          Sell Your Car
        </h1>
        {error && (
          <div className="rounded-md bg-red-100 border border-red-400 p-4 mb-4 text-red-700 font-semibold text-center animate-fade-in-down">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md bg-green-100 border border-green-400 p-4 mb-4 text-green-700 font-semibold text-center animate-fade-in-down">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                required
                placeholder="e.g. Toyota"
                className="input block w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                name="carModel"
                value={form.carModel}
                onChange={handleChange}
                required
                placeholder="e.g. Corolla"
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
                  value={form.year}
                  onChange={handleChange}
                  required
                  placeholder="Year"
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
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="Price"
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
                  value={form.mileage}
                  onChange={handleChange}
                  required
                  placeholder="Mileage"
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
                  value={form.fuelType}
                  onChange={handleChange}
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
                  value={form.transmission}
                  onChange={handleChange}
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
                  {...getRootProps()}
                  className="border-2 border-dashed p-4 rounded-lg text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p>Drop the images here ...</p>
                  ) : (
                    <p>Drag & drop images here, or click to select files</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {imagePreviews.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`preview ${idx}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  You can upload multiple images.
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                placeholder="Describe your car..."
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
                value={form.features}
                onChange={handleChange}
                placeholder="e.g. Air Conditioning, Bluetooth"
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
                  value={form.location.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="input block w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  name="location.state"
                  value={form.location.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="input block w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  name="location.country"
                  value={form.location.country}
                  onChange={handleChange}
                  placeholder="Country"
                  className="input block w-full"
                />
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold shadow-lg hover:scale-[1.03] hover:from-blue-700 hover:to-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {loading ? (
                <span className="animate-pulse">Listing...</span>
              ) : (
                "List Car"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sell;
