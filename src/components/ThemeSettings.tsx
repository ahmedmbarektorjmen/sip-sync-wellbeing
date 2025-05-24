
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const ThemeSettings: React.FC = () => {
  const { theme, colorTheme, setTheme, setColorTheme, toggleTheme } = useTheme();

  const colorThemes = [
    { id: 'default', name: 'Ocean Blue', color: 'bg-water-500' },
    { id: 'ocean', name: 'Deep Ocean', color: 'bg-blue-600' },
    { id: 'forest', name: 'Forest Green', color: 'bg-green-600' },
    { id: 'sunset', name: 'Sunset Orange', color: 'bg-orange-500' },
    { id: 'lavender', name: 'Lavender Purple', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dark/Light Mode Toggle */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Appearance</h3>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
            </div>
          </div>

          {/* Color Theme Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Color Theme</h3>
            <div className="grid grid-cols-1 gap-2">
              {colorThemes.map((ct) => (
                <Button
                  key={ct.id}
                  variant={colorTheme === ct.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setColorTheme(ct.id as any)}
                  className="justify-start"
                >
                  <div className={cn("w-4 h-4 rounded-full mr-2", ct.color)} />
                  {ct.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeSettings;
