
import React from 'react';
import { Check } from 'lucide-react';

const IslamicPrinciples: React.FC = () => {
  const principles = [
    {
      title: 'Riba-Free',
      description: 'All transactions are 100% interest-free, adhering to the Islamic prohibition of Riba.'
    },
    {
      title: 'Transparent',
      description: 'Blockchain technology ensures complete transparency in how your donations are used.'
    },
    {
      title: 'Halal Investments',
      description: 'Funds are only invested in Shariah-compliant projects and businesses.'
    },
    {
      title: 'Zakat Compliant',
      description: 'Our platform helps you track your Zakat obligations and ensure proper distribution.'
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="islamic-heading text-3xl mb-4">
              Islamic Principles at the Core
            </h2>
            <p className="text-gray-600 mb-6">
              Our platform is built on the foundation of Islamic finance principles, ensuring that all transactions adhere to Shariah guidelines while leveraging modern technology for efficiency and transparency.
            </p>
            
            <div className="space-y-4">
              {principles.map((principle, index) => (
                <div key={index} className="flex items-start">
                  <div className="mt-1 mr-4 rounded-full bg-islamic-primary/20 p-1">
                    <Check className="h-5 w-5 text-islamic-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{principle.title}</h3>
                    <p className="text-gray-600">{principle.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <div className="p-4 bg-islamic-primary/10 rounded-lg border border-islamic-primary/30">
                <p className="italic text-gray-700">
                  "O you who believe! Do not consume usury, doubled and multiplied, but fear Allah that you may be successful." 
                  <span className="block mt-2 text-right">— Quran 3:130</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-video bg-islamic-pattern rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1552083974-186346191183?q=80&w=800&auto=format&fit=crop" 
                  alt="Islamic Finance" 
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-islamic-accent/30 rounded-lg"></div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-islamic-secondary text-islamic-dark p-6 rounded-lg shadow-lg max-w-xs">
              <p className="arabic text-2xl mb-2 text-center">بسم الله الرحمن الرحيم</p>
              <p className="text-sm">In the name of Allah, the Most Gracious, the Most Merciful</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IslamicPrinciples;
