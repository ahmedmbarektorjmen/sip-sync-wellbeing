
import React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface WaterHistoryItemProps {
  id: string;
  amount: number;
  timestamp: Date;
  onRemove: (id: string) => void;
  className?: string;
}

const WaterHistoryItem: React.FC<WaterHistoryItemProps> = ({ 
  id,
  amount, 
  timestamp,
  onRemove,
  className 
}) => {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(id);
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg transition-colors",
      "hover:bg-water-100 dark:hover:bg-water-900/20",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="water-drop w-8 h-10 flex items-center justify-center text-white text-xs font-medium">
          <span>{amount}</span>
        </div>
        <div>
          <p className="font-medium">{amount}ml</p>
          <p className="text-xs text-muted-foreground">
            {format(timestamp, "h:mm a")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {format(timestamp, "MMM d")}
        </p>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-600" 
          onClick={handleRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WaterHistoryItem;
