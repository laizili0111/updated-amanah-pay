import { useState, useEffect } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  deps?: any[];
  manual?: boolean;
}

export function useApi<T, P extends any[] = []>(
  apiFunction: (...params: P) => Promise<T>,
  options: UseApiOptions<T> = {},
  ...params: P
) {
  const { initialData, deps = [], manual = false } = options;
  
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(!manual);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (...executeParams: P) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiFunction(...(executeParams.length ? executeParams : params));
      // Handle both direct response and response.data patterns
      const responseData = response && typeof response === 'object' && 'data' in response
        ? (response as any).data
        : response;
      setData(responseData);
      return responseData;
    } catch (err: any) {
      console.error('API Error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      const errorObj = new Error(errorMessage);
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!manual) {
      execute(...params).catch(error => {
        console.error('API Effect Error:', error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  return {
    data,
    isLoading,
    error,
    execute,
    setData,
  };
}

export function useLazyApi<T, P extends any[] = []>(
  apiFunction: (...params: P) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  return useApi(apiFunction, { ...options, manual: true });
} 