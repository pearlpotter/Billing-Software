
import React, { useMemo, useState } from 'react';
import { Bill, Product, Customer, CustomerType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReportsProps {
  bills: Bill[];
  products: Product[];
  customers: Customer[];
  onGetSalesInsights: (salesData: string) => Promise<string>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Reports: React.FC<ReportsProps> = ({ bills, products, customers, onGetSalesInsights }) => {
  const [insights, setInsights] = useState('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const stats = useMemo(() => {
    const totalSales = bills.reduce((acc, bill) => acc + bill.grandTotal, 0);
    const retailSales = bills.filter(b => b.customerType === CustomerType.RETAIL).reduce((acc, bill) => acc + bill.grandTotal, 0);
    const wholesaleSales = bills.filter(b => b.customerType === CustomerType.WHOLESALE).reduce((acc, bill) => acc + bill.grandTotal, 0);
    const totalOutstanding = customers.reduce((acc, cust) => acc + cust.outstandingBalance, 0);
    return { totalSales, retailSales, wholesaleSales, totalOutstanding };
  }, [bills, customers]);

  const salesByMonth = useMemo(() => {
    const data: { [key: string]: number } = {};
    bills.forEach(bill => {
      const month = new Date(bill.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!data[month]) data[month] = 0;
      data[month] += bill.grandTotal;
    });
    return Object.entries(data).map(([name, sales]) => ({ name, sales })).reverse();
  }, [bills]);
  
  const salesByType = useMemo(() => [
    { name: 'Retail', value: stats.retailSales },
    { name: 'Wholesale', value: stats.wholesaleSales },
  ], [stats]);

  const agedReceivables = useMemo(() => {
    const today = new Date();
    const bands = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    bills.filter(b => b.amountDue > 0).forEach(bill => {
        const age = (today.getTime() - new Date(bill.date).getTime()) / (1000 * 3600 * 24);
        if (age <= 30) bands['0-30'] += bill.amountDue;
        else if (age <= 60) bands['31-60'] += bill.amountDue;
        else if (age <= 90) bands['61-90'] += bill.amountDue;
        else bands['90+'] += bill.amountDue;
    });
    return Object.entries(bands).map(([name, value]) => ({name, value: value.toFixed(2)}));
  }, [bills]);
  
  const handleGenerateInsights = async () => {
    setIsLoadingInsights(true);
    setInsights('');
    const salesSummary = bills.map(b => ({
      date: b.date,
      total: b.grandTotal,
      type: b.customerType,
      items: b.items.map(i => `${i.name} (x${i.quantity})`).join(', ')
    }));
    const insightsText = await onGetSalesInsights(JSON.stringify(salesSummary));
    setInsights(insightsText);
    setIsLoadingInsights(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"><div className="text-sm text-gray-500">Total Sales</div><div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div></div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"><div className="text-sm text-gray-500">Retail Sales</div><div className="text-2xl font-bold">${stats.retailSales.toFixed(2)}</div></div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"><div className="text-sm text-gray-500">Wholesale Sales</div><div className="text-2xl font-bold">${stats.wholesaleSales.toFixed(2)}</div></div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"><div className="text-sm text-gray-500">Total Outstanding</div><div className="text-2xl font-bold text-red-500">${stats.totalOutstanding.toFixed(2)}</div></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="font-semibold mb-4">Monthly Sales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="font-semibold mb-4">Sales by Customer Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={salesByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {salesByType.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`}/>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="font-semibold mb-4">Aged Receivables</h3>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
              <tr><th className="px-4 py-2 text-left">Aging Bucket</th><th className="px-4 py-2 text-right">Amount Due</th></tr>
            </thead>
            <tbody>
              {agedReceivables.map(item => (
                <tr key={item.name} className="border-b dark:border-gray-700">
                  <td className="px-4 py-2">{item.name} days</td>
                  <td className="px-4 py-2 text-right">${item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold mb-4">AI Sales Insights</h3>
            <button onClick={handleGenerateInsights} disabled={isLoadingInsights} className="bg-purple-600 text-white text-sm font-bold py-1.5 px-3 rounded-md hover:bg-purple-700 disabled:bg-purple-400">
              {isLoadingInsights ? 'Analyzing...' : 'Generate Insights'}
            </button>
          </div>
          {isLoadingInsights && <div className="text-center p-8">Analyzing sales data...</div>}
          {insights && (
            <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">{insights}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
