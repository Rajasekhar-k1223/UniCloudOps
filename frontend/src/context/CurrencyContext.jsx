import React, { createContext, useContext, useState, useEffect } from 'react';
import { IndianRupee, DollarSign } from 'lucide-react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('app_currency') || 'INR';
  });

  const [exchangeRate, setExchangeRate] = useState(83.5);

  useEffect(() => {
    localStorage.setItem('app_currency', currency);
    
    // 🌐 Real-Time Currency Telemetry 🌐
    const fetchRate = async () => {
      try {
        const resp = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await resp.json();
        if (data.rates && data.rates.INR) {
          setExchangeRate(data.rates.INR);
          console.log(`Live Mission Exchange Rate Secured: 1 USD = ${data.rates.INR} INR`);
        }
      } catch (err) {
        console.warn("Currency API Unreachable. Falling back to Tactical Reserve Rate (83.5).");
      }
    };
    fetchRate();
  }, [currency]);

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'INR' : 'USD');
  };

  const getHistoricalRate = (dateStr) => {
    if (!dateStr) return exchangeRate;
    // 📅 Tactical Exchange Mapping (Simulating Jan-May 2026 Drift)
    // Jan: ~82.7, Feb: ~82.9, Mar: ~83.2, Apr: ~83.4, May: ~83.5
    if (dateStr.includes('Jan') || dateStr.includes('-01')) return 82.75;
    if (dateStr.includes('Feb') || dateStr.includes('-02')) return 82.95;
    if (dateStr.includes('Mar') || dateStr.includes('-03')) return 83.15;
    if (dateStr.includes('Apr') || dateStr.includes('-04')) return 83.35;
    return exchangeRate;
  };

  const formatValue = (usdAmount, dateContext = null) => {
    const amount = parseFloat(usdAmount) || 0;
    const rate = dateContext ? getHistoricalRate(dateContext) : exchangeRate;
    
    if (currency === 'INR') {
      return `₹${Math.round(amount * rate).toLocaleString('en-IN')}`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const CurrencyIcon = currency === 'USD' ? DollarSign : IndianRupee;

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, formatValue, CurrencyIcon, exchangeRate, getHistoricalRate }}>
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
