
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import WaterDrop from "./WaterDrop";
import { toast } from "sonner";
import { PlusIcon, MinusIcon } from "lucide-react";

interface WaterIntakeFormProps {
  onAddWater: (amount: number) => void;
}

const PRESET_AMOUNTS = [100, 200, 250, 300, 500];

const WaterIntakeForm: React.FC<WaterIntakeFormProps> = ({ onAddWater }) => {
  const [customAmount, setCustomAmount] = useState<number>(250);
  
  const handleAddPreset = (amount: number) => {
    onAddWater(amount);
    toast.success(`Added ${amount}ml of water!`);
  };
  
  const handleAddCustom = () => {
    if (customAmount > 0) {
      onAddWater(customAmount);
      toast.success(`Added ${customAmount}ml of water!`);
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
      
      <div className="flex flex-wrap gap-2 justify-center">
        {PRESET_AMOUNTS.map((amount) => (
          <Button
            key={amount}
            variant="outline"
            className="flex items-center gap-2 h-auto py-3 px-4 border-water-200 hover:bg-water-100 hover:text-water-800"
            onClick={() => handleAddPreset(amount)}
          >
            <WaterDrop size="sm" className="text-water-500" />
            <span>{amount}ml</span>
          </Button>
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

export default WaterIntakeForm;
