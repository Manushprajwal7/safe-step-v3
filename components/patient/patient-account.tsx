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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { motion, type Variants } from "framer-motion";
import {
  User,
  Settings,
  Bell,
  Shield,
  Heart,
  Edit,
  Save,
  Camera,
  Mail,
  Activity,
  Calendar,
  Award,
  TrendingUp,
  Zap,
  Target,
  DollarSign,
  CreditCard,
  Lock,
  LogOut,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import AnimatedCounter from "@/components/ui/animated-counter";

// Define the profile data type
interface ProfileData {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  age: number;
  weight_kg: number;
  height_cm: number;
  gender: string;
  profession: string;
  diabetes_type: string;
  diagnosis_date: string;
  activity_level: string;
  footwear_type: string;
  blood_sugar_mgdl: number;
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

export default function PatientAccount() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    user_id: "",
    full_name: "",
    email: "",
    phone: "",
    age: 0,
    weight_kg: 0,
    height_cm: 0,
    gender: "",
    profession: "",
    diabetes_type: "",
    diagnosis_date: "",
    activity_level: "",
    footwear_type: "",
    blood_sugar_mgdl: 0,
    created_at: "",
    updated_at: "",
  });

  const [originalProfileData, setOriginalProfileData] =
    useState<ProfileData>(profileData);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReports: true,
    appointmentReminders: true,
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Get current user
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

        // Fetch profile data
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        // Update state with fetched data
        const profile = {
          user_id: data.user_id,
          full_name: data.full_name || "",
          email: user.email || "",
          phone: "",
          age: data.age || 0,
          weight_kg: data.weight_kg || 0,
          height_cm: data.height_cm || 0,
          gender: data.gender || "",
          profession: data.profession || "",
          diabetes_type: data.diabetes_type || "",
          diagnosis_date: data.diagnosis_date || "",
          activity_level: data.activity_level || "",
          footwear_type: data.footwear_type || "",
          blood_sugar_mgdl: data.blood_sugar_mgdl || 0,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        setProfileData(profile);
        setOriginalProfileData(profile);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Update profile data in the database
  const updateProfile = async () => {
    try {
      setLoading(true);

      // Get current user
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

      // Prepare data for update (only include fields that exist in the profiles table)
      const updateData = {
        full_name: profileData.full_name,
        age: profileData.age,
        weight_kg: profileData.weight_kg,
        height_cm: profileData.height_cm,
        gender: profileData.gender,
        profession: profileData.profession,
        diabetes_type: profileData.diabetes_type,
        diagnosis_date: profileData.diagnosis_date,
        activity_level: profileData.activity_level,
        footwear_type: profileData.footwear_type,
        blood_sugar_mgdl: profileData.blood_sugar_mgdl,
      };

      // Update profile data
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) {
        throw new Error(error.message);
      }

      // Update successful, set original data to current data
      setOriginalProfileData(profileData);
      setIsEditing(false);

      // Show success message (in a real app, you might use a toast notification)
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(
        "Error updating profile: " +
          (err instanceof Error ? err.message : "An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate BMI from weight and height
  const calculateBMI = (weightKg: number, heightCm: number) => {
    if (!weightKg || !heightCm) return null;
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(1);
  };

  // Get BMI category
  const getBMICategory = (bmi: number | null) => {
    if (!bmi) return "Unknown";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  // Calculate account age in days
  const getAccountAge = () => {
    if (!profileData.created_at) return 0;
    return differenceInDays(new Date(), new Date(profileData.created_at));
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
            <Heart className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Profile</h3>
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
              Account Settings
            </motion.h1>
            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Manage your profile and preferences
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20"
            >
              <Heart className="w-3 h-3 mr-1" />
              Premium Member
            </Badge>
          </motion.div>
        </div>
      </motion.div>

      {/* Account Statistics */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div variants={cardHoverVariants} whileHover="hover">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Member Since
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {profileData.created_at
                        ? format(new Date(profileData.created_at), "MMM yyyy")
                        : "Unknown"}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardHoverVariants} whileHover="hover">
            <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Health Score
                    </p>
                    <p className="text-lg font-bold text-accent">
                      <AnimatedCounter value={85} />%
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-accent/60" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardHoverVariants} whileHover="hover">
            <Card className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 border-chart-2/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Activity Level
                    </p>
                    <p className="text-lg font-bold text-chart-2">
                      {profileData.activity_level || "Not set"}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-chart-2/60" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardHoverVariants} whileHover="hover">
            <Card className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 border-chart-3/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Account Age</p>
                    <p className="text-lg font-bold text-chart-3">
                      <AnimatedCounter value={getAccountAge()} /> days
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-chart-3/60" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Health Metrics Overview */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Health Metrics Overview
            </CardTitle>
            <CardDescription>
              Your current health statistics and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">BMI</span>
                </div>
                {profileData.weight_kg && profileData.height_cm ? (
                  <>
                    <p className="text-2xl font-bold text-gray-800">
                      {calculateBMI(
                        profileData.weight_kg,
                        profileData.height_cm
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getBMICategory(
                        parseFloat(
                          calculateBMI(
                            profileData.weight_kg,
                            profileData.height_cm
                          ) || "0"
                        )
                      )}
                    </p>
                    <Progress
                      value={Math.min(
                        100,
                        (parseFloat(
                          calculateBMI(
                            profileData.weight_kg,
                            profileData.height_cm
                          ) || "0"
                        ) /
                          40) *
                          100
                      )}
                      className="h-2 mt-2"
                    />
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Not set</p>
                )}
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Blood Sugar
                  </span>
                </div>
                {profileData.blood_sugar_mgdl ? (
                  <>
                    <p className="text-2xl font-bold text-gray-800">
                      {profileData.blood_sugar_mgdl} mg/dL
                    </p>
                    <p className="text-sm text-gray-600">
                      {profileData.blood_sugar_mgdl < 100
                        ? "Normal"
                        : profileData.blood_sugar_mgdl < 126
                        ? "Prediabetic"
                        : "Diabetic"}
                    </p>
                    <Progress
                      value={Math.min(100, profileData.blood_sugar_mgdl / 2)}
                      className="h-2 mt-2"
                    />
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Not set</p>
                )}
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">
                    Diabetes Type
                  </span>
                </div>
                {profileData.diabetes_type ? (
                  <>
                    <p className="text-2xl font-bold text-gray-800 capitalize">
                      {profileData.diabetes_type.replace("type", "Type ")}
                    </p>
                    {profileData.diagnosis_date && (
                      <p className="text-sm text-gray-600">
                        Diagnosed{" "}
                        {format(
                          new Date(profileData.diagnosis_date),
                          "MMM yyyy"
                        )}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Not set</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and health details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src="/placeholder.svg?height=80&width=80" />
                <AvatarFallback className="text-lg">
                  {profileData.full_name
                    ? profileData.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG up to 5MB
                </p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.full_name}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      full_name: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profileData.age || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      age: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  value={profileData.profession}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      profession: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Health Information */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Health Information
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diabetes-type">Diabetes Type</Label>
                  <Select
                    value={profileData.diabetes_type}
                    onValueChange={(value) =>
                      setProfileData({ ...profileData, diabetes_type: value })
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select diabetes type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="type1">Type 1</SelectItem>
                      <SelectItem value="type2">Type 2</SelectItem>
                      <SelectItem value="gestational">Gestational</SelectItem>
                      <SelectItem value="prediabetic">Pre-diabetic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis-date">Diagnosis Date</Label>
                  <Input
                    id="diagnosis-date"
                    type="date"
                    value={profileData.diagnosis_date}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        diagnosis_date: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profileData.weight_kg || ""}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        weight_kg: parseFloat(e.target.value) || 0,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profileData.height_cm || ""}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        height_cm: parseFloat(e.target.value) || 0,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
                {profileData.weight_kg && profileData.height_cm && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>BMI</Label>
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {calculateBMI(
                            profileData.weight_kg,
                            profileData.height_cm
                          )}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {getBMICategory(
                            parseFloat(
                              calculateBMI(
                                profileData.weight_kg,
                                profileData.height_cm
                              ) || "0"
                            )
                          )}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(
                          100,
                          (parseFloat(
                            calculateBMI(
                              profileData.weight_kg,
                              profileData.height_cm
                            ) || "0"
                          ) /
                            40) *
                            100
                        )}
                        className="h-2 mt-2"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="activity-level">Activity Level</Label>
                  <Select
                    value={profileData.activity_level}
                    onValueChange={(value) =>
                      setProfileData({ ...profileData, activity_level: value })
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="light">Light Activity</SelectItem>
                      <SelectItem value="moderate">
                        Moderate Activity
                      </SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footwear">Footwear Type</Label>
                  <Select
                    value={profileData.footwear_type}
                    onValueChange={(value) =>
                      setProfileData({ ...profileData, footwear_type: value })
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select footwear type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sneakers">Sneakers</SelectItem>
                      <SelectItem value="sandals">Sandals</SelectItem>
                      <SelectItem value="boots">Boots</SelectItem>
                      <SelectItem value="dress">Dress Shoes</SelectItem>
                      <SelectItem value="barefoot">Mostly Barefoot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="blood-sugar">Blood Sugar (mg/dL)</Label>
                  <Input
                    id="blood-sugar"
                    type="number"
                    value={profileData.blood_sugar_mgdl || ""}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        blood_sugar_mgdl: parseFloat(e.target.value) || 0,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-4 border-t">
              {isEditing ? (
                <>
                  <Button onClick={updateProfile} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setProfileData(originalProfileData);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscription Information */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Subscription & Billing
            </CardTitle>
            <CardDescription>
              Manage your subscription and payment methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Premium Plan</p>
                  <p className="text-sm text-muted-foreground">
                    Renews on Jan 15, 2025
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-200"
              >
                Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">
                    Next Billing Date
                  </span>
                  <span className="text-sm text-blue-600">Jan 15, 2025</span>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">
                    Amount
                  </span>
                  <span className="text-sm text-green-600">$9.99/month</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1">
                <CreditCard className="w-4 h-4 mr-2" />
                Update Payment Method
              </Button>
              <Button variant="outline" className="flex-1">
                <Settings className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose how you want to receive updates and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Receive important health alerts via email
                </p>
              </div>
              <Switch
                checked={notifications.emailAlerts}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, emailAlerts: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get real-time notifications on your device
                </p>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    pushNotifications: checked,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Reports</p>
                <p className="text-sm text-muted-foreground">
                  Receive weekly health summary reports
                </p>
              </div>
              <Switch
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, weeklyReports: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Appointment Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Get reminders for upcoming appointments
                </p>
              </div>
              <Switch
                checked={notifications.appointmentReminders}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    appointmentReminders: checked,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security & Privacy */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Manage your account security and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              <Shield className="w-4 h-4 mr-2" />
              Two-Factor Authentication
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              <Mail className="w-4 h-4 mr-2" />
              Privacy Settings
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
            >
              <User className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground hover:text-foreground bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
