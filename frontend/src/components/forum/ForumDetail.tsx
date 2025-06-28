import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

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

const ForumDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [forum, setForum] = useState<Forum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const currentUser = authService.getCurrentUser();
  const token = authService.getToken();

  useEffect(() => {
    if (id) {
      fetchForum();
    }
  }, [id]);

  const fetchForum = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/forums/${id}`);
      if (!res.ok) {
        throw new Error('Форумът не е намерен');
      }
      const data = await res.json();
      setForum(data);
    } catch (err) {
      setError('Грешка при зареждане на форума.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    setSubmittingComment(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch(`/api/forums/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!res.ok) {
        throw new Error('Грешка при добавяне на коментар');
      }

      const comment = await res.json();
      setForum(prev => prev ? {
        ...prev,
        comments: [...prev.comments, comment]
      } : null);
      setNewComment('');
      setActionSuccess('Коментарът е добавен успешно!');
    } catch (err) {
      setActionError('Грешка при добавяне на коментара.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!id) return;

    setActionError('');
    setActionSuccess('');

    try {
      await fetch(`/api/forums/${id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      setForum(prev => prev ? {
        ...prev,
        comments: prev.comments.filter(c => c._id !== commentId)
      } : null);
      setActionSuccess('Коментарът е изтрит!');
    } catch (err) {
      setActionError('Грешка при изтриване на коментара.');
    }
  };

  const handleDeleteForum = async () => {
    if (!id) return;

    if (!window.confirm('Сигурни ли сте, че искате да изтриете този форум?')) {
      return;
    }

    try {
      await fetch(`/api/forums/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/forums');
    } catch (err) {
      setActionError('Грешка при изтриване на форума.');
    }
  };

  const canDeleteForum = () => {
    return currentUser && forum && (currentUser.role === 'admin' || currentUser.id === forum.owner._id);
  };

  const canDeleteComment = (comment: ForumComment) => {
    return currentUser && (currentUser.role === 'admin' || currentUser.id === comment.author._id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-primary-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !forum) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-primary-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center text-red-600 text-xl">{error || 'Форумът не е намерен'}</div>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/forums')}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md"
            >
              Назад към форумите
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-primary-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/forums')}
            className="text-primary-600 hover:text-primary-700 font-semibold mb-4 flex items-center"
          >
            ← Назад към форумите
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-primary-100 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-800 mb-2">{forum.title}</h1>
              <p className="text-gray-600">Създаден от {forum.owner.name}</p>
            </div>
            {canDeleteForum() && (
              <button
                onClick={handleDeleteForum}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Изтрий форум
              </button>
            )}
          </div>
          <div className="text-gray-700 text-lg leading-relaxed mb-6">
            {forum.description}
          </div>
        </div>

        {/* Коментари секция */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-primary-100">
          <h2 className="text-2xl font-bold text-primary-800 mb-6">Коментари ({forum.comments.length})</h2>

          {/* Форма за нов коментар */}
          {currentUser && (
            <form onSubmit={handleAddComment} className="mb-8">
              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Добави коментар
                </label>
                <textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Напишете вашия коментар..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
              >
                {submittingComment ? 'Добавяне...' : 'Добави коментар'}
              </button>
            </form>
          )}

          {/* Списък с коментари */}
          {forum.comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Няма коментари все още. Бъдете първият!
            </div>
          ) : (
            <div className="space-y-4">
              {forum.comments.map(comment => (
                <div key={comment._id} className="bg-primary-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="font-semibold text-primary-800">{comment.author.name}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleString('bg')}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                    {canDeleteComment(comment) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-500 hover:text-red-700 ml-4 text-sm"
                      >
                        Изтрий
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Съобщения за действия */}
        {actionError && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {actionError}
          </div>
        )}
        {actionSuccess && (
          <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {actionSuccess}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumDetail; 