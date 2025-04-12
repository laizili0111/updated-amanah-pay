
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText, BookOpen, HelpCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Learn = () => {
  return (
    <Layout>
      <div className="bg-islamic-pattern pt-16 pb-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-islamic-accent/90 to-islamic-primary/90"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Islamic Finance Education Center</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Learn about Islamic finance principles, blockchain technology, and how they come together for ethical charitable giving.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <Tabs defaultValue="basics">
            <TabsList className="w-full mb-8">
              <TabsTrigger value="basics" className="flex-1">
                <BookOpen className="h-4 w-4 mr-2" />
                Islamic Finance Basics
              </TabsTrigger>
              <TabsTrigger value="blockchain" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Blockchain & Crypto
              </TabsTrigger>
              <TabsTrigger value="faq" className="flex-1">
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQ
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="basics">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Introduction to Islamic Finance</CardTitle>
                    <CardDescription>Fundamental principles and concepts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Learn about the core principles of Islamic finance, including the prohibition of Riba, and how Islamic economics differs from conventional systems.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Read Article</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Understanding Zakat</CardTitle>
                    <CardDescription>The third pillar of Islam</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Explore the purpose and rules of Zakat, including who should pay it, how to calculate it correctly, and who is eligible to receive it.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Read Article</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Sadaqah & Waqf</CardTitle>
                    <CardDescription>Voluntary charity in Islam</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Understand the importance of voluntary charity in Islam, the differences between Sadaqah and Waqf, and their ongoing benefits.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Read Article</Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="flex items-center justify-center mb-8">
                <div className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1604594849809-dfedbc827105?q=80&w=800&auto=format&fit=crop" 
                    alt="Islamic Finance Lecture" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <Button variant="outline" className="bg-white/20 border-white text-white hover:bg-white/40">
                      <Video className="h-5 w-5 mr-2" />
                      Watch Introduction Video
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <h2>Key Islamic Finance Principles</h2>
                <p>
                  Islamic finance is guided by principles derived from Islamic law (Shariah) that emphasize ethical, moral, and socially responsible investing and financial activities. These principles shape how Muslims should handle money, conduct business, and engage in charitable giving.
                </p>
                
                <h3>Prohibition of Riba (Interest)</h3>
                <p>
                  Riba, commonly translated as "interest" or "usury," is strictly prohibited in Islam. This prohibition extends to any unjustified increase in capital, whether through loans or sales. The Quran explicitly condemns riba in several verses, emphasizing its exploitative nature.
                </p>
                <p>
                  In our blockchain-based donation platform, we ensure that all funds are managed in interest-free accounts, and any temporary holding of funds does not generate or involve interest.
                </p>
                
                <h3>Gharar and Maysir (Uncertainty and Gambling)</h3>
                <p>
                  Islamic finance prohibits transactions with excessive uncertainty (gharar) or that resemble gambling (maysir). Contracts must have clarity about what is being exchanged, and transactions should not be speculative in nature.
                </p>
                <p>
                  Our platform mitigates these concerns by providing full transparency about how funds are used and ensuring that campaign goals and fund allocations are clearly defined before donations are collected.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="blockchain">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Blockchain Technology</h2>
                  <p className="text-gray-600 mb-6">
                    Blockchain is a decentralized, distributed ledger technology that records transactions across multiple computers. This makes the data immutable and transparent, as changes require consensus from the network.
                  </p>
                  <p className="text-gray-600 mb-6">
                    For Islamic charitable giving, blockchain offers several key benefits:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-islamic-primary mr-2">•</span>
                      <span>Immutable record of all donations and disbursements</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-islamic-primary mr-2">•</span>
                      <span>Elimination of intermediaries, reducing costs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-islamic-primary mr-2">•</span>
                      <span>Verification that funds reach their intended recipients</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-islamic-primary mr-2">•</span>
                      <span>Smart contracts that enforce Shariah-compliant conditions</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Cryptocurrencies</h2>
                  <p className="text-gray-600 mb-6">
                    Cryptocurrencies are digital or virtual currencies that use cryptography for security. They operate on blockchain technology and offer unique advantages for Islamic charitable giving.
                  </p>
                  <p className="text-gray-600 mb-6">
                    The Shariah compliance of cryptocurrencies is an evolving area with various scholarly opinions. Our platform focuses on using cryptocurrencies as a means of transaction rather than speculation, aligning with Islamic principles.
                  </p>
                  <p className="text-gray-600">
                    We primarily use stablecoins (cryptocurrencies pegged to stable assets) to minimize volatility and ensure that donation values remain consistent throughout the process.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Understanding the Donation Process</h3>
                <ol className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-islamic-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</div>
                    <div>
                      <p className="font-medium">Donation Entry</p>
                      <p className="text-gray-600 text-sm">You make a donation using fiat currency (USD, EUR, etc.) or directly with cryptocurrency.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-islamic-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</div>
                    <div>
                      <p className="font-medium">Conversion (if needed)</p>
                      <p className="text-gray-600 text-sm">If donating with fiat, the system converts your donation to cryptocurrency at the current exchange rate.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-islamic-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</div>
                    <div>
                      <p className="font-medium">Blockchain Recording</p>
                      <p className="text-gray-600 text-sm">The donation is recorded on the blockchain, creating a permanent, verifiable record.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-islamic-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">4</div>
                    <div>
                      <p className="font-medium">Smart Contract Execution</p>
                      <p className="text-gray-600 text-sm">Smart contracts automatically enforce the terms of the donation, ensuring funds are used as intended.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-islamic-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">5</div>
                    <div>
                      <p className="font-medium">Recipient Distribution</p>
                      <p className="text-gray-600 text-sm">The funds are distributed to the campaign recipient according to the smart contract terms.</p>
                    </div>
                  </li>
                </ol>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Blockchain Explorer</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600">
                    Learn how to use blockchain explorers to verify transactions and track your donations.
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">View Guide</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Wallet Security</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600">
                    Best practices for securing your cryptocurrency wallet when making donations.
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">View Guide</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Crypto Glossary</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600">
                    Common terms and definitions in the world of blockchain and cryptocurrencies.
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">View Guide</Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="faq">
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is cryptocurrency Halal in Islam?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600">
                        The permissibility of cryptocurrencies in Islam is a complex topic with varying scholarly opinions. Most scholars agree that cryptocurrencies that have real utility, are not excessively speculative, and are used for legitimate purposes can be considered permissible. 
                      </p>
                      <p className="text-gray-600 mt-2">
                        Our platform uses cryptocurrencies primarily as a medium of exchange and for the transparency benefits of blockchain technology, not for speculative investment. We work with Islamic scholars to ensure our approach aligns with Shariah principles.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How does blockchain ensure my donation is used properly?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600">
                        Blockchain technology creates an immutable record of all transactions, allowing donors to track exactly where their money goes. Our platform implements smart contracts that automatically enforce predetermined conditions for how funds can be used. 
                      </p>
                      <p className="text-gray-600 mt-2">
                        For example, a smart contract might require that funds only be released to a specific organization in stages as project milestones are achieved and verified. All of these transactions are recorded on the public blockchain and can be independently verified.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Can I donate with regular currency instead of cryptocurrency?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600">
                        Yes, absolutely. Our platform accepts traditional currencies like USD, EUR, and GBP. When you donate with fiat currency, our system automatically converts it to cryptocurrency for blockchain processing. This gives you the transparency benefits of blockchain technology without requiring you to own or manage cryptocurrency yourself.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>How do you ensure Zakat is distributed correctly?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600">
                        For Zakat-specific campaigns, we implement strict smart contracts that ensure the funds are only distributed to recipients who qualify under the eight categories eligible for Zakat as defined in Islamic law. 
                      </p>
                      <p className="text-gray-600 mt-2">
                        Our platform works with Islamic scholars to verify recipient eligibility and ensure that 100% of Zakat funds reach their intended beneficiaries. The blockchain record provides complete transparency about who received the Zakat funds and when.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Are there fees associated with donations?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600">
                        Our platform charges a small fee (typically 2-3%) to cover operational costs and blockchain transaction fees (gas fees). This is significantly lower than many traditional charitable platforms.
                      </p>
                      <p className="text-gray-600 mt-2">
                        For Zakat campaigns specifically, we have a separate operational fund from non-Zakat donations to ensure that 100% of Zakat contributions reach eligible recipients, as required by Islamic principles.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6">
                    <AccordionTrigger>Who verifies that campaigns are legitimate?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600">
                        All campaigns on our platform undergo a rigorous verification process before being approved. This includes:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                        <li>Verification of the organization's legal status and charitable credentials</li>
                        <li>Review by our team to ensure the campaign meets our platform's guidelines</li>
                        <li>Assessment for Shariah compliance by qualified Islamic scholars</li>
                        <li>Background checks on campaign organizers</li>
                      </ul>
                      <p className="text-gray-600 mt-2">
                        We also implement a continuous monitoring system to track how funds are used after they're distributed.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <section className="py-16 bg-islamic-pattern">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Have More Questions?</h2>
              <p className="text-gray-600">
                Our team of experts is available to help you understand Islamic finance, blockchain technology, and our platform.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button className="bg-islamic-primary hover:bg-islamic-primary/90">
                <BookOpen className="mr-2 h-4 w-4" />
                Download Learning Guide
              </Button>
              <Button variant="outline">
                <HelpCircle className="mr-2 h-4 w-4" />
                Contact Our Scholars
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Learn;
