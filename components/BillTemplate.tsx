
import React from 'react';
import { Bill, CustomerType } from '../types';

interface BillTemplateProps {
  bill: Bill | null;
  isRetail: boolean;
}

export const BillTemplate = React.forwardRef<HTMLDivElement, BillTemplateProps>(({ bill, isRetail }, ref) => {
  if (!bill) return null;

  const templateTitle = isRetail ? "Retail Invoice" : "Wholesale Invoice";
  const rateHeader = isRetail ? "Retail Rate" : "Wholesale Rate";

  return (
    <div ref={ref} className="p-8 bg-white text-black font-sans">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">INVOICER PRO</h1>
        <p className="text-md">{templateTitle}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
        <div>
          <h2 className="font-bold mb-2">Billed To:</h2>
          <p>{bill.customerName}</p>
        </div>
        <div className="text-right">
          <p><span className="font-bold">Bill No:</span> {bill.billNumber}</p>
          <p><span className="font-bold">Date:</span> {new Date(bill.date).toLocaleDateString()}</p>
        </div>
      </div>

      <table className="w-full text-sm mb-8">
        <thead className="border-b-2 border-black">
          <tr>
            <th className="text-left font-bold p-2">#</th>
            <th className="text-left font-bold p-2">Item Name</th>
            <th className="text-right font-bold p-2">Qty</th>
            <th className="text-right font-bold p-2">{rateHeader}</th>
            <th className="text-right font-bold p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => (
            <tr key={item.productId} className="border-b border-gray-300">
              <td className="p-2">{index + 1}</td>
              <td className="p-2">{item.name}</td>
              <td className="text-right p-2">{item.quantity}</td>
              <td className="text-right p-2">{item.rate.toFixed(2)}</td>
              <td className="text-right p-2">{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end text-sm">
        <div className="w-1/2">
          <div className="flex justify-between p-2">
            <span className="font-bold">Subtotal:</span>
            <span>{bill.subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between p-2">
            <span className="font-bold">Discount ({bill.discountPercentage}%):</span>
            <span>- {bill.discountAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between p-2 text-lg font-bold border-t-2 border-black mt-2">
            <span>Grand Total:</span>
            <span>{bill.grandTotal.toFixed(2)}</span>
          </div>
           <div className="flex justify-between p-2">
            <span className="font-bold">Amount Paid:</span>
            <span>{bill.amountPaid.toFixed(2)}</span>
          </div>
          {bill.amountDue > 0 && (
            <div className="flex justify-between p-2 font-bold text-red-600">
              <span>Amount Due:</span>
              <span>{bill.amountDue.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
      <div className="text-center mt-12 text-xs text-gray-500">
        <p>Thank you for your business!</p>
        <p>Invoicer Pro - Your Business Partner</p>
      </div>
    </div>
  );
});
