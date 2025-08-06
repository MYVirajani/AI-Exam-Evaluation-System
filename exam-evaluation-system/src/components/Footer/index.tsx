'use client';

import { Brain } from 'lucide-react';
import { institutionConfig } from '@/config/site';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="w-5 h-5 text-blue-400" />
              <span className="font-bold">{institutionConfig.systemName}</span>
            </div>
            <p className="text-gray-400 text-sm">
              {institutionConfig.name}<br />
              {institutionConfig.department}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">User Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Faculty Training</a></li>
              <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Desk</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Technical Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Submit Feedback</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; 2025 {institutionConfig.name}. Internal Use Only.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
