
import React, { useState } from 'react';
import { Customer, CustomerType, Bill, Payment } from '../types';
import { Modal } from './ui/Modal';

interface CustomersProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  bills: Bill[];
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
}

const EditIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const DollarSignIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const HistoryIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>;

const CustomerForm: React.FC<{
  customer: Partial<Customer>;
  setCustomer: React.Dispatch<React.SetStateAction<Partial<Customer>>>;
}> = ({ customer, setCustomer }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: (name === 'creditLimit' || name === 'outstandingBalance') ? parseFloat(value) : value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input type="text" name="name" placeholder="Customer Name" value={customer.name || ''} onChange={handleChange} className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600" required />
      <input type="text" name="phone" placeholder="Phone Number" value={customer.phone || ''} onChange={handleChange} className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600" />
      <select name="type" value={customer.type || ''} onChange={handleChange} className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600">
        <option value={CustomerType.RETAIL}>Retail</option>
        <option value={CustomerType.WHOLESALE}>Wholesale</option>
      </select>
      <input type="number" name="creditLimit" placeholder="Credit Limit" value={customer.creditLimit || ''} onChange={handleChange} className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600" />
    </div>
  );
};

const Customers: React.FC<CustomersProps> = ({ customers, setCustomers, bills, payments, setPayments }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);
  const [paymentModalCustomer, setPaymentModalCustomer] = useState<Customer | null>(null);
  const [historyModalCustomer, setHistoryModalCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const openModal = (customer: Partial<Customer> | null = null) => {
    setEditingCustomer(customer || { type: CustomerType.RETAIL, creditLimit: 0, outstandingBalance: 0 });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(false);
  };
  
  const handleSave = () => {
    if (!editingCustomer || !editingCustomer.name) {
      alert("Customer Name is required.");
      return;
    }

    if (editingCustomer.id) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? editingCustomer as Customer : c));
    } else {
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        ...editingCustomer,
      } as Customer;
      setCustomers([...customers, newCustomer]);
    }
    closeModal();
  };

  const openPaymentModal = (customer: Customer) => {
    setPaymentModalCustomer(customer);
    setPaymentAmount(customer.outstandingBalance);
  };
  
  const handleRecordPayment = () => {
    if (!paymentModalCustomer || paymentAmount <= 0) return;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      customerId: paymentModalCustomer.id,
      date: new Date().toISOString(),
      amount: paymentAmount,
    };
    setPayments([...payments, newPayment]);

    setCustomers(customers.map(c => 
      c.id === paymentModalCustomer.id 
        ? { ...c, outstandingBalance: c.outstandingBalance - paymentAmount }
        : c
    ));

    setPaymentModalCustomer(null);
    setPaymentAmount(0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Customer Management</h2>
        <button onClick={() => openModal()} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">Add Customer</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
           <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Outstanding Balance</th>
              <th className="px-6 py-3">Credit Limit</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td className="px-6 py-4 font-medium">{customer.name}</td>
                <td className="px-6 py-4">{customer.type}</td>
                <td className={`px-6 py-4 ${customer.outstandingBalance > 0 ? 'text-red-500 font-bold' : ''}`}>
                  {customer.outstandingBalance.toFixed(2)}
                </td>
                <td className="px-6 py-4">{customer.creditLimit.toFixed(2)}</td>
                <td className="px-6 py-4 flex space-x-2">
                   <button onClick={() => openModal(customer)} className="text-blue-500 hover:text-blue-700" title="Edit Customer"><EditIcon className="w-5 h-5"/></button>
                   {customer.outstandingBalance > 0 && <button onClick={() => openPaymentModal(customer)} className="text-green-500 hover:text-green-700" title="Record Payment"><DollarSignIcon className="w-5 h-5"/></button>}
                   <button onClick={() => setHistoryModalCustomer(customer)} className="text-purple-500 hover:text-purple-700" title="View History"><HistoryIcon className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Add Customer Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCustomer?.id ? "Edit Customer" : "Add New Customer"} footer={
        <>
          <button onClick={closeModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md mr-2">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
        </>
      }>
        {editingCustomer && <CustomerForm customer={editingCustomer} setCustomer={setEditingCustomer} />}
      </Modal>

      {/* Record Payment Modal */}
      <Modal isOpen={!!paymentModalCustomer} onClose={() => setPaymentModalCustomer(null)} title={`Record Payment for ${paymentModalCustomer?.name}`} footer={
        <>
          <button onClick={() => setPaymentModalCustomer(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md mr-2">Cancel</button>
          <button onClick={handleRecordPayment} className="px-4 py-2 bg-green-600 text-white rounded-md">Record Payment</button>
        </>
      }>
        <div className="space-y-4">
            <p>Outstanding Balance: <span className="font-bold text-red-500">{paymentModalCustomer?.outstandingBalance.toFixed(2)}</span></p>
            <label>Payment Amount</label>
            <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(Math.min(parseFloat(e.target.value), paymentModalCustomer?.outstandingBalance || 0))} className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600" />
        </div>
      </Modal>
      
      {/* History Modal */}
      <Modal isOpen={!!historyModalCustomer} onClose={() => setHistoryModalCustomer(null)} title={`History for ${historyModalCustomer?.name}`}>
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold text-lg mb-2">Bills</h3>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {bills.filter(b => b.customerId === historyModalCustomer?.id).map(bill => (
                        <li key={bill.id} className="text-sm p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                            {new Date(bill.date).toLocaleDateString()}: Bill #{bill.billNumber} - Total: {bill.grandTotal.toFixed(2)}, Due: {bill.amountDue.toFixed(2)}
                        </li>
                    ))}
                </ul>
            </div>
             <div>
                <h3 className="font-semibold text-lg mb-2">Payments</h3>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {payments.filter(p => p.customerId === historyModalCustomer?.id).map(payment => (
                        <li key={payment.id} className="text-sm p-2 bg-green-100 dark:bg-green-900/50 rounded-md">
                           {new Date(payment.date).toLocaleDateString()}: Paid {payment.amount.toFixed(2)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Customers;
