
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WaterIntakeEntry } from "@/types/water";
import { getWeeklyIntakeData, getMonthlyIntakeData } from "@/services/waterDatabase";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartBarIcon, ChartLineIcon } from "lucide-react";

interface HydrationTrendsProps {
  entries: WaterIntakeEntry[];
}

const HydrationTrends: React.FC<HydrationTrendsProps> = ({ entries }) => {
  const [weeklyData, setWeeklyData] = useState<{day: string; amount: number}[]>([]);
  const [monthlyData, setMonthlyData] = useState<{date: string; amount: number}[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const weekly = await getWeeklyIntakeData();
        const monthly = await getMonthlyIntakeData();
        
        setWeeklyData(weekly);
        setMonthlyData(monthly);
      } catch (error) {
        console.error("Error loading trend data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [entries]); // Reload when entries change
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading trends...</div>;
  }
  
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">No data available yet.</p>
        <p className="text-sm text-muted-foreground">Add some water to see your trends.</p>
      </div>
    );
  }

  const chartConfig = {
    water: { label: "Water", color: "#0ea5e9" },
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-water-800">Hydration Trends</h2>
      
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 bg-water-100/50 w-full md:w-60">
          <TabsTrigger value="weekly" className="data-[state=active]:bg-white">
            <span className="flex items-center gap-1">
              <ChartBarIcon className="h-4 w-4" />
              <span>Weekly</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-white">
            <span className="flex items-center gap-1">
              <ChartLineIcon className="h-4 w-4" />
              <span>Monthly</span>
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly" className="mt-0">
          <div className="h-[300px] w-full">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis 
                    label={{ value: 'ml', angle: -90, position: 'insideLeft' }} 
                    width={40}
                  />
                  <Tooltip formatter={(value) => [`${value}ml`, 'Intake']} />
                  <Bar 
                    dataKey="amount" 
                    name="water" 
                    fill="var(--color-water)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="monthly" className="mt-0">
          <div className="h-[300px] w-full">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    label={{ value: 'ml', angle: -90, position: 'insideLeft' }} 
                    width={40}
                  />
                  <Tooltip formatter={(value) => [`${value}ml`, 'Intake']} />
                  <Bar 
                    dataKey="amount" 
                    name="water" 
                    fill="var(--color-water)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HydrationTrends;
