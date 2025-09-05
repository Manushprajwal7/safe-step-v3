"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import AnimatedCounter from "@/components/ui/animated-counter"
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
} from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
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
}

const cardHoverVariants = {
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
}

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <motion.h1
              className="text-2xl font-serif font-bold text-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Welcome back, John!
            </motion.h1>
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Here's your health monitoring overview
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <Heart className="w-3 h-3 mr-1" />
              </motion.div>
              Monitoring Active
            </Badge>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={cardHoverVariants} whileHover="hover">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Activity className="w-4 h-4 text-primary" />
                </motion.div>
                <div>
                  <p className="text-xs text-muted-foreground">Today's Steps</p>
                  <p className="text-lg font-semibold">
                    <AnimatedCounter value={8247} />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardHoverVariants} whileHover="hover">
          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                >
                  <Thermometer className="w-4 h-4 text-accent" />
                </motion.div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Temp</p>
                  <p className="text-lg font-semibold">36.2°C</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardHoverVariants} whileHover="hover">
          <Card className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 border-chart-2/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-8 h-8 bg-chart-2/20 rounded-lg flex items-center justify-center"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Zap className="w-4 h-4 text-chart-2" />
                </motion.div>
                <div>
                  <p className="text-xs text-muted-foreground">Pressure</p>
                  <p className="text-lg font-semibold">Normal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardHoverVariants} whileHover="hover">
          <Card className="bg-gradient-to-br from-chart-4/5 to-chart-4/10 border-chart-4/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-8 h-8 bg-chart-4/20 rounded-lg flex items-center justify-center"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <TrendingUp className="w-4 h-4 text-chart-4" />
                </motion.div>
                <div>
                  <p className="text-xs text-muted-foreground">Risk Level</p>
                  <p className="text-lg font-semibold text-chart-4">Low</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Session */}
        <motion.div variants={itemVariants}>
          <motion.div variants={cardHoverVariants} whileHover="hover">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Clock className="w-5 h-5 text-primary" />
                  </motion.div>
                  Recent Session
                </CardTitle>
                <CardDescription>Your latest monitoring session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium">45 minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="font-medium">Today, 2:30 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Completed
                    </Badge>
                  </motion.div>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="w-full bg-transparent" variant="outline">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Health Goals
                </CardTitle>
                <CardDescription>Track your progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Daily Steps</span>
                    <span className="text-sm text-muted-foreground">
                      <AnimatedCounter value={8247} /> / 10,000
                    </span>
                  </div>
                  <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 1, duration: 1 }}>
                    <Progress value={82} className="h-2" />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Weekly Sessions</span>
                    <span className="text-sm text-muted-foreground">4 / 5</span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1.2, duration: 1 }}
                  >
                    <Progress value={80} className="h-2" />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Blood Sugar Control</span>
                    <span className="text-sm text-muted-foreground">Good</span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1.4, duration: 1 }}
                  >
                    <Progress value={75} className="h-2" />
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
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-chart-3" />
              Health Insights
            </CardTitle>
            <CardDescription>Personalized recommendations for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Great progress on your daily activity!</p>
                <p className="text-xs text-muted-foreground">You've exceeded your step goal 4 days this week.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg border border-accent/10">
              <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Consider scheduling your next session</p>
                <p className="text-xs text-muted-foreground">It's been 2 days since your last monitoring session.</p>
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
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Activity, label: "Start Session" },
                  { icon: Calendar, label: "Schedule" },
                  { icon: Award, label: "Achievements" },
                  { icon: Heart, label: "Health Tips" },
                ].map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                      <action.icon className="w-5 h-5" />
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
