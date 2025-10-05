"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, type Variants } from "framer-motion";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  User,
  Activity,
  Heart,
  Zap,
  Footprints,
  Thermometer,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import AnimatedCounter from "@/components/ui/animated-counter";

// Define the onboarding data type
interface OnboardingData {
  id: string;
  user_id: string;
  name: string;
  age: number;
  weight_kg: number;
  height_cm: number;
  gender: string;
  profession: string;
  diabetes_type: string;
  diagnosis_date: string;
  foot_symptoms: string[];
  pre_existing_conditions: string[];
  activity_level: string;
  footwear_type: string;
  prior_injuries: string;
  blood_sugar_mgdl: number;
  created_at: string;
  updated_at: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const cardHoverVariants: Variants = {
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

export default function PatientReports() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(userError.message);
        }

        if (!user) {
          throw new Error("No user found");
        }

        const { data, error } = await supabase
          .from("onboarding")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setOnboardingData(data);
      } catch (err) {
        console.error("Error fetching onboarding data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingData();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-primary bg-primary/10 border-primary/20";
      case "medium":
        return "text-chart-3 bg-chart-3/10 border-chart-3/20";
      case "high":
        return "text-destructive bg-destructive/10 border-destructive/20";
      default:
        return "text-muted-foreground bg-muted/10 border-muted/20";
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case "summary":
        return BarChart3;
      case "analysis":
        return TrendingUp;
      case "progress":
        return CheckCircle;
      case "temperature":
        return Thermometer;
      default:
        return FileText;
    }
  };

  // Mock reports data - in a real app, this would come from the database
  const reports = [
    {
      id: 1,
      title: "Weekly Health Summary",
      date: "Dec 15, 2024",
      type: "summary",
      status: "completed",
      riskLevel: "low",
      description: "Comprehensive analysis of your foot health metrics",
    },
    {
      id: 2,
      title: "Pressure Analysis Report",
      date: "Dec 12, 2024",
      type: "analysis",
      status: "completed",
      riskLevel: "medium",
      description: "Detailed pressure point analysis from monitoring session",
    },
    {
      id: 3,
      title: "Monthly Progress Review",
      date: "Dec 1, 2024",
      type: "progress",
      status: "completed",
      riskLevel: "low",
      description: "Monthly overview of health improvements and trends",
    },
    {
      id: 4,
      title: "Temperature Monitoring",
      date: "Nov 28, 2024",
      type: "temperature",
      status: "completed",
      riskLevel: "low",
      description: "Foot temperature analysis and recommendations",
    },
  ];

  // Calculate BMI from weight and height
  const calculateBMI = (weightKg: number, heightCm: number) => {
    if (!weightKg || !heightCm) return null;
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(1);
  };

  // Get BMI category
  const getBMICategory = (bmi: number | null) => {
    if (!bmi) return "Unknown";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  // Get activity level percentage
  const getActivityLevelPercentage = (level: string) => {
    switch (level?.toLowerCase()) {
      case "sedentary":
        return 25;
      case "light":
        return 50;
      case "moderate":
        return 75;
      case "active":
        return 90;
      default:
        return 50;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <motion.h1
              className="text-2xl font-serif font-bold text-gray-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Health Reports
            </motion.h1>
            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              View and download your health monitoring reports
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Patient Profile Summary */}
      {onboardingData && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Patient Profile Summary
              </CardTitle>
              <CardDescription>Your health profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Name
                    </span>
                  </div>
                  <p className="font-medium text-gray-800">
                    {onboardingData.name || "Not provided"}
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Age
                    </span>
                  </div>
                  <p className="font-medium text-gray-800">
                    {onboardingData.age || "Not provided"}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">
                      Diabetes Type
                    </span>
                  </div>
                  <p className="font-medium text-gray-800">
                    {onboardingData.diabetes_type || "Not provided"}
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      Diagnosed
                    </span>
                  </div>
                  <p className="font-medium text-gray-800">
                    {onboardingData.diagnosis_date
                      ? format(
                          new Date(onboardingData.diagnosis_date),
                          "MMM d, yyyy"
                        )
                      : "Not provided"}
                  </p>
                </div>
              </div>

              {onboardingData.weight_kg && onboardingData.height_cm && (
                <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">BMI</p>
                      <p className="text-xl font-bold text-gray-800">
                        {calculateBMI(
                          onboardingData.weight_kg,
                          onboardingData.height_cm
                        )}
                        <span className="text-sm font-normal ml-2 text-gray-600">
                          (
                          {getBMICategory(
                            parseFloat(
                              calculateBMI(
                                onboardingData.weight_kg,
                                onboardingData.height_cm
                              ) || "0"
                            )
                          )}
                          )
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="text-xl font-bold text-gray-800">
                        {onboardingData.weight_kg} kg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Height</p>
                      <p className="text-xl font-bold text-gray-800">
                        {onboardingData.height_cm} cm
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Health Metrics Overview */}
      {onboardingData && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Health Metrics Overview
              </CardTitle>
              <CardDescription>
                Key health indicators based on your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Activity Level</span>
                    <span className="text-sm text-muted-foreground">
                      {onboardingData.activity_level || "Not specified"}
                    </span>
                  </div>
                  <Progress
                    value={getActivityLevelPercentage(
                      onboardingData.activity_level
                    )}
                    className="h-2.5 bg-gray-200"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on your daily activity patterns
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Blood Sugar</span>
                    <span className="text-sm text-muted-foreground">
                      {onboardingData.blood_sugar_mgdl
                        ? `${onboardingData.blood_sugar_mgdl} mg/dL`
                        : "Not provided"}
                    </span>
                  </div>
                  <Progress
                    value={
                      onboardingData.blood_sugar_mgdl
                        ? Math.min(100, onboardingData.blood_sugar_mgdl / 2)
                        : 0
                    }
                    className="h-2.5 bg-gray-200"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Target range: 80-130 mg/dL
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Footprints className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Footwear Type
                    </span>
                  </div>
                  <p className="font-medium text-gray-800">
                    {onboardingData.footwear_type || "Not specified"}
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      Prior Injuries
                    </span>
                  </div>
                  <p className="font-medium text-gray-800">
                    {onboardingData.prior_injuries || "None reported"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Health Conditions */}
      {onboardingData && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Health Conditions
              </CardTitle>
              <CardDescription>
                Reported symptoms and conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    Foot Symptoms
                  </h4>
                  {onboardingData.foot_symptoms &&
                  onboardingData.foot_symptoms.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.foot_symptoms.map((symptom, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-primary/10 text-primary"
                        >
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No symptoms reported
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    Pre-existing Conditions
                  </h4>
                  {onboardingData.pre_existing_conditions &&
                  onboardingData.pre_existing_conditions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.pre_existing_conditions.map(
                        (condition, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-purple-100 text-purple-800"
                          >
                            {condition}
                          </Badge>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No conditions reported
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Summary Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.div variants={cardHoverVariants} whileHover="hover">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold text-primary">
                    <AnimatedCounter value={24} />
                  </p>
                </div>
                <FileText className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardHoverVariants} whileHover="hover">
          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-accent">
                    <AnimatedCounter value={8} />
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-accent/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardHoverVariants} whileHover="hover">
          <Card className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 border-chart-2/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avg Risk Level
                  </p>
                  <p className="text-2xl font-bold text-chart-2">Low</p>
                </div>
                <TrendingDown className="w-8 h-8 text-chart-2/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Reports */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>
              Your latest health monitoring reports and analyses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reports.map((report) => {
              const Icon = getReportIcon(report.type);
              return (
                <motion.div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {report.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {report.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={getRiskColor(report.riskLevel)}
                    >
                      {report.riskLevel} risk
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Health Trends */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Health Trends
            </CardTitle>
            <CardDescription>
              Overview of your health metrics over time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Foot Health Score</span>
                <span className="text-sm text-muted-foreground">85/100</span>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Improved by 12% this month
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Assessment</span>
                <span className="text-sm text-muted-foreground">Low Risk</span>
              </div>
              <Progress value={25} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Maintained low risk for 3 months
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Activity Level</span>
                <span className="text-sm text-muted-foreground">
                  Very Active
                </span>
              </div>
              <Progress value={92} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Exceeded goals 4 weeks in a row
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
