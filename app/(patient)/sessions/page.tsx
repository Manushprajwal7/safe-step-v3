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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Activity, Play, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function SessionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user sessions
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Sessions
          </h1>
          <p className="text-muted-foreground">
            View your monitoring session history
          </p>
        </div>
        <Button asChild>
          <Link href="/session">
            <Play className="w-4 h-4 mr-2" />
            Start New Session
          </Link>
        </Button>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session: any) => (
            <Card
              key={session.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-primary" />
                    Session
                  </CardTitle>
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
                    {session.status === "completed" ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {session.status}
                  </Badge>
                </div>
                <CardDescription>
                  {format(new Date(session.started_at), "MMM d, yyyy h:mm a")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">
                      {session.ended_at
                        ? format(
                            new Date(session.ended_at).getTime() -
                              new Date(session.started_at).getTime(),
                            "mm:ss"
                          )
                        : "In progress"}
                    </span>
                  </div>
                  {session.note && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Note</span>
                      <span className="font-medium truncate max-w-[120px]">
                        {session.note}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  asChild
                >
                  <Link href={`/session/${session.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
            <p className="text-muted-foreground mb-4">
              Start your first monitoring session to begin tracking your foot
              health
            </p>
            <Button asChild>
              <Link href="/session">
                <Play className="w-4 h-4 mr-2" />
                Start Session
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
