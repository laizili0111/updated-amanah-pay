
import React from 'react';
import Layout from '@/components/layout/Layout';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import FeaturedCampaigns from '@/components/campaigns/FeaturedCampaigns';
import IslamicPrinciples from '@/components/home/IslamicPrinciples';
import CryptoConverter from '@/components/home/CryptoConverter';
import Testimonials from '@/components/home/Testimonials';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <HowItWorks />
      <FeaturedCampaigns />
      <IslamicPrinciples />
      <CryptoConverter />
      <Testimonials />
      
      <section className="py-16 bg-islamic-accent text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join our community of donors and contribute to important Islamic causes with the security and transparency of blockchain technology.
          </p>
          <Button asChild size="lg" className="bg-islamic-secondary text-islamic-dark hover:bg-islamic-secondary/90">
            <Link to="/campaigns">Start Donating</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
