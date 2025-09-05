"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Download, CheckCircle, Target } from "lucide-react"

export default function PatientResults() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Session Results</h1>
            <p className="text-muted-foreground">Detailed analysis of your monitoring session</p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>

        {/* Session Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Session Summary
            </CardTitle>
            <CardDescription>Overview of your latest monitoring session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">45:32</p>
                <p className="text-sm text-muted-foreground">Duration</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">92%</p>
                <p className="text-sm text-muted-foreground">Health Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-chart-2">Low</p>
                <p className="text-sm text-muted-foreground">Risk Level</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-chart-4">Normal</p>
                <p className="text-sm text-muted-foreground">Status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pressure Analysis</CardTitle>
              <CardDescription>Foot pressure distribution results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Left Foot Pressure</span>
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Right Foot Pressure</span>
                  <span className="text-sm text-muted-foreground">88%</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Balance Score</span>
                  <span className="text-sm text-muted-foreground">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Temperature Analysis</CardTitle>
              <CardDescription>Thermal monitoring results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Temperature</span>
                  <span className="text-sm text-muted-foreground">36.2°C</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Temperature Stability</span>
                  <span className="text-sm text-muted-foreground">95%</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Hot Spot Detection</span>
                  <span className="text-sm text-muted-foreground">None</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Recommendations
            </CardTitle>
            <CardDescription>Personalized health recommendations based on your results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Excellent session results</p>
                <p className="text-xs text-muted-foreground">
                  Your foot health metrics are within optimal ranges. Continue your current care routine.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg border border-accent/10">
              <TrendingUp className="w-4 h-4 text-accent mt-0.5" />
              <div>
                <p className="text-sm font-medium">Maintain regular monitoring</p>
                <p className="text-xs text-muted-foreground">
                  Schedule your next session in 3-4 days to maintain consistent monitoring.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
