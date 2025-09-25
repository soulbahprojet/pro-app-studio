import React from 'react';
import { Button } from '../ui/button';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const FloatingHomeButton = () => {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Link to="/">
        <Button 
          variant="hero" 
          size="sm"
          className="w-12 h-12 rounded-full shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm"
        >
          <Home className="w-5 h-5" />
        </Button>
      </Link>
    </div>
  );
};

export default FloatingHomeButton;
