
import React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface WaterHistoryItemProps {
  amount: number;
  timestamp: Date;
  className?: string;
}

const WaterHistoryItem: React.FC<WaterHistoryItemProps> = ({ 
  amount, 
  timestamp, 
  className 
}) => {
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
      <p className="text-sm text-muted-foreground">
        {format(timestamp, "MMM d")}
      </p>
    </div>
  );
};

export default WaterHistoryItem;
