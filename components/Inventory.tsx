
import React, { useState } from 'react';
import { Product } from '../types';
import { Modal } from './ui/Modal';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onGenerateDescription: (productName: string) => Promise<string>;
}

const EditIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 18l1.9-5.8 5.8-1.9-5.8-1.9L12 3z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>;

const ProductForm: React.FC<{
  product: Partial<Product>;
  setProduct: React.Dispatch<React.SetStateAction<Partial<Product>>>;
  onGenerateDescription: (name: string) => Promise<string>;
}> = ({ product, setProduct, onGenerateDescription }) => {
  
  const [isGenerating, setIsGenerating] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: name === 'stock' || name === 'retailPrice' || name === 'wholesalePrice' ? parseFloat(value) : value }));
  };
  
  const handleGenerateDesc = async () => {
    if(!product.name) {
        alert("Please enter a product name first.");
        return;
    }
    setIsGenerating(true);
    const desc = await onGenerateDescription(product.name);
    setProduct(prev => ({...prev, description: desc}));
    setIsGenerating(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input type="text" name="itemCode" placeholder="Item Code" value={product.itemCode || ''} onChange={handleChange} className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600" required />
      <input type="text" name="name" placeholder="Product Name" value={product.name || ''} onChange={handleChange} className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600" required />
      <input type="number" name="stock" placeholder="Stock Quantity" value={product.stock || ''} onChange={handleChange} className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600" required />
      <input type="number" name="retailPrice" placeholder="Retail Price" value={product.retailPrice || ''} onChange={handleChange} className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600" required />
      <input type="number" name="wholesalePrice" placeholder="Wholesale Price" value={product.wholesalePrice || ''} onChange={handleChange} className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600" required />
      <div className="md:col-span-2">
        <textarea name="description" placeholder="Product Description" value={product.description || ''} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600" />
        <button type="button" onClick={handleGenerateDesc} disabled={isGenerating} className="mt-2 flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-purple-400">
          <SparklesIcon className="w-4 h-4" />
          {isGenerating ? 'Generating...' : 'Generate with AI'}
        </button>
      </div>
    </div>
  );
};

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, onGenerateDescription }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const openModal = (product: Partial<Product> | null = null) => {
    setEditingProduct(product || {});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSave = () => {
    if (!editingProduct || !editingProduct.name || !editingProduct.itemCode) {
      alert("Item Code and Name are required.");
      return;
    }
    
    if (editingProduct.id) { // Editing existing product
      setProducts(products.map(p => p.id === editingProduct!.id ? editingProduct as Product : p));
    } else { // Adding new product
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        ...editingProduct
      } as Product;
      setProducts([...products, newProduct]);
    }
    closeModal();
  };
  
  const handleDelete = (productId: string) => {
    if(window.confirm("Are you sure you want to delete this product?")) {
        setProducts(products.filter(p => p.id !== productId));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Inventory Management</h2>
        <button onClick={() => openModal()} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">Add Product</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">Item Code</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Retail Price</th>
              <th className="px-6 py-3">Wholesale Price</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className={`border-b dark:border-gray-700 ${product.stock < 10 ? 'bg-red-100 dark:bg-red-900/50' : 'bg-white dark:bg-gray-800'}`}>
                <td className="px-6 py-4 font-medium">{product.itemCode}</td>
                <td className="px-6 py-4">{product.name}</td>
                <td className="px-6 py-4">{product.stock} {product.stock < 10 && <span className="text-xs text-red-500 ml-2">(Low)</span>}</td>
                <td className="px-6 py-4">{product.retailPrice.toFixed(2)}</td>
                <td className="px-6 py-4">{product.wholesalePrice.toFixed(2)}</td>
                <td className="px-6 py-4 flex space-x-2">
                  <button onClick={() => openModal(product)} className="text-blue-500 hover:text-blue-700"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct?.id ? 'Edit Product' : 'Add New Product'}
        footer={
          <>
            <button onClick={closeModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md mr-2">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
          </>
        }
      >
        {editingProduct && <ProductForm product={editingProduct} setProduct={setEditingProduct} onGenerateDescription={onGenerateDescription} />}
      </Modal>
    </div>
  );
};

export default Inventory;
