"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Clock,
  CheckCircle,
  MessageCircle,
  TrendingUp,
  Target,
  BarChart3,
  Zap,
  Heart,
  Activity,
  AlertCircle,
} from "lucide-react";
import AnimatedCounter from "@/components/ui/animated-counter";

// Mock data for chat statistics - in a real app, this would come from the database
const chatStats = {
  totalMessages: 124,
  responseTime: 2.5,
  satisfaction: 94,
  activeChats: 3,
};

const messages = [
  {
    id: 1,
    sender: "system",
    content: "Welcome to Safe Step Health Chat! How can I help you today?",
    timestamp: "10:00 AM",
    type: "system",
  },
  {
    id: 2,
    sender: "user",
    content:
      "I've been experiencing some tingling in my left foot. Should I be concerned?",
    timestamp: "10:05 AM",
    type: "user",
  },
  {
    id: 3,
    sender: "assistant",
    content:
      "Thank you for reaching out. Tingling in the foot can be a sign of neuropathy, which is common in diabetic patients, or it could indicate early arthritis symptoms. I recommend scheduling a monitoring session to assess the situation. In the meantime, please check your blood sugar levels and ensure you're wearing proper footwear.",
    timestamp: "10:07 AM",
    type: "assistant",
  },
  {
    id: 4,
    sender: "user",
    content: "Thank you! I'll schedule a session right away.",
    timestamp: "10:10 AM",
    type: "user",
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

export default function PatientChat() {
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState(messages);
  const [isOnline, setIsOnline] = useState(true);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: chatMessages.length + 1,
      sender: "user",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "user" as const,
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage("");

    // Simulate assistant response
    setTimeout(() => {
      const response = {
        id: chatMessages.length + 2,
        sender: "assistant",
        content:
          "Thank you for your message. A healthcare professional will review this and respond shortly.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "assistant" as const,
      };
      setChatMessages((prev) => [...prev, response]);
    }, 1000);
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-6 max-w-4xl space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <motion.h1
              className="text-2xl font-serif font-bold text-gray-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Health Chat
            </motion.h1>
            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Connect with your healthcare team
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Badge
              variant="outline"
              className={`${
                isOnline
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-red-100 text-red-800 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                {isOnline ? "Online" : "Offline"}
              </div>
            </Badge>
          </motion.div>
        </div>
      </motion.div>

      {/* Chat Statistics */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Total Messages",
              value: chatStats.totalMessages,
              icon: MessageCircle,
              color: "bg-blue-100 text-blue-600",
            },
            {
              title: "Avg. Response Time",
              value: `${chatStats.responseTime} hrs`,
              icon: TrendingUp,
              color: "bg-green-100 text-green-600",
            },
            {
              title: "Satisfaction",
              value: `${chatStats.satisfaction}%`,
              icon: Heart,
              color: "bg-purple-100 text-purple-600",
            },
            {
              title: "Active Chats",
              value: chatStats.activeChats,
              icon: Zap,
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
                          stat.value.includes("hrs")
                            ? " hrs"
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

      {/* Chat Interface */}
      <motion.div variants={itemVariants}>
        <Card className="h-[500px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Safe Step Health Assistant
            </CardTitle>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.type !== "user" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {message.type === "system" ? "S" : "A"}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.type === "system"
                        ? "bg-muted text-muted-foreground"
                        : "bg-accent/10 text-foreground border border-accent/20"
                    }`}
                  >
                    <p className="text-sm">
                      {message.id === 3
                        ? "Thank you for reaching out. Tingling in the foot can be a sign of neuropathy, which is common in diabetic patients, or it could indicate early arthritis symptoms. I recommend scheduling a monitoring session to assess the situation. In the meantime, please check your blood sugar levels and ensure you're wearing proper footwear."
                        : message.content}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3 opacity-60" />
                      <span className="text-xs opacity-60">
                        {message.timestamp}
                      </span>
                    </div>
                  </div>

                  {message.type === "user" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-secondary">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              For emergencies, please contact your healthcare provider directly
              or call emergency services.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start h-auto p-4 text-left bg-transparent hover:bg-primary/5"
                onClick={() =>
                  setNewMessage("I need help interpreting my latest report")
                }
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Report Help</p>
                    <p className="text-xs text-muted-foreground">
                      Get help understanding your results
                    </p>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4 text-left bg-transparent hover:bg-primary/5"
                onClick={() =>
                  setNewMessage("I want to schedule a monitoring session")
                }
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Schedule Session</p>
                    <p className="text-xs text-muted-foreground">
                      Book your next monitoring appointment
                    </p>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4 text-left bg-transparent hover:bg-primary/5"
                onClick={() =>
                  setNewMessage("I have questions about my medication")
                }
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Medication Questions</p>
                    <p className="text-xs text-muted-foreground">
                      Ask about your prescriptions
                    </p>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4 text-left bg-transparent hover:bg-primary/5"
                onClick={() =>
                  setNewMessage("I'm experiencing unusual symptoms")
                }
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Symptom Report</p>
                    <p className="text-xs text-muted-foreground">
                      Report new or concerning symptoms
                    </p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chat Insights */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Chat Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">
                  Conversation Quality
                </span>
                <span className="text-sm text-gray-600">
                  <AnimatedCounter value={92} />%
                </span>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                <Progress value={92} className="h-2.5 bg-gray-200" />
              </motion.div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">
                  <AnimatedCounter value={24} />
                </p>
                <p className="text-sm text-gray-600">Hours Saved</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">
                  <AnimatedCounter value={89} />%
                </p>
                <p className="text-sm text-gray-600">Resolution Rate</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">
                  <AnimatedCounter value={4.8} />
                </p>
                <p className="text-sm text-gray-600">Avg. Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
