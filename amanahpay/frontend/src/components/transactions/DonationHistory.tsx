
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import TransactionStatus from './TransactionStatus';
import { Link } from 'react-router-dom';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  campaignName: string;
  campaignId: string;
  status: 'success' | 'pending' | 'failed';
  txHash?: string;
}

interface DonationHistoryProps {
  transactions: Transaction[];
}

const DonationHistory: React.FC<DonationHistoryProps> = ({ transactions }) => {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium">{tx.date}</TableCell>
                <TableCell>
                  <Link to={`/campaigns/${tx.campaignId}`} className="hover:text-islamic-primary">
                    {tx.campaignName}
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  {tx.amount} {tx.currency}
                </TableCell>
                <TableCell>
                  <TransactionStatus status={tx.status} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/transactions/${tx.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No donation history found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DonationHistory;
