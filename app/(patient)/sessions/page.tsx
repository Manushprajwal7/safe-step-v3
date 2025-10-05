"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
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
import { format, differenceInMinutes } from "date-fns";
import { motion, type Variants } from "framer-motion";
import {
  Activity,
  Play,
  Clock,
  CheckCircle,
  Calendar,
  TrendingUp,
  Target,
  Award,
  BarChart3,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";
import AnimatedCounter from "@/components/ui/animated-counter";

// Mock data for session statistics - in a real app, this would come from the database
const sessionStats = {
  totalSessions: 24,
  avgDuration: 32,
  completionRate: 92,
  streak: 7,
};

const recentSessions = [
  {
    id: 1,
    started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    ended_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 32 * 60 * 1000),
    status: "completed",
    note: "Regular checkup",
  },
  {
    id: 2,
    started_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    ended_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 28 * 60 * 1000),
    status: "completed",
    note: "Post-exercise monitoring",
  },
  {
    id: 3,
    started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    ended_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
    status: "completed",
    note: "Extended session",
  },
];

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

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>(recentSessions);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // In a real app, fetch sessions from the database
    const fetchSessions = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSessions(recentSessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Calculate session duration
  const getSessionDuration = (session: any) => {
    if (session.ended_at && session.started_at) {
      return differenceInMinutes(
        new Date(session.ended_at),
        new Date(session.started_at)
      );
    }
    return 0;
  };

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
              Session History
            </motion.h1>
            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Track and analyze your diabetes and arthritis monitoring sessions
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/session">
                <Play className="w-4 h-4 mr-2" />
                Start New Session
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Session Stats Overview */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Total Sessions",
              value: sessionStats.totalSessions,
              icon: Calendar,
              color: "bg-blue-100 text-blue-600",
            },
            {
              title: "Avg. Duration",
              value: `${sessionStats.avgDuration} min`,
              icon: Clock,
              color: "bg-green-100 text-green-600",
            },
            {
              title: "Completion Rate",
              value: `${sessionStats.completionRate}%`,
              icon: CheckCircle,
              color: "bg-purple-100 text-purple-600",
            },
            {
              title: "Current Streak",
              value: `${sessionStats.streak} days`,
              icon: Award,
              color: "bg-amber-100 text-amber-600",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
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
                        <p className="text-sm text-gray-600">{stat.title}</p>
                        <p className="text-xl font-bold text-gray-800 mt-1">
                          <AnimatedCounter
                            value={
                              typeof stat.value === "number"
                                ? stat.value
                                : parseInt(stat.value)
                            }
                          />
                          {typeof stat.value === "string" &&
                          stat.value.includes("%")
                            ? "%"
                            : ""}
                          {typeof stat.value === "string" &&
                          stat.value.includes("min")
                            ? " min"
                            : ""}
                          {typeof stat.value === "string" &&
                          stat.value.includes("days")
                            ? " days"
                            : ""}
                        </p>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}
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

      {/* Progress Tracking */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Monthly Goal Progress
            </CardTitle>
            <CardDescription>
              Track your session completion goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">
                  Sessions Completed
                </span>
                <span className="text-sm text-gray-600">18 / 20</span>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                <Progress value={90} className="h-2.5 bg-gray-200" />
              </motion.div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>2 sessions away from your monthly goal</span>
              <span>90% complete</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Session History */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-primary" />
              Recent Sessions
            </CardTitle>
            <CardDescription>
              Your most recent diabetes and arthritis monitoring sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : sessions && sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session: any) => (
                  <motion.div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {format(new Date(session.started_at), "MMM d, yyyy")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(session.started_at), "h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">
                          {getSessionDuration(session)} min
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Duration
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          session.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : session.status === "active"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {session.status}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/session/${session.id}`}>View</Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your first diabetes and arthritis monitoring session to
                  begin tracking your foot health
                </p>
                <Button asChild>
                  <Link href="/session">
                    <Play className="w-4 h-4 mr-2" />
                    Start Session
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights & Recommendations */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Session Insights
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your session history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
              <div>
                <p className="font-medium text-gray-800">
                  Consistent monitoring pattern
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  You've maintained a regular session schedule this week. Keep
                  it up!
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
              <div>
                <p className="font-medium text-gray-800">
                  Optimal session duration
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Your average session length is in the recommended range for
                  effective monitoring.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="w-3 h-3 bg-amber-500 rounded-full mt-1.5"></div>
              <div>
                <p className="font-medium text-gray-800">
                  Try evening sessions
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Consider adding an evening session to capture post-activity
                  data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
