
import React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CUP_SIZES, ACTIVITY_LEVELS, UserSettings } from "@/types/water";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import WaterDrop from "./WaterDrop";
import { calculateOptimalWaterIntake } from "@/utils/waterCalculation";

interface SetupWizardProps {
  onComplete: (settings: Partial<UserSettings>) => void;
}

const FormSchema = v.object({
  cupSize: v.picklist(['xs', 's', 'm', 'l', 'xl']),
  age: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(120)),
  gender: v.picklist(['male', 'female']),
  weight: v.pipe(v.number(), v.minValue(1), v.maxValue(500)),
  height: v.pipe(v.number(), v.minValue(100), v.maxValue(250)),
  activityLevel: v.picklist(['sedentary', 'light', 'moderate', 'intense']),
  calculationMode: v.picklist(['automatic', 'manual']),
  manualGoal: v.optional(v.pipe(v.number(), v.minValue(500), v.maxValue(5000))),
  smartScheduling: v.optional(v.boolean()),
  wakeTime: v.optional(v.string()),
  sleepTime: v.optional(v.string()),
});

type FormData = v.InferInput<typeof FormSchema>;

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  
  const form = useForm<FormData>({
    defaultValues: {
      cupSize: 'm',
      age: undefined,
      gender: 'male',
      weight: undefined,
      height: undefined,
      activityLevel: 'moderate',
      calculationMode: 'automatic',
      manualGoal: 2000,
      smartScheduling: false,
      wakeTime: '08:00',
      sleepTime: '22:00',
    },
  });
  
  const onSubmit = (data: FormData) => {
    try {
      const validatedData = v.parse(FormSchema, data);
      
      let dailyWaterInMl: number;
      
      if (validatedData.calculationMode === 'automatic') {
        dailyWaterInMl = calculateOptimalWaterIntake({
          age: validatedData.age,
          gender: validatedData.gender,
          weight: validatedData.weight,
          height: validatedData.height,
          activityLevel: validatedData.activityLevel
        });
      } else {
        dailyWaterInMl = validatedData.manualGoal || 2000;
      }
      
      // Calculate reminder interval based on awake hours if smart scheduling is enabled
      let reminderInterval = 60; // default 1 hour
      
      if (validatedData.smartScheduling && validatedData.wakeTime && validatedData.sleepTime) {
        const [wakeHour, wakeMin] = validatedData.wakeTime.split(':').map(Number);
        const [sleepHour, sleepMin] = validatedData.sleepTime.split(':').map(Number);
        
        const wakeMinutes = wakeHour * 60 + wakeMin;
        const sleepMinutes = sleepHour * 60 + sleepMin;
        
        let awakeMinutes = sleepMinutes - wakeMinutes;
        if (awakeMinutes <= 0) {
          awakeMinutes += 24 * 60; // Handle overnight sleep
        }
        
        const selectedCupSize = CUP_SIZES.find(cup => cup.id === validatedData.cupSize)!;
        const numberOfCups = Math.ceil(dailyWaterInMl / selectedCupSize.volume);
        
        reminderInterval = Math.floor(awakeMinutes / (numberOfCups + 1));
        reminderInterval = Math.max(30, Math.min(120, reminderInterval)); // Between 30 min and 2 hours
      }
      
      onComplete({
        ...validatedData,
        dailyGoal: dailyWaterInMl,
        reminderInterval,
        reminderEnabled: true,
        setupCompleted: true,
      });
    } catch (error) {
      console.error('Validation error:', error);
    }
  };
  
  const nextStep = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };
  
  const prevStep = () => {
    setStep(Math.max(1, step - 1));
  };
  
  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-center text-water-800">Choose your water cup size</CardTitle>
              <CardDescription className="text-center">Select the cup you typically use to drink water</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="cupSize"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup 
                        className="flex flex-col space-y-2" 
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        {CUP_SIZES.map((cup) => (
                          <div key={cup.id} className="flex items-center space-x-2 border border-water-200 p-3 rounded-lg hover:bg-water-50 transition-colors">
                            <RadioGroupItem id={`cup-${cup.id}`} value={cup.id} />
                            <Label htmlFor={`cup-${cup.id}`} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <WaterDrop size="sm" className="text-water-500" />
                                  <span className="font-medium">{cup.label}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">({cup.volume} ml)</span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </>
        );
        
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-center text-water-800">Personal Information</CardTitle>
              <CardDescription className="text-center">Your age and gender help us calculate your ideal water intake</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter your age" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        className="flex gap-4" 
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem id="gender-male" value="male" />
                          <Label htmlFor="gender-male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem id="gender-female" value="female" />
                          <Label htmlFor="gender-female">Female</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </>
        );
        
      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-center text-water-800">Physical Information</CardTitle>
              <CardDescription className="text-center">Weight and height are important factors in determining water needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter your weight" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter your height" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </>
        );
        
      case 4:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-center text-water-800">Activity Level</CardTitle>
              <CardDescription className="text-center">How active are you on a regular basis?</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup 
                        className="flex flex-col space-y-2" 
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        {ACTIVITY_LEVELS.map((level) => (
                          <div key={level.id} className="flex items-center space-x-2 border border-water-200 p-3 rounded-lg hover:bg-water-50 transition-colors">
                            <RadioGroupItem id={`activity-${level.id}`} value={level.id} />
                            <Label htmlFor={`activity-${level.id}`} className="cursor-pointer">{level.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </>
        );

      case 5:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-center text-water-800">Water Goal Calculation</CardTitle>
              <CardDescription className="text-center">Choose how your daily water goal is calculated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="calculationMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calculation Mode</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        className="flex flex-col space-y-3" 
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <div className="flex items-start space-x-2 border border-water-200 p-3 rounded-lg hover:bg-water-50 transition-colors">
                          <RadioGroupItem id="calc-auto" value="automatic" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="calc-auto" className="cursor-pointer font-medium">
                              Automatic Calculation
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Goal adjusts based on your personal factors and weather
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2 border border-water-200 p-3 rounded-lg hover:bg-water-50 transition-colors">
                          <RadioGroupItem id="calc-manual" value="manual" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="calc-manual" className="cursor-pointer font-medium">
                              Manual Goal
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Set a fixed daily water goal
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('calculationMode') === 'manual' && (
                <FormField
                  control={form.control}
                  name="manualGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Water Goal (ml)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter your daily goal" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </>
        );

      case 6:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-center text-water-800">Smart Scheduling</CardTitle>
              <CardDescription className="text-center">Set your sleep schedule for smarter reminders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="smartScheduling"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Enable Smart Scheduling</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Only receive reminders during your awake hours
                    </p>
                  </FormItem>
                )}
              />

              {form.watch('smartScheduling') && (
                <>
                  <FormField
                    control={form.control}
                    name="wakeTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wake Up Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sleepTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sleep Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </>
        );
        
      default:
        return null;
    }
  };
  
  const isLastStep = step === 6;
  
  return (
    <div className="min-h-screen water-wave-bg flex items-center justify-center p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md">
          <Card className="glass-card border-water-200/50">
            {getStepContent()}
            <CardFooter className="flex justify-between">
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                >
                  Back
                </Button>
              )}
              <div className={`${step === 1 ? 'w-full' : ''}`}>
                <Button 
                  type="button" 
                  className="w-full bg-water-500 hover:bg-water-600"
                  onClick={nextStep}
                >
                  {isLastStep ? 'Complete Setup' : 'Next'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default SetupWizard;
