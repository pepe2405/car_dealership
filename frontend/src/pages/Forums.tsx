import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import authService from "../services/authService";
import CreateForum from "../components/forum/CreateForum";

interface Forum {
  _id: string;
  title: string;
  description: string;
  owner: { _id: string; name: string; email: string };
  comments: ForumComment[];
  createdAt: string;
}

interface ForumComment {
  _id: string;
  content: string;
  author: { _id: string; name: string; email: string };
  createdAt: string;
}

const Forums = () => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const currentUser = authService.getCurrentUser();
  const token = authService.getToken();

  useEffect(() => {
    fetchForums();
  }, []);

  const fetchForums = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/forums");
      const data = await res.json();
      setForums(data);
    } catch {
      setError("Грешка при зареждане на форумите.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForum = async (forumId: string) => {
    setActionError("");
    setActionSuccess("");

    if (!window.confirm("Сигурни ли сте, че искате да изтриете този форум?")) {
      return;
    }

    try {
      await fetch(`/api/forums/${forumId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setForums((forums) => forums.filter((f) => f._id !== forumId));
      setActionSuccess("Форумът е изтрит!");
    } catch {
      setActionError("Грешка при изтриване на форума.");
    }
  };

  const canDeleteForum = (forum: Forum) => {
    return (
      currentUser &&
      (currentUser.role === "admin" || currentUser.id === forum.owner._id)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-primary-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary-800 mb-8">Форуми</h1>

        {/* Бутон за създаване на форум */}
        {currentUser && <CreateForum onForumCreated={fetchForums} />}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 text-xl">{error}</div>
        ) : forums.length === 0 ? (
          <div className="text-center text-primary-700 text-xl">
            Няма намерени форуми.
            {!currentUser && (
              <div className="mt-4">
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  Влезте в профила си
                </Link>{" "}
                за да създадете първия форум!
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-primary-800 mb-4">
                Всички форуми ({forums.length})
              </h2>
              <div className="space-y-3">
                {forums.map((forum) => (
                  <div
                    key={forum._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <Link
                        to={`/forums/${forum._id}`}
                        className="block hover:text-primary-600 transition-colors duration-200"
                      >
                        <h3 className="font-semibold text-lg text-primary-800 mb-1">
                          {forum.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <span>от {forum.owner.name}</span>
                          <span>•</span>
                          <span>{forum.comments.length} коментара</span>
                          <span>•</span>
                          <span className="text-gray-500">
                            {new Date(
                              forum.createdAt || Date.now(),
                            ).toLocaleDateString("bg")}
                          </span>
                        </div>
                      </Link>
                    </div>
                    {canDeleteForum(forum) && (
                      <button
                        onClick={() => handleDeleteForum(forum._id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm ml-4"
                      >
                        Изтрий
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Съобщения за действия */}
        {actionError && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
            {actionError}
          </div>
        )}
        {actionSuccess && (
          <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
            {actionSuccess}
          </div>
        )}
      </div>
    </div>
  );
};

export default Forums;
