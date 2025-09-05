"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Heart, ArrowLeft, ArrowRight, User, Activity, Stethoscope, FileText } from "lucide-react"
import { updateProfile } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import LoadingSpinner from "@/components/ui/loading-spinner"

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
]

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
]

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
]

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base font-medium">
      {isSubmitting ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Completing Setup...
        </>
      ) : (
        "Complete Setup"
      )}
    </Button>
  )
}

export default function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1)
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
  })

  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      // The first parameter is for previous state, second is the form data
      const result = await updateProfile({}, formData);
      if (result?.error) {
        setSubmitError(result.error);
      } else {
        // On success, the updateProfile function will redirect
        // So we don't need to handle success case here
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  const progress = (currentStep / steps.length) * 100

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked
        ? [...(prev[name as keyof typeof prev] as string[]), value]
        : (prev[name as keyof typeof prev] as string[]).filter((item) => item !== value),
    }))
  }

  const stepVariants = {
    initial: { opacity: 0, x: 50, scale: 0.95 },
    in: { opacity: 1, x: 0, scale: 1 },
    out: { opacity: 0, x: -50, scale: 1.05 },
    transition: { type: "tween", duration: 0.3 },
  }

  const stepTransition = {
    type: 'tween' as const,
    duration: 0.3,
    ease: 'easeInOut' as const
  }

  const progressVariants = {
    initial: { width: 0 },
    animate: { width: `${progress}%` },
  }

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
          <div className="flex items-center justify-center gap-2 mb-4">
            <motion.div
              className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Heart className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <span className="text-2xl font-serif font-semibold text-foreground">Safe Step</span>
          </div>
          <motion.h1
            className="text-3xl font-serif font-bold text-foreground mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Complete Your Health Profile
          </motion.h1>
          <motion.p
            className="text-muted-foreground"
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
            <span className="text-sm font-medium text-foreground">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
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
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
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
                  className={`text-xs text-center ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}
                  animate={{
                    opacity: isActive ? 1 : 0.7,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {step.title}
                </motion.span>
              </div>
            )
          })}
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <CardTitle className="text-xl font-serif">{steps[currentStep - 1].title}</CardTitle>
                <CardDescription>{steps[currentStep - 1].description}</CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {/* Hidden fields to pass all form data */}
                {Object.entries(formData).map(([key, value]) => (
                  <input key={key} type="hidden" name={key} value={Array.isArray(value) ? value.join(",") : value} />
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
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                              placeholder="John Doe"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="age">Age *</Label>
                            <Input
                              id="age"
                              type="number"
                              value={formData.age}
                              onChange={(e) => handleInputChange("age", e.target.value)}
                              placeholder="35"
                              min="1"
                              max="120"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg) *</Label>
                            <Input
                              id="weight"
                              type="number"
                              value={formData.weight}
                              onChange={(e) => handleInputChange("weight", e.target.value)}
                              placeholder="70"
                              min="1"
                              step="0.1"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="height">Height (cm) *</Label>
                            <Input
                              id="height"
                              type="number"
                              value={formData.height}
                              onChange={(e) => handleInputChange("height", e.target.value)}
                              placeholder="175"
                              min="1"
                              step="0.1"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender *</Label>
                          <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                            <SelectTrigger>
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
                          <Label htmlFor="profession">Profession *</Label>
                          <Select
                            value={formData.profession}
                            onValueChange={(value) => handleInputChange("profession", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select profession type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standing">Standing-based work</SelectItem>
                              <SelectItem value="sedentary">Sedentary work</SelectItem>
                              <SelectItem value="active">Active/Physical work</SelectItem>
                              <SelectItem value="mixed">Mixed activity</SelectItem>
                              <SelectItem value="retired">Retired</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="activity_level">Activity Level *</Label>
                          <Select
                            value={formData.activity_level}
                            onValueChange={(value) => handleInputChange("activity_level", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select activity level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                              <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                              <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                              <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                              <SelectItem value="very_active">
                                Very Active (very hard exercise, physical job)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="footwear_type">Primary Footwear Type</Label>
                          <Input
                            id="footwear_type"
                            value={formData.footwear_type}
                            onChange={(e) => handleInputChange("footwear_type", e.target.value)}
                            placeholder="e.g., Athletic shoes, dress shoes, boots"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 3: Medical History */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="diabetes_type">Diabetes Type *</Label>
                          <Select
                            value={formData.diabetes_type}
                            onValueChange={(value) => handleInputChange("diabetes_type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select diabetes type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="type1">Type 1</SelectItem>
                              <SelectItem value="type2">Type 2</SelectItem>
                              <SelectItem value="prediabetic">Pre-diabetic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="diagnosis_date">Diagnosis Date</Label>
                          <Input
                            id="diagnosis_date"
                            type="date"
                            value={formData.diagnosis_date}
                            onChange={(e) => handleInputChange("diagnosis_date", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="blood_sugar_levels">Recent Blood Sugar Level (mg/dL)</Label>
                          <Input
                            id="blood_sugar_levels"
                            type="number"
                            value={formData.blood_sugar_levels}
                            onChange={(e) => handleInputChange("blood_sugar_levels", e.target.value)}
                            placeholder="120"
                            min="1"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label>Pre-existing Conditions</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {preExistingConditions.map((condition) => (
                              <div key={condition} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`condition-${condition}`}
                                  checked={formData.pre_existing_conditions.includes(condition)}
                                  onCheckedChange={(checked) =>
                                    handleCheckboxChange("pre_existing_conditions", condition, checked as boolean)
                                  }
                                />
                                <Label htmlFor={`condition-${condition}`} className="text-sm">
                                  {condition}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Foot Health */}
                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <Label>Current Foot Symptoms</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {footSymptoms.map((symptom) => (
                              <div key={symptom} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`symptom-${symptom}`}
                                  checked={formData.foot_symptoms.includes(symptom)}
                                  onCheckedChange={(checked) =>
                                    handleCheckboxChange("foot_symptoms", symptom, checked as boolean)
                                  }
                                />
                                <Label htmlFor={`symptom-${symptom}`} className="text-sm">
                                  {symptom}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="prior_injuries">Prior Foot Injuries/Surgeries</Label>
                          <Textarea
                            id="prior_injuries"
                            value={formData.prior_injuries}
                            onChange={(e) => handleInputChange("prior_injuries", e.target.value)}
                            placeholder="Describe any previous foot injuries, surgeries, or treatments..."
                            rows={3}
                          />
                        </div>

                        {submitError && (
                          <p className="text-sm font-medium text-destructive">{submitError}</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </Button>
                  </motion.div>

                  {currentStep < steps.length ? (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button type="button" onClick={nextStep} className="flex items-center gap-2">
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
  )
}
