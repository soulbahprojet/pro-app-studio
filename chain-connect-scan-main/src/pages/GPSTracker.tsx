import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import GPSTracker from '@/components/GPSTracker';
import Layout from '@/components/Layout';

const GPSTrackerPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/services">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux Services
            </Button>
          </Link>
        </div>
        
        <GPSTracker showMap={true} />
      </div>
    </div>
  );
};

export default GPSTrackerPage;