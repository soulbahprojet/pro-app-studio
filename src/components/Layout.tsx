import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import Header from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import Footer from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import ClientNavigation from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import AppSidebar from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import { Button } from '../ui/button';
import { Shield } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNavigation = true }) => {
  const { user, profile } = useAuth();
  const location = useLocation();
  
  // FORCER la navigation à être TOUJOURS visible partout
  const shouldShowNavigation = true;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar avec navigation admin */}
        {user && <AppSidebar />}
        
        <div className="flex flex-col flex-1">
          {/* Header toujours en haut */}
          <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border">
            <div className="flex items-center">
              {user && <SidebarTrigger className="ml-2" />}
              <Header />
            </div>
          </header>
          
          {/* Contenu principal avec espacement pour header et navigation */}
          <main className={`flex-1 pt-16 ${shouldShowNavigation ? 'pb-20' : 'pb-4'}`}>
            {children}
          </main>
          
          {/* Footer toujours visible en bas */}
          <Footer />
          
          {/* Navigation mobile FORCÉE à être visible partout */}
          {shouldShowNavigation && <ClientNavigation />}
          
          {/* Boutons Admin/PDG flottants accessibles partout */}
          <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
            {/* Bouton Admin */}
            <Button
              onClick={() => {
                // Rediriger vers la page de login admin dédiée
                window.location.href = '/admin-auth';
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-xs font-semibold rounded-full"
            >
              <Shield className="h-3 w-3 mr-1" />
              ADMIN
            </Button>
            
            {/* Bouton PDG */}
            <Button
              onClick={() => {
                // Rediriger vers la page de login PDG pour forcer l'authentification
                window.location.href = '/pdg-login';
              }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-xs font-semibold rounded-full"
            >
              <Shield className="h-3 w-3 mr-1" />
              PDG
            </Button>
            
            {/* Bouton Accès Rapide (nouvelle fonctionnalité) */}
            <Button
              onClick={() => {
                window.location.href = '/quick-auth';
              }}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-xs font-semibold rounded-full"
            >
              <Shield className="h-3 w-3 mr-1" />
              QUICK
            </Button>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
