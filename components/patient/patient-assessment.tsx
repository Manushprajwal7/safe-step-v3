"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import {
  ClipboardList,
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  Activity,
  Heart,
  Thermometer,
} from "lucide-react"

const assessments = [
  {
    id: 1,
    title: "Daily Foot Check",
    description: "Quick visual and tactile assessment of foot health",
    duration: "5 minutes",
    frequency: "Daily",
    lastCompleted: "Today",
    status: "completed",
    score: 95,
  },
  {
    id: 2,
    title: "Pressure Point Analysis",
    description: "Comprehensive pressure mapping assessment",
    duration: "15 minutes",
    frequency: "Weekly",
    lastCompleted: "2 days ago",
    status: "due",
    score: 88,
  },
  {
    id: 3,
    title: "Sensation Test",
    description: "Neurological assessment for diabetic neuropathy",
    duration: "10 minutes",
    frequency: "Monthly",
    lastCompleted: "1 week ago",
    status: "completed",
    score: 92,
  },
  {
    id: 4,
    title: "Temperature Monitoring",
    description: "Thermal assessment for inflammation detection",
    duration: "8 minutes",
    frequency: "Bi-weekly",
    lastCompleted: "5 days ago",
    status: "upcoming",
    score: 90,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function PatientAssessment() {
  const [selectedAssessment, setSelectedAssessment] = useState<number | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-primary bg-primary/10 border-primary/20"
      case "due":
        return "text-destructive bg-destructive/10 border-destructive/20"
      case "upcoming":
        return "text-chart-3 bg-chart-3/10 border-chart-3/20"
      default:
        return "text-muted-foreground bg-muted/10 border-muted/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle
      case "due":
        return AlertTriangle
      case "upcoming":
        return Clock
      default:
        return ClipboardList
    }
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Health Assessments</h1>
            <p className="text-muted-foreground">Track your health with regular assessments</p>
          </div>
          <Button>
            <Play className="w-4 h-4 mr-2" />
            Quick Assessment
          </Button>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-lg font-semibold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-destructive/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Due</p>
                <p className="text-lg font-semibold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 border-chart-3/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-chart-3/20 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-chart-3" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Upcoming</p>
                <p className="text-lg font-semibold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Score</p>
                <p className="text-lg font-semibold">91</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Assessment List */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Available Assessments</CardTitle>
            <CardDescription>Regular health checks to monitor your foot health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assessments.map((assessment) => {
              const StatusIcon = getStatusIcon(assessment.status)
              return (
                <motion.div
                  key={assessment.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedAssessment(assessment.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{assessment.title}</h3>
                        <p className="text-sm text-muted-foreground">{assessment.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {assessment.duration}
                          </span>
                          <span className="text-xs text-muted-foreground">Frequency: {assessment.frequency}</span>
                          <span className="text-xs text-muted-foreground">Last: {assessment.lastCompleted}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">Score: {assessment.score}%</p>
                        <Progress value={assessment.score} className="w-16 h-1 mt-1" />
                      </div>
                      <Badge variant="outline" className={getStatusColor(assessment.status)}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {assessment.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Assessment History */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Assessment History
            </CardTitle>
            <CardDescription>Your recent assessment results and trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Recent Scores</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Daily Foot Check</span>
                    <div className="flex items-center gap-2">
                      <Progress value={95} className="w-16 h-2" />
                      <span className="text-sm font-medium">95%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sensation Test</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-16 h-2" />
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Temperature Monitoring</span>
                    <div className="flex items-center gap-2">
                      <Progress value={90} className="w-16 h-2" />
                      <span className="text-sm font-medium">90%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Health Insights</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <Heart className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Excellent Progress</p>
                      <p className="text-xs text-muted-foreground">
                        Your foot health scores have improved consistently
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg border border-accent/10">
                    <Thermometer className="w-4 h-4 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Temperature Stable</p>
                      <p className="text-xs text-muted-foreground">No signs of inflammation detected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
