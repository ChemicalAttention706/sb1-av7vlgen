import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, PlusCircle, MinusCircle, Sun, Moon, SlidersHorizontal, Bell } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type PriceHistory = {
  date: string;
  price: number;
};

type Store = {
  id: string;
  name: string;
  url: string;
  price: string;
  inStock: boolean;
  priceHistory: PriceHistory[];
  priceAlert?: number;
};

type Part = {
  id: string;
  name: string;
  type: string;
  stores: Store[];
  lastChecked: string;
  compatibility?: string[];
};

const partTypes = [
  'CPU',
  'GPU',
  'Motherboard',
  'RAM',
  'Storage',
  'PSU',
  'Case',
  'Cooling'
];

function App() {
  const [parts, setParts] = useState<Part[]>(initialParts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'availability'>('name');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [newPart, setNewPart] = useState<Partial<Part>>({
    type: partTypes[0],
    stores: [{ 
      id: Date.now().toString(), 
      name: '', 
      url: '', 
      price: '', 
      inStock: false,
      priceHistory: []
    }]
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  const handleAddStore = () => {
    setNewPart({
      ...newPart,
      stores: [...(newPart.stores || []), { 
        id: Date.now().toString(),
        name: '',
        url: '',
        price: '',
        inStock: false,
        priceHistory: []
      }]
    });
  };

  const handleRemoveStore = (storeId: string) => {
    if ((newPart.stores?.length || 0) <= 1) return;
    setNewPart({
      ...newPart,
      stores: (newPart.stores || []).filter(store => store.id !== storeId)
    });
  };

  const handleStoreChange = (storeId: string, field: keyof Store, value: string | boolean | number) => {
    setNewPart({
      ...newPart,
      stores: (newPart.stores || []).map(store =>
        store.id === storeId ? { ...store, [field]: value } : store
      )
    });
  };

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPart.name && newPart.stores?.every(store => store.name && store.url && store.price)) {
      setParts([
        ...parts,
        {
          ...newPart,
          id: Date.now().toString(),
          lastChecked: new Date().toLocaleDateString()
        } as Part
      ]);
      setShowAddForm(false);
      setNewPart({
        type: partTypes[0],
        stores: [{ 
          id: Date.now().toString(), 
          name: '', 
          url: '', 
          price: '', 
          inStock: false,
          priceHistory: []
        }]
      });
    }
  };

  const handleDeletePart = (id: string) => {
    setParts(parts.filter(part => part.id !== id));
  };

  const toggleStock = (partId: string, storeId: string) => {
    setParts(parts.map(part =>
      part.id === partId
        ? {
            ...part,
            lastChecked: new Date().toLocaleDateString(),
            stores: part.stores.map(store =>
              store.id === storeId
                ? { ...store, inStock: !store.inStock }
                : store
            )
          }
        : part
    ));
  };

  const getBestPrice = (stores: Store[]) => {
    const prices = stores.map(store => parseFloat(store.price.replace('$', '')));
    return `$${Math.min(...prices).toFixed(2)}`;
  };

  const getAvailabilityStatus = (stores: Store[]) => {
    return stores.some(store => store.inStock);
  };

  const getTotalBuildCost = () => {
    return parts.reduce((total, part) => {
      const bestPrice = parseFloat(getBestPrice(part.stores).replace('$', ''));
      return total + bestPrice;
    }, 0);
  };

  const filteredAndSortedParts = parts
    .filter(part => selectedType === 'all' || part.type === selectedType)
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return parseFloat(getBestPrice(a.stores).replace('$', '')) - parseFloat(getBestPrice(b.stores).replace('$', ''));
        case 'availability':
          return getAvailabilityStatus(b.stores) ? 1 : -1;
        default:
          return 0;
      }
    });

  const setPriceAlert = (partId: string, storeId: string, price: number) => {
    setParts(parts.map(part =>
      part.id === partId
        ? {
            ...part,
            stores: part.stores.map(store =>
              store.id === storeId
                ? { ...store, priceAlert: price }
                : store
            )
          }
        : part
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">PC Parts Tracker</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Total Build Cost: <span className="font-semibold">${getTotalBuildCost().toFixed(2)}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <SlidersHorizontal size={20} />
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Add Part
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Filter by Type
                  </label>
                  <select
                    className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white px-4 py-2"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    {partTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort by
                  </label>
                  <select
                    className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white px-4 py-2"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'availability')}
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="availability">Availability</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Component</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Best Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Availability</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Checked</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedParts.map(part => (
                  <React.Fragment key={part.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{part.name}</div>
                          {part.compatibility && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Compatible with: {part.compatibility.join(', ')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {part.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {getBestPrice(part.stores)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-4 py-1 rounded-full text-sm font-medium ${
                            getAvailabilityStatus(part.stores)
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {getAvailabilityStatus(part.stores) ? 'Available' : 'Not Available'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{part.lastChecked}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => handleDeletePart(part.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td colSpan={6} className="px-6 py-3">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {part.stores.map(store => (
                              <div
                                key={store.id}
                                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{store.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{store.price}</div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => toggleStock(part.id, store.id)}
                                      className={`px-4 py-1 rounded-full text-xs font-medium ${
                                        store.inStock
                                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                      }`}
                                    >
                                      {store.inStock ? 'In Stock' : 'Out of Stock'}
                                    </button>
                                    <a
                                      href={store.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                    >
                                      <ExternalLink size={18} />
                                    </a>
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <Line
                                    data={{
                                      labels: store.priceHistory.map(h => h.date),
                                      datasets: [
                                        {
                                          label: 'Price History',
                                          data: store.priceHistory.map(h => h.price),
                                          borderColor: '#3b82f6',
                                          tension: 0.1
                                        }
                                      ]
                                    }}
                                    options={{
                                      responsive: true,
                                      plugins: {
                                        legend: {
                                          display: false
                                        }
                                      },
                                      scales: {
                                        y: {
                                          beginAtZero: false
                                        }
                                      }
                                    }}
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    placeholder="Set price alert"
                                    className="w-40 px-4 py-2 text-sm rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                    value={store.priceAlert || ''}
                                    onChange={(e) => setPriceAlert(part.id, store.id, parseFloat(e.target.value))}
                                  />
                                  <Bell size={16} className="text-gray-500 dark:text-gray-400" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Build Summary</h2>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              Total Cost: <span className="font-bold">${getTotalBuildCost().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add New Part</h2>
            <form onSubmit={handleAddPart}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 px-4 py-2"
                    value={newPart.name || ''}
                    onChange={e => setNewPart({ ...newPart, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:text-white px-4 py-2"
                    value={newPart.type}
                    onChange={e => setNewPart({ ...newPart, type: e.target.value })}
                  >
                    {partTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Stores</h3>
                    <button
                      type="button"
                      onClick={handleAddStore}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                      <PlusCircle size={18} />
                      Add Store
                    </button>
                  </div>
                  
                  {newPart.stores?.map((store, index) => (
                    <div key={store.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Store #{index + 1}</h4>
                        {newPart.stores!.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStore(store.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <MinusCircle size={18} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Store Name</label>
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 px-4 py-2"
                            value={store.name}
                            onChange={e => handleStoreChange(store.id, 'name', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 px-4 py-2"
                            value={store.price}
                            onChange={e => handleStoreChange(store.id, 'price', e.target.value)}
                            placeholder="$0.00"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL</label>
                          <input
                            type="url"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 px-4 py-2"
                            value={store.url}
                            onChange={e => handleStoreChange(store.id, 'url', e.target.value)}
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 dark:border-gray-500 text-blue-600 focus:ring-blue-500 dark:bg-gray-600"
                              checked={store.inStock}
                              onChange={e => handleStoreChange(store.id, 'inStock', e.target.checked)}
                            />
                            <span className="ml-2 text-sm text-gray-900 dark:text-white">In Stock</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
