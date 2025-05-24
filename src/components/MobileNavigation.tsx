
import React from 'react';
import { Home, History, TrendingUp, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'add', label: 'Home', icon: Home },
    { id: 'history', label: 'History', icon: History },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="mobile-nav md:hidden">
      <div className="flex justify-around items-center px-3 md:px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-2 md:px-3 rounded-lg transition-all duration-200 hover-scale",
                isActive 
                  ? "text-primary bg-primary/10 scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={cn(
                "transition-all duration-200",
                isActive ? "h-5 w-5" : "h-4 w-4"
              )} />
              <span className={cn(
                "text-xs font-medium transition-all duration-200",
                isActive ? "text-primary" : ""
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;
