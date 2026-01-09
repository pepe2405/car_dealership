export interface ExchangeRates {
    GBP: number;
    USD: number;
  }
  
  export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
    const res = await fetch("http://localhost:5001/api/exchange/rates");
    if (!res.ok) throw new Error("Failed to fetch exchange rates");
    return await res.json();
  };
  