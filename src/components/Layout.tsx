import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
  fullScreen?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className = '', 
  centered = false, 
  fullScreen = false 
}) => {
  if (fullScreen) {
    return (
      <div className={`min-h-screen ${className}`}>
        {children}
      </div>
    );
  }

  const containerClasses = centered 
    ? "page-container centered-content" 
    : "page-container";

  return (
    <div className={`${containerClasses} ${className}`}>
      {children}
    </div>
  );
};

export const CenteredLayout: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <Layout centered className={className}>
    {children}
  </Layout>
);

export const FullScreenLayout: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <Layout fullScreen className={className}>
    {children}
  </Layout>
);