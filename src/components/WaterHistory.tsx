
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import WaterHistoryItem from "./WaterHistoryItem";
import { WaterIntakeEntry } from "@/types/water";

interface WaterHistoryProps {
  entries: WaterIntakeEntry[];
  onRemoveEntry: (id: string) => void;
}

const WaterHistory: React.FC<WaterHistoryProps> = ({ entries, onRemoveEntry }) => {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">No water intake recorded yet.</p>
        <p className="text-sm text-muted-foreground">Add some water to see your history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Today's Intake</h2>
      
      <ScrollArea className="h-[400px] md:h-[350px] pr-4">
        <div className="space-y-1">
          {entries.map((entry, index) => (
            <React.Fragment key={entry.id}>
              <WaterHistoryItem 
                id={entry.id}
                amount={entry.amount} 
                timestamp={entry.timestamp}
                onRemove={onRemoveEntry}
              />
              {index < entries.length - 1 && (
                <Separator className="my-1 bg-border" />
              )}
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default WaterHistory;
