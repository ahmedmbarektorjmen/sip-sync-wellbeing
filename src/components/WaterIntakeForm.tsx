
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import WaterDrop from "./WaterDrop";
import { toast } from "sonner";
import { PlusIcon, MinusIcon } from "lucide-react";
import { CUP_SIZES, CupSize, UserSettings } from "@/types/water";

interface WaterIntakeFormProps {
  onAddWater: (amount: number) => void;
  settings: UserSettings;
}

const WaterIntakeForm: React.FC<WaterIntakeFormProps> = ({ onAddWater, settings }) => {
  const [customAmount, setCustomAmount] = useState<number>(250);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  
  // Update custom amount when cup size changes
  useEffect(() => {
    if (settings.cupSize) {
      const cupVolume = CUP_SIZES.find(cup => cup.id === settings.cupSize)?.volume || 250;
      setCustomAmount(cupVolume);
    }
  }, [settings.cupSize]);
  
  const handleAddPreset = (amount: number) => {
    onAddWater(amount);
    setSelectedPreset(amount.toString());
    toast.success(`Added ${amount}ml of water!`);
    
    // Reset selection after a delay
    setTimeout(() => {
      setSelectedPreset(null);
    }, 500);
  };
  
  const handleAddCustom = () => {
    if (customAmount > 0) {
      onAddWater(customAmount);
      toast.success(`Added ${customAmount}ml of water!`);
    } else {
      toast.error("Please enter a valid amount greater than 0");
    }
  };
  
  const handleSliderChange = (value: number[]) => {
    setCustomAmount(value[0]);
  };
  
  const adjustAmount = (delta: number) => {
    const newAmount = Math.max(0, Math.min(1000, customAmount + delta));
    setCustomAmount(newAmount);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-water-800">Add Water Intake</h2>
      
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {CUP_SIZES.map((cup) => (
          <div 
            key={cup.id} 
            className={cn(
              "flex flex-col items-center cursor-pointer transition-all transform",
              selectedPreset === cup.volume.toString() ? "scale-110" : "hover:scale-105"
            )}
            onClick={() => handleAddPreset(cup.volume)}
          >
            <div 
              className={cn(
                "relative rounded-lg overflow-hidden border-2 transition-colors",
                selectedPreset === cup.volume.toString() 
                  ? "border-water-500" 
                  : "border-transparent hover:border-water-300"
              )}
            >
              <div 
                className={cn(
                  "w-16 h-16 md:w-20 md:h-20 bg-water-100 flex items-center justify-center",
                )}
              >
                <CupImage size={cup.id} />
              </div>
            </div>
            <div className="mt-1 text-center">
              <div className="font-medium">{cup.label}</div>
              <div className="text-xs text-muted-foreground">{cup.volume}ml</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-4 mb-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full" 
            onClick={() => adjustAmount(-50)}
          >
            <MinusIcon className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <Slider 
              defaultValue={[250]} 
              max={1000} 
              step={10}
              value={[customAmount]}
              onValueChange={handleSliderChange}
              className="[&>span]:bg-water-400 [&>span]:h-2 [&>span]:rounded-full"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-full" 
            onClick={() => adjustAmount(50)}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <Input
            type="number"
            min={0}
            max={1000}
            value={customAmount}
            onChange={(e) => setCustomAmount(Number(e.target.value))}
            className="text-center"
          />
          <span className="text-sm font-medium text-muted-foreground">ml</span>
          <Button 
            className="flex-1 bg-water-500 hover:bg-water-600"
            onClick={handleAddCustom}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

// Cup image component with different sizes
const CupImage = ({ size }: { size: string }) => {
  // Scale factor for cup sizes
  const getHeightScale = () => {
    switch (size) {
      case 'xs': return 0.6;
      case 's': return 0.7;
      case 'm': return 0.8;
      case 'l': return 0.9;
      case 'xl': return 1;
      default: return 0.8;
    }
  };
  
  const heightScale = getHeightScale();
  const waterHeight = `${heightScale * 70}%`;
  
  return (
    <div className="relative w-10 h-14 flex items-center justify-center">
      {/* Cup outline */}
      <div 
        className="absolute w-full border-2 border-water-400 rounded-b-lg overflow-hidden"
        style={{ 
          height: `${heightScale * 100}%`, 
          bottom: 0,
          borderTopLeftRadius: `${3 + (1 - heightScale) * 5}px`,
          borderTopRightRadius: `${3 + (1 - heightScale) * 5}px`
        }}
      >
        {/* Water fill */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-water-400/50"
          style={{ height: waterHeight }}
        />
      </div>
      
      {/* Cup handle */}
      <div 
        className="absolute border-2 border-water-400 rounded-r-full"
        style={{ 
          height: `${heightScale * 40}%`,
          width: '25%',
          right: '-20%',
          top: `${30 + (1 - heightScale) * 10}%`
        }}
      />
    </div>
  );
};

// Helper function for class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export default WaterIntakeForm;
