
import React from 'react';
import { Heart, Coins, PiggyBank, RefreshCw } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Heart className="w-10 h-10 text-islamic-primary" />,
      title: 'Choose a Campaign',
      description: 'Browse through various Shariah-compliant campaigns and choose one that resonates with you.'
    },
    {
      icon: <PiggyBank className="w-10 h-10 text-islamic-primary" />,
      title: 'Make a Donation',
      description: 'Donate using your preferred currency, either traditional (fiat) or cryptocurrency.'
    },
    {
      icon: <RefreshCw className="w-10 h-10 text-islamic-primary" />,
      title: 'Automatic Conversion',
      description: 'Your donation is converted to cryptocurrency if needed, following Islamic finance principles.'
    },
    {
      icon: <Coins className="w-10 h-10 text-islamic-primary" />,
      title: 'Blockchain Security',
      description: 'Your donation is securely recorded on the blockchain, ensuring transparency and accountability.'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="islamic-heading text-3xl mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform combines traditional Islamic values with modern blockchain technology to ensure your donations are secure, transparent, and Shariah-compliant.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-islamic-primary/10 flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
              <div className="mt-4 text-islamic-primary font-bold">Step {index + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
