import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="text-center">
    <h2 className="text-2xl font-bold">Page Not Found</h2>
    <p className="my-4">Sorry, the page you’re looking for doesn’t exist.</p>
    <Link to="/" className="text-violet-500 hover:underline">Go back to Home</Link>
  </div>
);

export default NotFound;
