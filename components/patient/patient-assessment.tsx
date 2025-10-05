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
  ClipboardList,
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  Activity,
  Heart,
  Thermometer,
  TrendingUp,
  Calendar,
  Zap,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import AnimatedCounter from "@/components/ui/animated-counter";

// Define the assessment data type
interface Assessment {
  id: string;
  user_id: string;
  check_date: string;
  symptoms: string[];
  feeling: string;
  notes: string;
  score: number;
  duration: number;
  assessment_type: string;
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

export default function PatientAssessment() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchAssessments = async () => {
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

        // Use the same pattern as the working reports component
        const { data, error } = await supabase
          .from("assessments")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          throw new Error(error.message);
        }

        // Sort by check_date descending
        const sortedData = (data || []).sort(
          (a: Assessment, b: Assessment) =>
            new Date(b.check_date).getTime() - new Date(a.check_date).getTime()
        );

        setAssessments(sortedData);
      } catch (err) {
        console.error("Error fetching assessments:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-primary bg-primary/10 border-primary/20";
      case "due":
        return "text-destructive bg-destructive/10 border-destructive/20";
      case "upcoming":
        return "text-chart-3 bg-chart-3/10 border-chart-3/20";
      default:
        return "text-muted-foreground bg-muted/10 border-muted/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "due":
        return AlertTriangle;
      case "upcoming":
        return Clock;
      default:
        return ClipboardList;
    }
  };

  // Calculate statistics from assessments
  const calculateStats = () => {
    if (assessments.length === 0)
      return { completed: 0, due: 0, upcoming: 0, avgScore: 0 };

    const completed = assessments.filter((a) => a.score !== null).length;
    const avgScore =
      assessments.reduce((sum, a) => sum + (a.score || 0), 0) /
      assessments.length;

    // For demo purposes, we'll calculate due and upcoming based on dates
    const today = new Date();
    const due = assessments.filter((a) => {
      const daysDiff = differenceInDays(new Date(a.check_date), today);
      return daysDiff < 0 && daysDiff > -7; // Due in the last week
    }).length;

    const upcoming = assessments.filter((a) => {
      const daysDiff = differenceInDays(new Date(a.check_date), today);
      return daysDiff > 0 && daysDiff < 7; // Upcoming in the next week
    }).length;

    return { completed, due, upcoming, avgScore: Math.round(avgScore) };
  };

  const stats = calculateStats();

  // Get feeling color
  const getFeelingColor = (feeling: string) => {
    switch (feeling) {
      case "good":
        return "text-green-600 bg-green-100";
      case "okay":
        return "text-amber-600 bg-amber-100";
      case "bad":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Get feeling icon
  const getFeelingIcon = (feeling: string) => {
    switch (feeling) {
      case "good":
        return Heart;
      case "okay":
        return Activity;
      case "bad":
        return AlertTriangle;
      default:
        return ClipboardList;
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
              Health Assessments
            </motion.h1>
            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Track your health with regular assessments
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Button className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Quick Assessment
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <motion.div variants={cardHoverVariants} whileHover="hover">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-lg font-semibold">
                    <AnimatedCounter value={stats.completed} />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardHoverVariants} whileHover="hover">
          <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-destructive/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Due</p>
                  <p className="text-lg font-semibold">
                    <AnimatedCounter value={stats.due} />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardHoverVariants} whileHover="hover">
          <Card className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 border-chart-3/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-chart-3/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-chart-3" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                  <p className="text-lg font-semibold">
                    <AnimatedCounter value={stats.upcoming} />
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
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                  <p className="text-lg font-semibold">
                    <AnimatedCounter value={stats.avgScore} />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Assessment Trends */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Assessment Trends
            </CardTitle>
            <CardDescription>
              Your health assessment scores over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg">
              <div className="text-center">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Assessment trend visualization will appear here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete more assessments to see trends
                </p>
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
            <CardDescription>
              Regular health checks to monitor your foot health
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assessments.length > 0 ? (
              assessments.map((assessment) => {
                const StatusIcon = getFeelingIcon(assessment.feeling);
                const daysAgo = differenceInDays(
                  new Date(),
                  new Date(assessment.check_date)
                );
                const status =
                  daysAgo === 0
                    ? "completed"
                    : daysAgo < 0
                    ? "upcoming"
                    : "due";

                return (
                  <motion.div
                    key={assessment.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setSelectedAssessment(assessment.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <ClipboardList className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {assessment.assessment_type || "Health Assessment"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {assessment.notes || "No description provided"}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {format(
                                new Date(assessment.check_date),
                                "MMM d, yyyy"
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              <Zap className="w-3 h-3 inline mr-1" />
                              {assessment.duration || 0} min
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {daysAgo === 0
                                ? "Today"
                                : daysAgo > 0
                                ? `${daysAgo} days ago`
                                : `In ${Math.abs(daysAgo)} days`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Score: {assessment.score || "N/A"}
                          </p>
                          {assessment.score && (
                            <Progress
                              value={assessment.score}
                              className="w-16 h-1 mt-1"
                            />
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={getFeelingColor(assessment.feeling)}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {assessment.feeling}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Play className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Assessments Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete your first health assessment to get started
                </p>
                <Button>
                  <Play className="w-4 h-4 mr-2" />
                  Start Assessment
                </Button>
              </div>
            )}
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
            <CardDescription>
              Your recent assessment results and trends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Recent Scores</h4>
                <div className="space-y-3">
                  {assessments.slice(0, 3).map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">
                        {assessment.assessment_type || "Assessment"} -{" "}
                        {format(new Date(assessment.check_date), "MMM d")}
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={assessment.score || 0}
                          className="w-16 h-2"
                        />
                        <span className="text-sm font-medium">
                          {assessment.score || "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                  {assessments.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      No assessments completed yet
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Health Insights</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <Heart className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        Consistent Monitoring
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Regular assessments help track your health progress
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg border border-accent/10">
                    <Thermometer className="w-4 h-4 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Early Detection</p>
                      <p className="text-xs text-muted-foreground">
                        Early signs can be detected through regular monitoring
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
