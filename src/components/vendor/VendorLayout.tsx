import React from "react";
import { VendorSidebar } from "./VendorSidebar";

interface VendorLayoutProps {
  children: React.ReactNode;
}

export const VendorLayout = ({ children }: VendorLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <VendorSidebar />
      <main className="flex-1 ml-64 p-6">
        {children}
      </main>
    </div>
  );
};
