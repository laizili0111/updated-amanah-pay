import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CryptoConverter: React.FC = () => {
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('MYR');
  const [toCurrency, setToCurrency] = useState<string>('ETH');
  
  const conversionRates = {
    'MYR-ETH': 0.00011,
    'ETH-MYR': 9090.91
  };
  
  const getConversionRate = (from: string, to: string) => {
    const key = `${from}-${to}`;
    return conversionRates[key as keyof typeof conversionRates] || 0;
  };
  
  const convertedAmount = parseFloat(amount) * getConversionRate(fromCurrency, toCurrency);
  
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="islamic-heading text-3xl mb-4">Crypto Conversion Calculator</h2>
            <p className="text-gray-600">
              See how your Malaysian Ringgit converts to Ethereum for donation purposes.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 md:p-8 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="flex">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="rounded-r-none"
                  />
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger className="w-24 rounded-l-none border-l-0">
                      <SelectValue placeholder="MYR" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MYR">MYR</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-center md:col-span-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleSwap}
                  className="rounded-full h-10 w-10"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Converted Amount</label>
                <div className="flex">
                  <Input
                    type="text"
                    value={isNaN(convertedAmount) ? "0" : convertedAmount.toFixed(6)}
                    readOnly
                    className="bg-gray-100 rounded-r-none"
                  />
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger className="w-24 rounded-l-none border-l-0">
                      <SelectValue placeholder="ETH" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="MYR">MYR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-islamic-primary/10 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Current Exchange Rate:</strong> 1 {fromCurrency} = {getConversionRate(fromCurrency, toCurrency)} {toCurrency}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                These rates are for demonstration purposes only. In a real application, rates would be fetched from a live API.
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              All cryptocurrency transactions are processed on the Ethereum blockchain, ensuring transparency and compliance with Islamic finance principles.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CryptoConverter;
