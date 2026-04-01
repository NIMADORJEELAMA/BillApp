import {useState, useEffect, useCallback} from 'react';
import {operationService} from '../services/operationService';

// Hook to fetch monthly data
export const useUsers = (year: number, month: number) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await operationService.getMonthlyAttendance(year, month);
      setData(result);
    } catch (error) {
      console.error('Failed to fetch attendance', error);
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {data, isLoading, refetch: fetchData};
};

// Hook to mark attendance
export const useMarkAttendance = () => {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    {userId, date}: {userId: string; date: string},
    options: {onSuccess?: () => void; onError?: () => void},
  ) => {
    setIsPending(true);
    try {
      await operationService.markAttendance(userId, date);
      options.onSuccess?.();
    } catch (error) {
      options.onError?.();
    } finally {
      setIsPending(false);
    }
  };

  return {mutate, isPending};
};
