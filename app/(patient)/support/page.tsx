import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  BookOpen,
  Users,
  Shield,
} from "lucide-react";

export default async function SupportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-600 mt-2">
            Get help with your account, device, or health monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-10 h-10 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
              <p className="text-gray-600 text-sm mb-4">
                Chat with our support team in real-time
              </p>
              <Button className="w-full">Start Chat</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Mail className="w-10 h-10 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-4">
                Send us an email and we'll respond within 24 hours
              </p>
              <Button variant="outline" className="w-full">
                Send Email
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Phone className="w-10 h-10 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
              <p className="text-gray-600 text-sm mb-4">
                Call us Monday-Friday, 9AM-5PM EST
              </p>
              <Button variant="outline" className="w-full">
                Call Now
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Send us a message and we'll get back to you as soon as
                  possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account">Account Issues</SelectItem>
                        <SelectItem value="device">Device Problems</SelectItem>
                        <SelectItem value="billing">
                          Billing Questions
                        </SelectItem>
                        <SelectItem value="health-data">
                          Health Data Concerns
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your issue or question in detail"
                      className="min-h-[150px]"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">Send Message</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="font-medium text-gray-900 flex items-start">
                      <HelpCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      How do I sync my device with the app?
                    </h3>
                    <p className="text-gray-600 mt-2 ml-7">
                      Make sure your device is charged and within Bluetooth
                      range of your phone. Open the Safe Step app and go to the
                      Devices section to initiate pairing.
                    </p>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="font-medium text-gray-900 flex items-start">
                      <FileText className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      How often should I use the device?
                    </h3>
                    <p className="text-gray-600 mt-2 ml-7">
                      For best results, we recommend using the device daily for
                      at least 10 minutes. Your healthcare provider may have
                      specific recommendations based on your condition.
                    </p>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="font-medium text-gray-900 flex items-start">
                      <Shield className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      Is my health data secure?
                    </h3>
                    <p className="text-gray-600 mt-2 ml-7">
                      Yes, we use industry-standard encryption to protect your
                      health data. Your information is never shared without your
                      explicit consent.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 flex items-start">
                      <BookOpen className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      Where can I find the user manual?
                    </h3>
                    <p className="text-gray-600 mt-2 ml-7">
                      You can download the complete user manual from the
                      Resources section of the app or visit our website at
                      safestep.com/manual.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
