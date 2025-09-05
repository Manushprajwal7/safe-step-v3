"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import {
  Users,
  Activity,
  AlertTriangle,
  TrendingUp,
  Calendar,
  FileText,
  Settings,
  Bell,
  BarChart3,
  Heart,
} from "lucide-react"

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

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-semibold text-foreground">Safe Step Admin</h1>
              <p className="text-xs text-muted-foreground">Healthcare Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

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
              <h1 className="text-2xl font-serif font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Monitor patient health and system performance</p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Activity className="w-3 h-3 mr-1" />
              System Active
            </Badge>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Patients</p>
                  <p className="text-lg font-semibold">1,247</p>
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
                  <p className="text-xs text-muted-foreground">Active Sessions</p>
                  <p className="text-lg font-semibold">23</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 border-chart-3/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-chart-3/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-chart-3" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">High Risk</p>
                  <p className="text-lg font-semibold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 border-chart-2/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-chart-2/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-chart-2" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Improvement</p>
                  <p className="text-lg font-semibold">+15%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Alerts */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-chart-3" />
                  Recent Alerts
                </CardTitle>
                <CardDescription>Patients requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                  <div>
                    <p className="font-medium text-sm">John Smith - High Risk</p>
                    <p className="text-xs text-muted-foreground">Unusual pressure patterns detected</p>
                  </div>
                  <Badge variant="destructive">Critical</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-chart-3/5 rounded-lg border border-chart-3/10">
                  <div>
                    <p className="font-medium text-sm">Sarah Johnson - Temperature Alert</p>
                    <p className="text-xs text-muted-foreground">Elevated foot temperature</p>
                  </div>
                  <Badge variant="outline" className="text-chart-3 border-chart-3">
                    Medium
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div>
                    <p className="font-medium text-sm">Mike Davis - Missed Session</p>
                    <p className="text-xs text-muted-foreground">No monitoring for 5 days</p>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary">
                    Low
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Performance */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  System Performance
                </CardTitle>
                <CardDescription>Platform health and usage metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Server Uptime</span>
                    <span className="text-sm text-muted-foreground">99.9%</span>
                  </div>
                  <Progress value={99.9} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Users</span>
                    <span className="text-sm text-muted-foreground">847/1247</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data Processing</span>
                    <span className="text-sm text-muted-foreground">Normal</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Patient Management */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Patient Management
              </CardTitle>
              <CardDescription>Overview of patient status and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Risk Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Low Risk</span>
                      <span className="text-sm font-medium">1,156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medium Risk</span>
                      <span className="text-sm font-medium">83</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Risk</span>
                      <span className="text-sm font-medium">8</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Recent Activity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sessions Today</span>
                      <span className="text-sm font-medium">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Reports Generated</span>
                      <span className="text-sm font-medium">89</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New Registrations</span>
                      <span className="text-sm font-medium">12</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Review
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Bell className="w-4 h-4 mr-2" />
                      Send Alerts
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
