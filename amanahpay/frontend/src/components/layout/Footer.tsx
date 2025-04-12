
import React from 'react';
import { Heart, Mail, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-islamic-accent text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <span className="arabic text-islamic-primary font-bold text-lg">صدقة</span>
              </div>
              <span className="text-xl font-bold text-white">AmanahPay</span>
            </Link>
            <p className="text-gray-300 mb-4">
              Empowering Islamic charitable giving through transparent blockchain technology.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-islamic-secondary">
                <Globe size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-islamic-secondary">
                <Mail size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-islamic-secondary">
                <Heart size={20} />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/campaigns" className="text-gray-300 hover:text-white transition-colors">Campaigns</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/learn" className="text-gray-300 hover:text-white transition-colors">Islamic Finance</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Support</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4">Subscribe to our newsletter for updates on campaigns and Islamic finance insights.</p>
            <form className="flex">
              <input type="email" placeholder="Your email" className="px-4 py-2 rounded-l-md w-full focus:outline-none text-islamic-dark" />
              <button type="submit" className="bg-islamic-secondary text-islamic-dark px-4 py-2 rounded-r-md hover:bg-opacity-90 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="islamic-pattern-divider mt-8"></div>
        
        <div className="text-center text-gray-300 text-sm pt-6">
          <p>&copy; {new Date().getFullYear()} AmanahPay. All rights reserved.</p>
          <p className="mt-2">Powered by Blockchain Technology</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
