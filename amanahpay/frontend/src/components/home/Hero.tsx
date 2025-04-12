
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-islamic-pattern overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-islamic-accent/90 to-islamic-primary/90"></div>
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-3xl text-center mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            AmanahPay: Islamic Fundraising with Blockchain Technology
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Support Islamic causes with complete transparency and adherence to Shariah principles through our innovative blockchain-based platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild size="lg" className="bg-islamic-secondary text-islamic-dark hover:bg-islamic-secondary/90">
              <Link to="/campaigns">Explore Campaigns</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20">
              <Link to="/learn">Learn About Islamic Finance</Link>
            </Button>
          </div>
          
          <div className="mt-12 flex items-center justify-center space-x-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-white/80 text-sm">Shariah Compliant</p>
            </div>
            <div className="h-12 w-px bg-white/30"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">0%</p>
              <p className="text-white/80 text-sm">Riba (Interest)</p>
            </div>
            <div className="h-12 w-px bg-white/30"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-white/80 text-sm">Transparency</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
