"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, type Variants } from "framer-motion";
import AnimatedCounter from "@/components/ui/animated-counter";
import {
  Activity,
  Heart,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Clock,
  Thermometer,
  Zap,
  Target,
  Award,
  User,
  Settings,
  Bell,
  Plus,
  TrendingDown,
  Droplets,
  Footprints,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import HealthMetricsChart from "@/components/charts/health-metrics-chart";
import HealthInsightsChart from "@/components/charts/health-insights-chart";

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

// Sample data for health metrics - in a real app, this would come from the database
const healthMetrics = [
  {
    title: "Blood Sugar",
    value: "120 mg/dL",
    change: "-5%",
    status: "normal",
    icon: Droplets,
  },
  {
    title: "Heart Rate",
    value: "72 bpm",
    change: "-2%",
    status: "good",
    icon: Heart,
  },
  {
    title: "Foot Pressure",
    value: "Normal",
    change: "0%",
    status: "good",
    icon: Footprints,
  },
  {
    title: "Risk Level",
    value: "Low",
    change: "-15%",
    status: "excellent",
    icon: TrendingDown,
  },
];

export default function PatientDashboard() {
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError);
          return;
        }

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", user.id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            // Fallback to email or user ID
            setUserName(user.user_metadata?.full_name || user.email || "User");
          } else if (profile) {
            setUserName(profile.full_name || user.email || "User");
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserName("User");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <motion.div
      className="container mx-auto px-4 py-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <motion.h1
              className="text-2xl font-serif font-bold text-gray-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Welcome back, {loading ? "..." : userName}!
            </motion.h1>
            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Here's your health monitoring overview
            </motion.p>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-200 px-3 py-1"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-4 h-4 mr-1" />
                </motion.div>
                Monitoring Active
              </Badge>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Health Metrics Overview */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.title}
                variants={cardHoverVariants}
                whileHover="hover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{metric.title}</p>
                        <p className="text-xl font-bold text-gray-800 mt-1">
                          {metric.value}
                        </p>
                        <div className="flex items-center mt-2">
                          <span
                            className={`text-xs font-medium ${
                              metric.status === "excellent"
                                ? "text-green-600"
                                : metric.status === "good"
                                ? "text-blue-600"
                                : metric.status === "normal"
                                ? "text-amber-600"
                                : "text-red-600"
                            }`}
                          >
                            {metric.change}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            from last week
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          metric.status === "excellent"
                            ? "bg-green-100 text-green-600"
                            : metric.status === "good"
                            ? "bg-blue-100 text-blue-600"
                            : metric.status === "normal"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Health Metrics Charts */}
      <motion.div variants={itemVariants}>
        <HealthMetricsChart />
      </motion.div>

      {/* Health Insights Charts */}
      <motion.div variants={itemVariants}>
        <HealthInsightsChart />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Session */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <motion.div variants={cardHoverVariants} whileHover="hover">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Clock className="w-5 h-5 text-green-600" />
                  </motion.div>
                  Recent Session
                </CardTitle>
                <CardDescription>
                  Your latest monitoring session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-800">45 minutes</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-gray-800">
                    Today, 2:30 PM
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Status</span>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      Completed
                    </Badge>
                  </motion.div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    View Full Report
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Health Goals */}
        <motion.div variants={itemVariants}>
          <motion.div variants={cardHoverVariants} whileHover="hover">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Target className="w-5 h-5 text-blue-600" />
                  Health Goals
                </CardTitle>
                <CardDescription>Track your progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">
                      Daily Steps
                    </span>
                    <span className="text-sm text-gray-600">
                      <AnimatedCounter value={8247} /> / 10,000
                    </span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 1 }}
                  >
                    <Progress value={82} className="h-2.5 bg-gray-200" />
                  </motion.div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">
                      Weekly Sessions
                    </span>
                    <span className="text-sm text-gray-600">4 / 5</span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1.2, duration: 1 }}
                  >
                    <Progress value={80} className="h-2.5 bg-gray-200" />
                  </motion.div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">
                      Blood Sugar Control
                    </span>
                    <span className="text-sm text-gray-600">Good</span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1.4, duration: 1 }}
                  >
                    <Progress value={75} className="h-2.5 bg-gray-200" />
                  </motion.div>
                </div>

                {/* Quick Action Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-4"
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Set New Goal
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Alerts & Recommendations */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Health Insights
            </CardTitle>
            <CardDescription>
              Personalized recommendations for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
              <div>
                <p className="font-medium text-gray-800">
                  Great progress on your daily activity!
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  You've exceeded your step goal 4 days this week.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
              <div>
                <p className="font-medium text-gray-800">
                  Consider scheduling your next session
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  It's been 2 days since your last monitoring session.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="w-3 h-3 bg-amber-500 rounded-full mt-1.5"></div>
              <div>
                <p className="font-medium text-gray-800">
                  Blood sugar trend analysis
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Your levels are stable but consider reviewing your diet.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <motion.div variants={cardHoverVariants} whileHover="hover">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-800">Quick Actions</CardTitle>
              <CardDescription>Common tasks and features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    icon: Activity,
                    label: "Start Session",
                    color: "bg-green-100 text-green-600",
                  },
                  {
                    icon: Calendar,
                    label: "Schedule",
                    color: "bg-blue-100 text-blue-600",
                  },
                  {
                    icon: Award,
                    label: "Achievements",
                    color: "bg-purple-100 text-purple-600",
                  },
                  {
                    icon: Heart,
                    label: "Health Tips",
                    color: "bg-amber-100 text-amber-600",
                  },
                ].map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      className={`h-auto p-4 flex flex-col gap-2 bg-white border-gray-200 ${action.color} hover:opacity-90`}
                    >
                      <action.icon className="w-6 h-6" />
                      <span className="text-xs font-medium">
                        {action.label}
                      </span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
