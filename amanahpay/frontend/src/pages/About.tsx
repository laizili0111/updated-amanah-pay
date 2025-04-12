
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Heart, FileText, Users } from 'lucide-react';

const About = () => {
  return (
    <Layout>
      <div className="bg-islamic-pattern pt-16 pb-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-islamic-accent/90 to-islamic-primary/90"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About Faith Finance Forward</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Bridging traditional Islamic values with modern blockchain technology to revolutionize charitable giving.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="mission">
            <TabsList className="w-full mb-8">
              <TabsTrigger value="mission" className="flex-1">Our Mission</TabsTrigger>
              <TabsTrigger value="principles" className="flex-1">Islamic Principles</TabsTrigger>
              <TabsTrigger value="technology" className="flex-1">Blockchain Technology</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mission">
              <div className="space-y-6">
                <img 
                  src="https://images.unsplash.com/photo-1512632578888-169bbbc64f33?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Our Mission" 
                  className="w-full h-64 object-cover rounded-xl mb-8" 
                />
                
                <div className="prose max-w-none">
                  <h2>Our Vision & Mission</h2>
                  <p>
                    Faith Finance Forward was founded with a clear vision: to create a transparent, accessible, and Shariah-compliant platform that empowers Muslims worldwide to engage in charitable giving with complete confidence.
                  </p>
                  <p>
                    Our mission is to bridge the gap between traditional Islamic values and modern technology, leveraging blockchain to ensure that every donation is traceable, every campaign is authentic, and every transaction adheres to Islamic financial principles.
                  </p>
                  
                  <h3>Our Core Values</h3>
                  <ul>
                    <li><strong>Transparency:</strong> Complete visibility into how donations are used and distributed.</li>
                    <li><strong>Integrity:</strong> Strict adherence to Islamic financial principles and ethical standards.</li>
                    <li><strong>Innovation:</strong> Embracing technology to improve the charitable giving experience.</li>
                    <li><strong>Community:</strong> Fostering a global ummah connected through shared values and goals.</li>
                    <li><strong>Accessibility:</strong> Making Islamic charitable giving available to all, regardless of location or technical expertise.</li>
                  </ul>
                  
                  <h3>Our Team</h3>
                  <p>
                    Faith Finance Forward was established by a team of Muslim professionals with backgrounds in Islamic finance, blockchain technology, and charitable organizations. United by our faith and commitment to innovation, we saw an opportunity to transform how Muslims give and how Islamic causes receive support.
                  </p>
                  <p>
                    Our team includes Shariah scholars who ensure compliance with Islamic principles, technologists who develop our secure platform, and community organizers who connect us with meaningful causes worldwide.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="principles">
              <div className="space-y-6">
                <img 
                  src="https://images.unsplash.com/photo-1728294087366-d57768c7e0ec?q=80&w=2057&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Islamic Principles" 
                  className="w-full h-64 object-cover rounded-xl mb-8" 
                />
                
                <div className="prose max-w-none">
                  <h2>Islamic Financial Principles</h2>
                  <p>
                    At Faith Finance Forward, every aspect of our platform is designed to uphold the fundamental principles of Islamic finance. We recognize the importance of ensuring that all donations and transactions comply with Shariah guidelines.
                  </p>
                  
                  <h3>Key Islamic Financial Principles We Uphold:</h3>
                  
                  <h4>1. Prohibition of Riba (Interest)</h4>
                  <p>
                    Our platform is completely free from interest-based transactions. Any funds collected are never invested in interest-bearing instruments, and all financial activities strictly avoid Riba in any form.
                  </p>
                  
                  <h4>2. Zakat Compliance</h4>
                  <p>
                    We provide specialized tools to help Muslims calculate and distribute their Zakat according to Islamic guidelines. Our Zakat campaigns ensure that funds reach eligible recipients as defined by Islamic law.
                  </p>
                  
                  <h4>3. Transparency (Amanah)</h4>
                  <p>
                    Blockchain technology allows us to fulfill the Islamic principle of Amanah (trustworthiness) by providing complete transparency in how funds are collected, managed, and distributed.
                  </p>
                  
                  <h4>4. Ethical Investment (Halal)</h4>
                  <p>
                    Any temporary holding of funds within our system is done in compliance with Halal investment principles, avoiding industries and activities prohibited in Islam.
                  </p>
                  
                  <h3>Shariah Advisory Board</h3>
                  <p>
                    Our platform is regularly reviewed by a board of qualified Islamic scholars who ensure that all aspects of our operations remain Shariah-compliant. They provide guidance on campaign selection, fund management, and technological implementations to maintain adherence to Islamic principles.
                  </p>
                  
                  <div className="p-4 bg-islamic-primary/10 rounded-lg border border-islamic-primary/30 my-6">
                    <p className="italic text-gray-700">
                      "Those who spend their wealth in the way of Allah and then do not follow up what they have spent with reminders of their generosity or with injury, they shall have their reward from their Lord."
                      <span className="block mt-2 text-right">— Quran 2:262</span>
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="technology">
              <div className="space-y-6">
                <img 
                  src="https://images.unsplash.com/photo-1640161704729-cbe966a08476?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Blockchain Technology" 
                  className="w-full h-64 object-cover rounded-xl mb-8" 
                />
                
                <div className="prose max-w-none">
                  <h2>Blockchain Technology</h2>
                  <p>
                    Faith Finance Forward leverages the power of blockchain technology to revolutionize Islamic charitable giving, ensuring unprecedented levels of transparency, security, and efficiency.
                  </p>
                  
                  <h3>How We Use Blockchain</h3>
                  
                  <h4>Transparent Donation Tracking</h4>
                  <p>
                    Every donation made through our platform is recorded on the blockchain, creating an immutable record that can be verified by anyone. This allows donors to track exactly where their funds go and how they are used.
                  </p>
                  
                  <h4>Smart Contracts for Automated Compliance</h4>
                  <p>
                    We use smart contracts to automate the enforcement of Islamic financial principles. These self-executing contracts with the terms directly written into code ensure that funds are only used in ways that comply with Shariah guidelines.
                  </p>
                  
                  <h4>Seamless Fiat-to-Crypto Conversion</h4>
                  <p>
                    Our platform allows donors to contribute using traditional currencies (fiat), which are then automatically converted to cryptocurrencies for blockchain processing. This makes the technology accessible to everyone, regardless of their familiarity with crypto.
                  </p>
                  
                  <h4>Reduced Transaction Costs</h4>
                  <p>
                    By using blockchain technology, we significantly reduce the transaction fees associated with international transfers, ensuring that more of each donation reaches its intended recipient.
                  </p>
                  
                  <h3>Technical Infrastructure</h3>
                  <p>
                    Our platform is built on the Ethereum blockchain, chosen for its established ecosystem and smart contract capabilities. We've implemented additional layers of security and optimization to ensure fast transaction processing and minimal gas fees.
                  </p>
                  
                  <h4>Blockchain-Specific Features:</h4>
                  <ul>
                    <li>Decentralized verification of donation receipt and distribution</li>
                    <li>Multi-signature wallets for enhanced security</li>
                    <li>Optional anonymity for donors who prefer privacy</li>
                    <li>Real-time conversion rates between fiat and cryptocurrencies</li>
                    <li>Automated reporting for zakat and sadaqah tracking</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="islamic-heading text-3xl mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do at Faith Finance Forward.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-islamic-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-islamic-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Islamic Integrity</h3>
              <p className="text-gray-600">Strict adherence to Shariah principles in all financial transactions and operations.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-islamic-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-islamic-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Full Transparency</h3>
              <p className="text-gray-600">Complete visibility into all donations, transactions, and fund allocations through blockchain.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-islamic-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-islamic-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Impact</h3>
              <p className="text-gray-600">Focused on creating meaningful, sustainable change in communities worldwide.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-islamic-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-islamic-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Global Ummah</h3>
              <p className="text-gray-600">Connecting Muslims worldwide through shared values and charitable endeavors.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
