
import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { initialProducts, initialCustomers } from './data/mockData';
import { Product, Customer, Bill, Payment, User, UserRole } from './types';
import Billing from './components/Billing';
import Inventory from './components/Inventory';
import Customers from './components/Customers';
import Reports from './components/Reports';
import Login from './components/Login';
import { generateProductDescription, getSalesInsights } from './services/geminiService';

const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('billing');
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  
  const [products, setProducts] = useLocalStorage<Product[]>('products', initialProducts);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', initialCustomers);
  const [bills, setBills] = useLocalStorage<Bill[]>('bills', []);
  const [payments, setPayments] = useLocalStorage<Payment[]>('payments', []);

  const handleAddBill = (newBill: Bill) => {
    setBills(prev => [...prev, newBill]);
    
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      newBill.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
          updatedProducts[productIndex].stock -= item.quantity;
        }
      });
      return updatedProducts;
    });

    if (newBill.amountDue > 0) {
      setCustomers(prevCustomers => {
        const updatedCustomers = [...prevCustomers];
        const customerIndex = updatedCustomers.findIndex(c => c.id === newBill.customerId);
        if (customerIndex !== -1) {
          updatedCustomers[customerIndex].outstandingBalance += newBill.amountDue;
        }
        return updatedCustomers;
      });
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === UserRole.STAFF) {
      setActiveTab('billing');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('billing');
  };

  const tabs = useMemo(() => [
    { id: 'billing', label: 'Billing', component: <Billing products={products} customers={customers} onAddBill={handleAddBill} />, roles: [UserRole.ADMIN, UserRole.STAFF] },
    { id: 'inventory', label: 'Inventory', component: <Inventory products={products} setProducts={setProducts} onGenerateDescription={generateProductDescription} />, roles: [UserRole.ADMIN] },
    { id: 'customers', label: 'Customers', component: <Customers customers={customers} setCustomers={setCustomers} bills={bills} payments={payments} setPayments={setPayments}/>, roles: [UserRole.ADMIN] },
    { id: 'reports', label: 'Reports', component: <Reports bills={bills} products={products} customers={customers} onGetSalesInsights={getSalesInsights} />, roles: [UserRole.ADMIN] },
  ], [products, customers, bills, payments]);

  const availableTabs = useMemo(() => {
    if (!currentUser) return [];
    return tabs.filter(tab => tab.roles.includes(currentUser.role));
  }, [tabs, currentUser]);
  
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const NavLink: React.FC<{tabId: string, children: React.ReactNode}> = ({tabId, children}) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        activeTab === tabId
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <header className="bg-gray-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Invoicer Pro</h1>
          <nav className="hidden md:flex items-center space-x-2">
            {availableTabs.map(tab => <NavLink key={tab.id} tabId={tab.id}>{tab.label}</NavLink>)}
          </nav>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-sm font-medium capitalize">{currentUser.username}</span>
              <span className="text-xs text-gray-400 block">{currentUser.role}</span>
            </div>
            <button onClick={handleLogout} title="Logout" className="p-2 rounded-full hover:bg-gray-700 transition-colors">
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="md:hidden bg-gray-700">
             <nav className="flex justify-around p-2">
                {availableTabs.map(tab => <NavLink key={tab.id} tabId={tab.id}>{tab.label}</NavLink>)}
             </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6">
        {availableTabs.find(tab => tab.id === activeTab)?.component}
      </main>
    </div>
  );
};

export default App;
