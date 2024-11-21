import { useState, useEffect } from 'react';
import { auth, firestore } from '@/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const useHomeViewModel = () => {
  const [stocks, setStocks] = useState([]);
  const [error, setError] = useState(null);

  const fetchStocksFromFirebase = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError('No user is logged in.');
      return;
    }

    try {
      const q = query(collection(firestore, 'stocks'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedStocks = querySnapshot.docs.map((doc) => doc.data());
      setStocks(fetchedStocks);
    } catch (err) {
      console.error('Error fetching stocks:', err);
      setError('Failed to fetch stocks.');
    }
  };

  const calculateTotalQuantity = () => 
    stocks.reduce((total, stock) => total + stock.quantity, 0);

  const calculateTotalValue = () => 
    stocks.reduce((total, stock) => total + stock.quantity * stock.purchasePrice, 0);

  return {
    stocks,
    error,
    fetchStocksFromFirebase,
    totalStockQuantity: calculateTotalQuantity(),
    totalStockValue: calculateTotalValue(),
  };
};

export default useHomeViewModel;