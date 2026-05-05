import React, { createContext, useContext, useState, useEffect } from 'react';
import { IndianRupee, DollarSign } from 'lucide-react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('app_currency') || 'INR';
  });

  const exchangeRate = 83; // 1 USD = 83 INR

  useEffect(() => {
    localStorage.setItem('app_currency', currency);
  }, [currency]);

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'INR' : 'USD');
  };

  const formatValue = (usdAmount) => {
    const amount = parseFloat(usdAmount) || 0;
    if (currency === 'INR') {
      return `₹${Math.round(amount * exchangeRate).toLocaleString('en-IN')}`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const CurrencyIcon = currency === 'USD' ? DollarSign : IndianRupee;

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, formatValue, CurrencyIcon, exchangeRate }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
