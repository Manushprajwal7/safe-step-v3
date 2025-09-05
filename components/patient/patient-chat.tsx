"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Clock, CheckCircle } from "lucide-react"

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
    content: "I've been experiencing some tingling in my left foot. Should I be concerned?",
    timestamp: "10:05 AM",
    type: "user",
  },
  {
    id: 3,
    sender: "assistant",
    content:
      "Thank you for reaching out. Tingling in the foot can be a sign of neuropathy, which is common in diabetic patients. I recommend scheduling a monitoring session to assess the situation. In the meantime, please check your blood sugar levels and ensure you're wearing proper footwear.",
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
]

export default function PatientChat() {
  const [newMessage, setNewMessage] = useState("")
  const [chatMessages, setChatMessages] = useState(messages)

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: chatMessages.length + 1,
      sender: "user",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "user" as const,
    }

    setChatMessages([...chatMessages, message])
    setNewMessage("")

    // Simulate assistant response
    setTimeout(() => {
      const response = {
        id: chatMessages.length + 2,
        sender: "assistant",
        content: "Thank you for your message. A healthcare professional will review this and respond shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "assistant" as const,
      }
      setChatMessages((prev) => [...prev, response])
    }, 1000)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Health Chat</h1>
            <p className="text-muted-foreground">Connect with your healthcare team</p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Online
          </Badge>
        </div>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
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
                  className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
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
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3 opacity-60" />
                      <span className="text-xs opacity-60">{message.timestamp}</span>
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
              For emergencies, please contact your healthcare provider directly or call emergency services.
            </p>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start h-auto p-4 text-left bg-transparent"
                onClick={() => setNewMessage("I need help interpreting my latest report")}
              >
                <div>
                  <p className="font-medium">Report Help</p>
                  <p className="text-xs text-muted-foreground">Get help understanding your results</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4 text-left bg-transparent"
                onClick={() => setNewMessage("I want to schedule a monitoring session")}
              >
                <div>
                  <p className="font-medium">Schedule Session</p>
                  <p className="text-xs text-muted-foreground">Book your next monitoring appointment</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4 text-left bg-transparent"
                onClick={() => setNewMessage("I have questions about my medication")}
              >
                <div>
                  <p className="font-medium">Medication Questions</p>
                  <p className="text-xs text-muted-foreground">Ask about your prescriptions</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4 text-left bg-transparent"
                onClick={() => setNewMessage("I'm experiencing unusual symptoms")}
              >
                <div>
                  <p className="font-medium">Symptom Report</p>
                  <p className="text-xs text-muted-foreground">Report new or concerning symptoms</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
