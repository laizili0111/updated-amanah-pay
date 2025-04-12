
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QRCodePaymentProps {
  amount: string;
  currency: string;
  campaignId: string;
}

const QRCodePayment: React.FC<QRCodePaymentProps> = ({ amount, currency, campaignId }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Always use ETH for QR code payments
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=amanahpay:donate?amount=${amount}&currency=ETH&campaign=${campaignId}`;
  
  const handleCopyAddress = () => {
    navigator.clipboard.writeText('0xeB42421a4D55593c5C5A290880961b383397A17E');
    toast.success("Ethereum wallet address copied to clipboard!");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center"
          onClick={() => setIsOpen(true)}
        >
          <QrCode className="mr-2 h-4 w-4" />
          Pay with QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ethereum Payment</DialogTitle>
          <DialogDescription>
            Scan the QR code or copy the Ethereum wallet address to make your donation of {currency} {amount}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center py-4">
          <div className="border p-2 rounded-lg mb-4">
            <img 
              src={qrCodeUrl} 
              alt="QR Code for payment" 
              className="w-56 h-56 object-contain"
            />
          </div>
          <div className="flex flex-col w-full space-y-2">
            <div className="flex items-center justify-between bg-muted p-3 rounded-md">
              <span className="text-sm truncate w-64">0xeB42421a4D55593c5C5A290880961b383397A17E</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
                      Copy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy wallet address</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Transaction will be visible on the Ethereum blockchain once confirmed.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodePayment;
