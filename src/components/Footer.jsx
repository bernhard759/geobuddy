import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
<footer className="bg-slate-700 text-slate-300 p-6 mt-auto text-center w-full">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm">
                <p>GeoBuddy</p>
              </div>

              <div className="flex space-x-4">
                <Link to="/" className="hover:text-orange-500">Home</Link>
                <a href="https://github.com/bernhard759/geobuddy" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500">GitHub</a>
              </div>

              <div className="text-sm">
                <p>Developed by me</p>
              </div>
            </div>
          </div>
        </footer>
);

export default Footer;