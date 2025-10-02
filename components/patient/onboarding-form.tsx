"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  ArrowLeft,
  ArrowRight,
  User,
  Activity,
  Stethoscope,
  FileText,
  Calendar,
} from "lucide-react";
import { completeOnboarding } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    title: "Personal Information",
    description: "Tell us about yourself",
    icon: User,
  },
  {
    id: 2,
    title: "Health Profile",
    description: "Your health and activity details",
    icon: Activity,
  },
  {
    id: 3,
    title: "Medical History",
    description: "Diabetes and medical information",
    icon: Stethoscope,
  },
  {
    id: 4,
    title: "Foot Health",
    description: "Specific foot health details",
    icon: FileText,
  },
];

const footSymptoms = [
  "Numbness",
  "Tingling",
  "Ulcers",
  "Swelling",
  "Pain",
  "Burning sensation",
  "Cold feet",
  "Discoloration",
  "Slow healing wounds",
  "Loss of sensation",
];

const preExistingConditions = [
  "Hypertension",
  "Heart disease",
  "Kidney disease",
  "Eye problems",
  "Neuropathy",
  "Poor circulation",
  "Arthritis",
  "Obesity",
  "Depression",
  "Other",
];

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className="w-full h-12 text-base font-medium"
    >
      {isSubmitting ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Completing Setup...
        </>
      ) : (
        "Complete Setup"
      )}
    </Button>
  );
}

export default function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    gender: "",
    profession: "",
    diabetes_type: "",
    diagnosis_date: "",
    foot_symptoms: [] as string[],
    pre_existing_conditions: [] as string[],
    activity_level: "",
    footwear_type: "",
    prior_injuries: "",
    blood_sugar_levels: "",
  });
  const [date, setDate] = useState<Date | undefined>(undefined);

  const router = useRouter();
  const [state, formAction] = useFormState(completeOnboarding, { error: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Update submitError when state.error changes
  useEffect(() => {
    if (state?.error) {
      setSubmitError(state.error);
    }
  }, [state]);

  const progress = (currentStep / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (
    name: string,
    value: string,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked
        ? [...(prev[name as keyof typeof prev] as string[]), value]
        : (prev[name as keyof typeof prev] as string[]).filter(
            (item) => item !== value
          ),
    }));
  };

  const stepVariants = {
    initial: { opacity: 0, x: 50, scale: 0.95 },
    in: { opacity: 1, x: 0, scale: 1 },
    out: { opacity: 0, x: -50, scale: 1.05 },
    transition: { type: "tween", duration: 0.3 },
  };

  const stepTransition = {
    type: "tween" as const,
    duration: 0.3,
    ease: "easeInOut" as const,
  };

  const progressVariants = {
    initial: { width: 0 },
    animate: { width: `${progress}%` },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4"></div>
          <motion.h1
            className="text-3xl font-serif font-bold text-gray-800 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Complete Your Health Profile
          </motion.h1>
          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Help us personalize your monitoring experience
          </motion.p>
        </motion.div>

        {/* Progress */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-800">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-600 rounded-full"
              variants={progressVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Step Indicators */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted
                      ? "bg-green-600 text-white"
                      : isActive
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    rotate: isCompleted ? 360 : 0,
                  }}
                  transition={{
                    duration: 0.3,
                    rotate: { duration: 0.6 },
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <motion.span
                  className={`text-xs text-center font-medium ${
                    isActive ? "text-gray-800" : "text-gray-500"
                  }`}
                  animate={{
                    opacity: isActive ? 1 : 0.7,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {step.title}
                </motion.span>
              </div>
            );
          })}
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <CardTitle className="text-xl font-serif text-gray-800">
                  {steps[currentStep - 1].title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {steps[currentStep - 1].description}
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <form action={formAction}>
                {/* Hidden fields to pass all form data */}
                {Object.entries(formData).map(([key, value]) => (
                  <input
                    key={key}
                    type="hidden"
                    name={key}
                    value={Array.isArray(value) ? value.join(",") : value}
                  />
                ))}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={stepVariants}
                    transition={stepTransition}
                  >
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700">
                              Full Name *
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={(e) =>
                                handleInputChange("name", e.target.value)
                              }
                              placeholder="name"
                              required
                              className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="age" className="text-gray-700">
                              Age *
                            </Label>
                            <Input
                              id="age"
                              name="age"
                              type="number"
                              value={formData.age}
                              onChange={(e) =>
                                handleInputChange("age", e.target.value)
                              }
                              placeholder=""
                              min="1"
                              max="120"
                              required
                              className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="weight" className="text-gray-700">
                              Weight (kg) *
                            </Label>
                            <Input
                              id="weight"
                              name="weight"
                              type="number"
                              value={formData.weight}
                              onChange={(e) =>
                                handleInputChange("weight", e.target.value)
                              }
                              placeholder=""
                              min="1"
                              step="0.1"
                              required
                              className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="height" className="text-gray-700">
                              Height (cm) *
                            </Label>
                            <Input
                              id="height"
                              name="height"
                              type="number"
                              value={formData.height}
                              onChange={(e) =>
                                handleInputChange("height", e.target.value)
                              }
                              placeholder=""
                              min="1"
                              step="0.1"
                              required
                              className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gender" className="text-gray-700">
                            Gender *
                          </Label>
                          <Select
                            name="gender"
                            value={formData.gender}
                            onValueChange={(value) =>
                              handleInputChange("gender", value)
                            }
                          >
                            <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Health Profile */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="profession" className="text-gray-700">
                            Profession *
                          </Label>
                          <Select
                            name="profession"
                            value={formData.profession}
                            onValueChange={(value) =>
                              handleInputChange("profession", value)
                            }
                          >
                            <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                              <SelectValue placeholder="Select profession type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standing">
                                Standing-based work
                              </SelectItem>
                              <SelectItem value="sedentary">
                                Sedentary work
                              </SelectItem>
                              <SelectItem value="active">
                                Active/Physical work
                              </SelectItem>
                              <SelectItem value="mixed">
                                Mixed activity
                              </SelectItem>
                              <SelectItem value="retired">Retired</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="activity_level"
                            className="text-gray-700"
                          >
                            Activity Level *
                          </Label>
                          <Select
                            name="activity_level"
                            value={formData.activity_level}
                            onValueChange={(value) =>
                              handleInputChange("activity_level", value)
                            }
                          >
                            <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                              <SelectValue placeholder="Select activity level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sedentary">
                                Sedentary (little to no exercise)
                              </SelectItem>
                              <SelectItem value="light">
                                Light (light exercise 1-3 days/week)
                              </SelectItem>
                              <SelectItem value="moderate">
                                Moderate (moderate exercise 3-5 days/week)
                              </SelectItem>
                              <SelectItem value="active">
                                Active (hard exercise 6-7 days/week)
                              </SelectItem>
                              <SelectItem value="very_active">
                                Very Active (very hard exercise, physical job)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="footwear_type"
                            className="text-gray-700"
                          >
                            Primary Footwear Type
                          </Label>
                          <Input
                            id="footwear_type"
                            name="footwear_type"
                            value={formData.footwear_type}
                            onChange={(e) =>
                              handleInputChange("footwear_type", e.target.value)
                            }
                            placeholder="e.g., Athletic shoes, dress shoes, boots"
                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 3: Medical History */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="diabetes_type"
                            className="text-gray-700"
                          >
                            Diabetes Type *
                          </Label>
                          <Select
                            name="diabetes_type"
                            value={formData.diabetes_type}
                            onValueChange={(value) =>
                              handleInputChange("diabetes_type", value)
                            }
                          >
                            <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                              <SelectValue placeholder="Select diabetes type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="type1">Type 1</SelectItem>
                              <SelectItem value="type2">Type 2</SelectItem>
                              <SelectItem value="prediabetic">
                                Pre-diabetic
                              </SelectItem>
                              <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="diagnosis_date"
                            className="text-gray-700"
                          >
                            Diagnosis Date
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal border-gray-300 focus:border-green-500 focus:ring-green-500",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {date ? (
                                  format(date, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={date}
                                onSelect={(selectedDate) => {
                                  setDate(selectedDate);
                                  if (selectedDate) {
                                    handleInputChange(
                                      "diagnosis_date",
                                      selectedDate.toISOString().split("T")[0]
                                    );
                                  }
                                }}
                                initialFocus
                                className="rounded-md border"
                              />
                            </PopoverContent>
                          </Popover>
                          <input
                            type="hidden"
                            name="diagnosis_date"
                            value={formData.diagnosis_date}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="blood_sugar_levels"
                            className="text-gray-700"
                          >
                            Recent Blood Sugar Level (mg/dL)
                          </Label>
                          <Input
                            id="blood_sugar_levels"
                            name="blood_sugar_levels"
                            type="number"
                            value={formData.blood_sugar_levels}
                            onChange={(e) =>
                              handleInputChange(
                                "blood_sugar_levels",
                                e.target.value
                              )
                            }
                            placeholder=""
                            min="1"
                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-gray-700">
                            Pre-existing Conditions
                          </Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {preExistingConditions.map((condition) => (
                              <div
                                key={condition}
                                className="flex items-center space-x-3"
                              >
                                <Checkbox
                                  id={`condition-${condition}`}
                                  checked={formData.pre_existing_conditions.includes(
                                    condition
                                  )}
                                  onCheckedChange={(checked) =>
                                    handleCheckboxChange(
                                      "pre_existing_conditions",
                                      condition,
                                      checked as boolean
                                    )
                                  }
                                  className="border-gray-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                />
                                <Label
                                  htmlFor={`condition-${condition}`}
                                  className="text-gray-700 text-sm"
                                >
                                  {condition}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <input
                            type="hidden"
                            name="pre_existing_conditions"
                            value={formData.pre_existing_conditions.join(",")}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 4: Foot Health */}
                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <Label className="text-gray-700">
                            Current Foot Symptoms
                          </Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {footSymptoms.map((symptom) => (
                              <div
                                key={symptom}
                                className="flex items-center space-x-3"
                              >
                                <Checkbox
                                  id={`symptom-${symptom}`}
                                  checked={formData.foot_symptoms.includes(
                                    symptom
                                  )}
                                  onCheckedChange={(checked) =>
                                    handleCheckboxChange(
                                      "foot_symptoms",
                                      symptom,
                                      checked as boolean
                                    )
                                  }
                                  className="border-gray-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                />
                                <Label
                                  htmlFor={`symptom-${symptom}`}
                                  className="text-gray-700 text-sm"
                                >
                                  {symptom}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <input
                            type="hidden"
                            name="foot_symptoms"
                            value={formData.foot_symptoms.join(",")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="prior_injuries"
                            className="text-gray-700"
                          >
                            Prior Foot Injuries/Surgeries
                          </Label>
                          <Textarea
                            id="prior_injuries"
                            name="prior_injuries"
                            value={formData.prior_injuries}
                            onChange={(e) =>
                              handleInputChange(
                                "prior_injuries",
                                e.target.value
                              )
                            }
                            placeholder="Describe any previous foot injuries, surgeries, or treatments..."
                            rows={4}
                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>

                        {submitError && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {submitError}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </Button>
                  </motion.div>

                  {currentStep < steps.length ? (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ) : (
                    <SubmitButton isSubmitting={isSubmitting} />
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
