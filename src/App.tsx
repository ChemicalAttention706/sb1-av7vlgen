import React, { useState } from 'react';
import { Plus, Trash2, ExternalLink, PlusCircle, MinusCircle } from 'lucide-react';

type Store = {
  id: string;
  name: string;
  url: string;
  price: string;
  inStock: boolean;
};

type Part = {
  id: string;
  name: string;
  type: string;
  stores: Store[];
  lastChecked: string;
};

const initialParts: Part[] = [
  {
    id: '1',
    name: 'AMD Ryzen 7 7800X3D',
    type: 'CPU',
    stores: [
      {
        id: '1a',
        name: 'Newegg',
        price: '$449.99',
        url: 'https://www.newegg.com',
        inStock: true
      },
      {
        id: '1b',
        name: 'Amazon',
        price: '$459.99',
        url: 'https://www.amazon.com',
        inStock: false
      }
    ],
    lastChecked: new Date().toLocaleDateString()
  },
  {
    id: '2',
    name: 'NVIDIA RTX 4070',
    type: 'GPU',
    stores: [
      {
        id: '2a',
        name: 'Best Buy',
        price: '$599.99',
        url: 'https://www.bestbuy.com',
        inStock: false
      },
      {
        id: '2b',
        name: 'Micro Center',
        price: '$589.99',
        url: 'https://www.microcenter.com',
        inStock: true
      }
    ],
    lastChecked: new Date().toLocaleDateString()
  }
];

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
  const [newPart, setNewPart] = useState<Partial<Part>>({
    type: partTypes[0],
    stores: [{ id: Date.now().toString(), name: '', url: '', price: '', inStock: false }]
  });

  const handleAddStore = () => {
    setNewPart({
      ...newPart,
      stores: [...(newPart.stores || []), { 
        id: Date.now().toString(),
        name: '',
        url: '',
        price: '',
        inStock: false
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

  const handleStoreChange = (storeId: string, field: keyof Store, value: string | boolean) => {
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
        stores: [{ id: Date.now().toString(), name: '', url: '', price: '', inStock: false }]
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">PC Parts Tracker</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Part
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Component</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Best Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Checked</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parts.map(part => (
                  <React.Fragment key={part.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{part.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {part.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {getBestPrice(part.stores)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            getAvailabilityStatus(part.stores)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {getAvailabilityStatus(part.stores) ? 'Available' : 'Not Available'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{part.lastChecked}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => handleDeletePart(part.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {part.stores.map(store => (
                            <div
                              key={store.id}
                              className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium">{store.name}</div>
                                <div className="text-sm text-gray-500">{store.price}</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleStock(part.id, store.id)}
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    store.inStock
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {store.inStock ? 'In Stock' : 'Out of Stock'}
                                </button>
                                <a
                                  href={store.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <ExternalLink size={18} />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Add New Part</h2>
            <form onSubmit={handleAddPart}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newPart.name || ''}
                    onChange={e => setNewPart({ ...newPart, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                    <h3 className="text-lg font-medium">Stores</h3>
                    <button
                      type="button"
                      onClick={handleAddStore}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <PlusCircle size={18} />
                      Add Store
                    </button>
                  </div>
                  
                  {newPart.stores?.map((store, index) => (
                    <div key={store.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-sm font-medium">Store #{index + 1}</h4>
                        {newPart.stores!.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStore(store.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <MinusCircle size={18} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Store Name</label>
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={store.name}
                            onChange={e => handleStoreChange(store.id, 'name', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Price</label>
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={store.price}
                            onChange={e => handleStoreChange(store.id, 'price', e.target.value)}
                            placeholder="$0.00"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">URL</label>
                          <input
                            type="url"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={store.url}
                            onChange={e => handleStoreChange(store.id, 'url', e.target.value)}
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={store.inStock}
                              onChange={e => handleStoreChange(store.id, 'inStock', e.target.checked)}
                            />
                            <span className="ml-2 text-sm text-gray-900">In Stock</span>
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
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
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