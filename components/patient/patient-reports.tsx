"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
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
} from "lucide-react"

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

export default function PatientReports() {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-primary bg-primary/10 border-primary/20"
      case "medium":
        return "text-chart-3 bg-chart-3/10 border-chart-3/20"
      case "high":
        return "text-destructive bg-destructive/10 border-destructive/20"
      default:
        return "text-muted-foreground bg-muted/10 border-muted/20"
    }
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case "summary":
        return BarChart3
      case "analysis":
        return TrendingUp
      case "progress":
        return CheckCircle
      case "temperature":
        return AlertTriangle
      default:
        return FileText
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
            <h1 className="text-2xl font-serif font-bold text-foreground">Health Reports</h1>
            <p className="text-muted-foreground">View and download your health monitoring reports</p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold text-primary">24</p>
              </div>
              <FileText className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-accent">8</p>
              </div>
              <Calendar className="w-8 h-8 text-accent/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 border-chart-2/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Risk Level</p>
                <p className="text-2xl font-bold text-chart-2">Low</p>
              </div>
              <TrendingDown className="w-8 h-8 text-chart-2/60" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Reports */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Your latest health monitoring reports and analyses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reports.map((report) => {
              const Icon = getReportIcon(report.type)
              return (
                <motion.div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{report.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getRiskColor(report.riskLevel)}>
                      {report.riskLevel} risk
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </motion.div>
              )
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
            <CardDescription>Overview of your health metrics over time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Foot Health Score</span>
                <span className="text-sm text-muted-foreground">85/100</span>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground">Improved by 12% this month</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Assessment</span>
                <span className="text-sm text-muted-foreground">Low Risk</span>
              </div>
              <Progress value={25} className="h-2" />
              <p className="text-xs text-muted-foreground">Maintained low risk for 3 months</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Activity Level</span>
                <span className="text-sm text-muted-foreground">Very Active</span>
              </div>
              <Progress value={92} className="h-2" />
              <p className="text-xs text-muted-foreground">Exceeded goals 4 weeks in a row</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
