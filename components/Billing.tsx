
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Product, Customer, BillItem, Bill, CustomerType, PaymentMethod } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BillTemplate } from './BillTemplate';

interface BillingProps {
  products: Product[];
  customers: Customer[];
  onAddBill: (bill: Bill) => void;
}

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const PrinterIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;

const Billing: React.FC<BillingProps> = ({ products, customers, onAddBill }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [amountPaid, setAmountPaid] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastBill, setLastBill] = useState<Bill | null>(null);

  const billTemplateRef = useRef<HTMLDivElement>(null);

  const selectedCustomer = useMemo(() => customers.find(c => c.id === selectedCustomerId), [customers, selectedCustomerId]);
  const isWholesale = selectedCustomer?.type === CustomerType.WHOLESALE;
  
  const filteredProducts = useMemo(() => {
    if (!productSearch) return [];
    return products.filter(p => 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.itemCode.toLowerCase().includes(productSearch.toLowerCase())
    ).slice(0, 5);
  }, [products, productSearch]);

  const subTotal = useMemo(() => billItems.reduce((acc, item) => acc + item.total, 0), [billItems]);
  const discountAmount = useMemo(() => (subTotal * discount) / 100, [subTotal, discount]);
  const grandTotal = useMemo(() => subTotal - discountAmount, [subTotal, discountAmount]);
  const amountDue = useMemo(() => grandTotal - amountPaid, [grandTotal, amountPaid]);

  useEffect(() => {
    if (paymentMethod === PaymentMethod.CASH) {
        setAmountPaid(grandTotal);
    } else {
        setAmountPaid(0);
    }
  }, [grandTotal, paymentMethod]);


  const addProductToBill = (product: Product) => {
    const existingItem = billItems.find(item => item.productId === product.id);
    const rate = isWholesale ? product.wholesalePrice : product.retailPrice;

    if (existingItem) {
      updateItemQuantity(product.id, existingItem.quantity + 1);
    } else {
      setBillItems([...billItems, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        rate,
        total: rate
      }]);
    }
    setProductSearch('');
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    const product = products.find(p => p.id === productId);
    if (!product || quantity > product.stock) {
        alert(`Cannot add more than available stock (${product?.stock})`);
        return;
    }

    setBillItems(billItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity, total: item.rate * quantity }
        : item
    ));
  };
  
  const removeItem = (productId: string) => {
    setBillItems(billItems.filter(item => item.productId !== productId));
  };

  const handleSaveBill = () => {
    if (!selectedCustomerId || billItems.length === 0) {
        alert("Please select a customer and add items to the bill.");
        return;
    }
    
    const finalAmountPaid = paymentMethod === PaymentMethod.CASH ? grandTotal : amountPaid;
    const finalAmountDue = grandTotal - finalAmountPaid;
    
    if (selectedCustomer && finalAmountDue > 0 && (selectedCustomer.outstandingBalance + finalAmountDue > selectedCustomer.creditLimit)) {
        if (!window.confirm("This bill will exceed the customer's credit limit. Continue anyway?")) {
            return;
        }
    }
    
    const billNumber = `INV-${Date.now()}`;
    const newBill: Bill = {
        id: billNumber,
        billNumber,
        date: new Date().toISOString(),
        customerId: selectedCustomerId,
        customerName: selectedCustomer!.name,
        customerType: selectedCustomer!.type,
        items: billItems,
        subTotal,
        discountPercentage: discount,
        discountAmount,
        grandTotal,
        paymentMethod,
        amountPaid: finalAmountPaid,
        amountDue: finalAmountDue,
    };
    
    setIsSaving(true);
    onAddBill(newBill);
    setLastBill(newBill);
    setTimeout(() => { // simulate save
        resetBill();
        setIsSaving(false);
    }, 500);
  };
  
  const resetBill = () => {
    setSelectedCustomerId('');
    setBillItems([]);
    setDiscount(0);
    setPaymentMethod(PaymentMethod.CASH);
    setAmountPaid(0);
  };
  
  const handlePrintBill = async () => {
    if (!lastBill || !billTemplateRef.current) return;
    const canvas = await html2canvas(billTemplateRef.current, { scale: 2 });
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice-${lastBill.billNumber}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
            </select>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Scan or Search Product..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    disabled={!selectedCustomerId}
                />
                {filteredProducts.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md mt-1 shadow-lg">
                        {filteredProducts.map(p => (
                            <li key={p.id} onClick={() => addProductToBill(p)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                                {p.name} (Code: {p.itemCode}) - Stock: {p.stock}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Product</th>
                <th scope="col" className="px-6 py-3">Quantity</th>
                <th scope="col" className="px-6 py-3">Rate</th>
                <th scope="col" className="px-6 py-3">Total</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {billItems.length === 0 ? (
                <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500">Add products to the bill</td>
                </tr>
              ) : billItems.map(item => (
                <tr key={item.productId} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4 font-medium">{item.name}</td>
                  <td className="px-6 py-4">
                    <input 
                      type="number"
                      value={item.quantity}
                      onChange={e => updateItemQuantity(item.productId, parseInt(e.target.value, 10))}
                      className="w-20 p-1 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-6 py-4">{item.rate.toFixed(2)}</td>
                  <td className="px-6 py-4">{item.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => removeItem(item.productId)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-between">
        <div>
            <h3 className="text-xl font-semibold mb-4">Bill Summary</h3>
            <div className="space-y-3 text-lg">
              <div className="flex justify-between"><span>Subtotal:</span><span>{subTotal.toFixed(2)}</span></div>
              <div className="flex justify-between items-center">
                <span>Discount (%):</span>
                <input 
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 p-1 border rounded-md text-right bg-white dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="flex justify-between"><span>Discount Amount:</span><span>- {discountAmount.toFixed(2)}</span></div>
              <hr className="dark:border-gray-600"/>
              <div className="flex justify-between font-bold text-2xl"><span>Grand Total:</span><span>{grandTotal.toFixed(2)}</span></div>
            </div>

            <div className="mt-6">
                <h4 className="font-semibold mb-2">Payment</h4>
                <select 
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 mb-2"
                >
                    <option value={PaymentMethod.CASH}>Cash</option>
                    <option value={PaymentMethod.CREDIT}>Credit</option>
                </select>
                {paymentMethod === PaymentMethod.CREDIT && (
                    <>
                        <label className="block text-sm font-medium mb-1">Amount Paid</label>
                        <input
                            type="number"
                            value={amountPaid}
                            onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)}
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="mt-2 text-lg font-bold text-red-500 flex justify-between">
                            <span>Amount Due:</span>
                            <span>{amountDue.toFixed(2)}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
        
        <div className="mt-6">
            <button
                onClick={handleSaveBill}
                disabled={isSaving || billItems.length === 0 || !selectedCustomerId}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                {isSaving ? 'Saving...' : 'Save Bill'}
            </button>
            {lastBill && (
                <button
                    onClick={handlePrintBill}
                    className="w-full mt-2 bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
                >
                    <PrinterIcon className="w-5 h-5"/> Print Last Bill
                </button>
            )}
        </div>
      </div>
      <div className="hidden">
        <BillTemplate ref={billTemplateRef} bill={lastBill} isRetail={lastBill?.customerType === CustomerType.RETAIL} />
      </div>
    </div>
  );
};

export default Billing;
