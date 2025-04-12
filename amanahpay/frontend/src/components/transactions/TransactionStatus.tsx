
import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusType = 'success' | 'pending' | 'failed';

interface TransactionStatusProps {
  status: StatusType;
  className?: string;
  showLabel?: boolean;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({ 
  status, 
  className,
  showLabel = true
}) => {
  return (
    <div className={cn("flex items-center", className)}>
      {status === 'success' && (
        <>
          <CheckCircle2 className="text-green-500 h-5 w-5 mr-1" />
          {showLabel && <span className="text-sm text-green-500">Success</span>}
        </>
      )}
      {status === 'pending' && (
        <>
          <Clock className="text-amber-500 h-5 w-5 mr-1" />
          {showLabel && <span className="text-sm text-amber-500">Processing</span>}
        </>
      )}
      {status === 'failed' && (
        <>
          <AlertCircle className="text-red-500 h-5 w-5 mr-1" />
          {showLabel && <span className="text-sm text-red-500">Failed</span>}
        </>
      )}
    </div>
  );
};

export default TransactionStatus;
