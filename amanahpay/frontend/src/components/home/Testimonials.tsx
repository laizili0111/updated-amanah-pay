
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { QuoteIcon } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  imageUrl: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Faith Finance Forward transformed our masjid fundraising efforts. The transparency provided by blockchain technology has increased trust and donations significantly.",
    name: "Ahmad Hassan",
    role: "Masjid Committee Member",
    imageUrl: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    quote: "Being able to donate using cryptocurrency while ensuring Shariah compliance gives me peace of mind. The platform is intuitive and the conversion process is seamless.",
    name: "Fatima Zahra",
    role: "Regular Donor",
    imageUrl: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    quote: "As an imam concerned with the permissibility of modern financial technologies, I've found this platform adheres strictly to Islamic principles while embracing innovation.",
    name: "Sheikh Abdullah",
    role: "Islamic Scholar",
    imageUrl: "https://randomuser.me/api/portraits/men/55.jpg"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-islamic-pattern">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="islamic-heading text-3xl mb-4">What Our Community Says</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from donors, organizations, and Islamic scholars who have experienced our platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <QuoteIcon className="h-8 w-8 text-islamic-secondary mb-4 opacity-80" />
                <p className="text-gray-600 italic mb-6">{testimonial.quote}</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.imageUrl} 
                    alt={testimonial.name} 
                    className="h-12 w-12 rounded-full object-cover mr-4" 
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
