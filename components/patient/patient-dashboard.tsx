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
} from "lucide-react";

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

export default function PatientDashboard() {
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
              Welcome back, John!
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

      {/* Quick Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={cardHoverVariants} whileHover="hover">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Activity className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <p className="text-sm text-gray-600">Today's Steps</p>
                  <p className="text-2xl font-bold text-gray-800">
                    <AnimatedCounter value={8247} />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardHoverVariants} whileHover="hover">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                >
                  <Thermometer className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <p className="text-sm text-gray-600">Avg Temp</p>
                  <p className="text-2xl font-bold text-gray-800">36.2°C</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardHoverVariants} whileHover="hover">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Zap className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <p className="text-sm text-gray-600">Pressure</p>
                  <p className="text-2xl font-bold text-gray-800">Normal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardHoverVariants} whileHover="hover">
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <TrendingUp className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <p className="text-sm text-gray-600">Risk Level</p>
                  <p className="text-2xl font-bold text-gray-800 text-amber-600">
                    Low
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
