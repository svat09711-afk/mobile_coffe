import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Coffee as CoffeeIcon, Plus, Edit, Trash2, X, Save, Package, LogOut, ArrowLeft } from 'lucide-react';
import { Coffee, fetchCoffees, createCoffeeAdmin, updateCoffeeAdmin, deleteCoffeeAdmin } from '../api';
import { useNavigate } from 'react-router';

interface CoffeeFormData {
  name: string;
  composition: string;
  recipe: string;
  price: number;
  image_url: string;
}

const emptyFormData: CoffeeFormData = {
  name: '',
  composition: '',
  recipe: '',
  price: 0,
  image_url: '',
};

export function AdminDashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState<Coffee | null>(null);
  const [formData, setFormData] = useState<CoffeeFormData>(emptyFormData);

  useEffect(() => {
    if (token) {
      loadCoffees();
    }
  }, [token]);

  const loadCoffees = async () => {
    try {
      const data = await fetchCoffees();
      setCoffees(data);
    } catch (error) {
      console.error('Failed to load coffees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (coffee?: Coffee) => {
    if (coffee) {
      setEditingCoffee(coffee);
      setFormData({
        name: coffee.name,
        composition: coffee.composition,
        recipe: coffee.recipe,
        price: coffee.price,
        image_url: coffee.image_url,
      });
    } else {
      setEditingCoffee(null);
      setFormData(emptyFormData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoffee(null);
    setFormData(emptyFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    try {
      if (editingCoffee) {
        const updated = await updateCoffeeAdmin(editingCoffee.id, formData, token);
        setCoffees(coffees.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await createCoffeeAdmin(formData, token);
        setCoffees([...coffees, created]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save coffee:', error);
      alert('Failed to save coffee');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coffee?')) return;
    if (!token) return;
    
    try {
      await deleteCoffeeAdmin(id, token);
      setCoffees(coffees.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Failed to delete coffee:', error);
      alert('Failed to delete coffee');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <CoffeeIcon className="w-16 h-16 text-amber-700 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </a>
              <div className="flex items-center gap-3">
                <CoffeeIcon className="w-8 h-8 text-amber-700" />
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <CoffeeIcon className="w-8 h-8 text-amber-700" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-gray-800">{coffees.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coffee List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-700" />
              Coffee Products
            </h2>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Coffee
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Image</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Composition</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coffees.map((coffee) => (
                  <tr key={coffee.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <img
                        src={coffee.image_url}
                        alt={coffee.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </td>
                    <td className="py-3 px-4 text-gray-800 font-medium">{coffee.name}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm max-w-xs truncate">
                      {coffee.composition}
                    </td>
                    <td className="py-3 px-4 text-amber-700 font-bold">{coffee.price} ₽</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(coffee)}
                          className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <Edit className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(coffee.id)}
                          className="p-2 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={handleCloseModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingCoffee ? 'Edit Coffee' : 'Add Coffee'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Composition</label>
                  <input
                    type="text"
                    value={formData.composition}
                    onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipe</label>
                  <textarea
                    value={formData.recipe}
                    onChange={(e) => setFormData({ ...formData, recipe: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₽)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                {formData.image_url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    {editingCoffee ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
