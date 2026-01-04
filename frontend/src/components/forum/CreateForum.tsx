import { useState } from "react";
import authService from "../../services/authService";

interface CreateForumProps {
  onForumCreated: () => void;
}

const CreateForum: React.FC<CreateForumProps> = ({ onForumCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const token = authService.getToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Трябва да сте влезли в профила си, за да създадете форум.");
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError("Моля, попълнете всички полета.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/forums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Трябва да сте влезли в профила си, за да създадете форум.");
        } else {
          setError("Грешка при създаване на форума.");
        }
        return;
      }

      setTitle("");
      setDescription("");
      setIsOpen(false);
      onForumCreated();
    } catch (err) {
      setError("Грешка при създаване на форума.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  if (!isOpen) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
        >
          + Създай нов форум
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white rounded-2xl shadow-md p-6 border border-primary-100">
      <h2 className="text-xl font-bold text-primary-800 mb-4">
        Създай нов форум
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Заглавие *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Въведете заглавие на форума"
            required
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Описание *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Въведете описание на форума"
            required
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
          >
            {loading ? "Създаване..." : "Създай форум"}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-md transition-colors duration-200"
          >
            Отказ
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateForum;
