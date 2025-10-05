"use client";

import { useState } from "react";
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
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Square,
  Activity,
  Thermometer,
  Zap,
  Timer,
  Target,
  AlertTriangle,
} from "lucide-react";

export default function PatientSession() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionData] = useState({
    temperature: 36.2,
    pressure: 85,
    activity: 72,
    riskLevel: "low",
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Live Session
            </h1>
            <p className="text-muted-foreground">
              Real-time diabetes and arthritis foot health monitoring
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              isSessionActive ? "bg-primary/10 text-primary" : "bg-muted"
            }
          >
            {isSessionActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Session Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Session Controls</CardTitle>
            <CardDescription>
              Start, pause, or stop your monitoring session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsSessionActive(!isSessionActive)}
                className={
                  isSessionActive
                    ? "bg-destructive hover:bg-destructive/90"
                    : ""
                }
              >
                {isSessionActive ? (
                  <Pause className="w-4 h-4 mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isSessionActive ? "Pause Session" : "Start Session"}
              </Button>
              <Button variant="outline" disabled={!isSessionActive}>
                <Square className="w-4 h-4 mr-2" />
                Stop Session
              </Button>
              <div className="flex items-center gap-2 ml-auto">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-lg">
                  {Math.floor(sessionTime / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(sessionTime % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Data */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Thermometer className="w-5 h-5 text-primary" />
                Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">
                {sessionData.temperature}°C
              </div>
              <p className="text-sm text-muted-foreground">Normal range</p>
              <Progress value={75} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-accent" />
                Pressure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent mb-2">
                {sessionData.pressure}%
              </div>
              <p className="text-sm text-muted-foreground">Optimal pressure</p>
              <Progress value={sessionData.pressure} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 border-chart-2/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-chart-2" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-2 mb-2">
                {sessionData.activity}%
              </div>
              <p className="text-sm text-muted-foreground">
                Good activity level
              </p>
              <Progress value={sessionData.activity} className="mt-3 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Heatmap Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Pressure Heatmap</CardTitle>
            <CardDescription>
              Real-time visualization of foot pressure distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isSessionActive
                    ? "Live heatmap data will appear here"
                    : "Start a session to view heatmap"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Session Insights
            </CardTitle>
            <CardDescription>
              Real-time analysis and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">
                  Pressure distribution looks good
                </p>
                <p className="text-xs text-muted-foreground">
                  No concerning pressure points detected
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg border border-accent/10">
              <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">
                  Temperature within normal range
                </p>
                <p className="text-xs text-muted-foreground">
                  No signs of inflammation
                </p>
              </div>
            </div>
            {isSessionActive && (
              <div className="flex items-start gap-3 p-3 bg-chart-3/5 rounded-lg border border-chart-3/10">
                <AlertTriangle className="w-4 h-4 text-chart-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Session in progress</p>
                  <p className="text-xs text-muted-foreground">
                    Continue monitoring for best results
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
