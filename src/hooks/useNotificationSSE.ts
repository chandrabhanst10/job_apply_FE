import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { useResumeStore } from "../store/resumeStore";
import { useDashboardStore } from "../store/dashboardStore";
import { toast } from "sonner";

interface SSEEventData {
  event:
    | "connected"
    | "resume.processing"
    | "resume.completed"
    | "resume.failed"
    | "job_application_status"
    | "job_crawler_status"
    | "feed_scanner_status"
    | "feed_opportunity_discovered"
    | "feed_scanner.started"
    | "feed_scanner.completed"
    | "feed_scanner.failed"
    | "crawler.started"
    | "crawler.completed"
    | "crawler.failed"
    | "system_health_updated"
    | "notification";
  data?: {
    id?: string;
    fileName?: string;
    score?: number;
    error?: string;
    applicationId?: string;
    status?: string;
    jobUrl?: string;
    jobTitle?: string;
    company?: string;
    matchScore?: number;
    opportunityId?: string;
    platform?: "linkedin" | "naukri";
    message?: string;
    timestamp?: string;
  };
}

export const useNotificationSSE = () => {
  const { isAuthenticated } = useAuthStore();
  const { fetchResumes } = useResumeStore();
  const { fetchDashboardData } = useDashboardStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Only connect if the user is authenticated
    if (!isAuthenticated) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    // Connect to SSE notifications endpoint with cookies (credentials) enabled
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
    const eventSource = new EventSource(`${baseURL}/notifications/stream`, {
      withCredentials: true,
    });

    eventSourceRef.current = eventSource;

    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data) as SSEEventData;

        // Broadcast to AI Control Center live timeline listener
        window.dispatchEvent(new CustomEvent("ai_control_center_event", { detail: payload }));
        
        switch (payload.event) {
          case "connected":
            console.log("Real-time SSE Notification channel active.");
            break;
            
          case "resume.processing":
            toast.info(`AI analysis started for ${payload.data?.fileName || "resume"}`);
            fetchResumes();
            break;
            
          case "resume.completed":
            toast.success(`AI analysis finished! ${payload.data?.fileName || "Resume"} scored ${payload.data?.score}%`);
            fetchResumes();
            fetchDashboardData();
            break;
            
          case "resume.failed":
            toast.error(`AI analysis failed: ${payload.data?.error}`);
            fetchResumes();
            fetchDashboardData();
            break;

          case "feed_opportunity_discovered":
            toast.success(`AI Discovered hiring post! ${payload.data?.jobTitle} at ${payload.data?.company} (Match Score: ${payload.data?.matchScore}%)`);
            fetchDashboardData();
            break;

          case "feed_scanner_status":
          case "feed_scanner.started":
          case "feed_scanner.completed":
          case "feed_scanner.failed":
            if (payload.data?.status === "started") {
              toast.info("AI Smart Feed Scanner started crawling recruiter feed...");
            } else if (payload.data?.status === "completed") {
              toast.success("AI Smart Feed Scanner finished crawling recruiter feed!");
            } else if (payload.data?.status === "failed") {
              toast.error(`AI Feed Scanner failed: ${payload.data?.error}`);
            }
            fetchDashboardData();
            break;

          case "job_application_status":
            if (payload.data) {
              const { status, jobUrl, error } = payload.data;
              if (status === "pending") {
                toast.info(`Discovered matching job: ${jobUrl || "listing"}. Queued for auto-apply.`);
              } else if (status === "applying") {
                toast.info(`Automating application for ${jobUrl || "job"}...`);
              } else if (status === "applied") {
                toast.success(`Successfully applied to job!`);
              } else if (status === "failed") {
                toast.error(`Auto-apply failed: ${error || "Unknown error"}`);
              }
            }
            window.dispatchEvent(new CustomEvent("job_application_update", { detail: payload.data }));
            fetchDashboardData();
            break;

          case "job_crawler_status":
          case "crawler.started":
          case "crawler.completed":
          case "crawler.failed":
            if (payload.data) {
              const { platform, status, error } = payload.data;
              const platName = platform === "linkedin" ? "LinkedIn" : "Naukri";
              if (status === "started") {
                toast.info(`${platName} Autopilot crawler started scanning for matching jobs.`);
              } else if (status === "completed") {
                toast.success(`${platName} Autopilot crawler scan completed.`);
              } else if (status === "failed") {
                toast.error(`${platName} Autopilot crawler scan failed: ${error || "Unknown error"}`);
              }
              window.dispatchEvent(new CustomEvent("job_crawler_update", { detail: payload.data }));
              fetchDashboardData();
            }
            break;
        }
      } catch (err) {
        console.error("Failed to parse incoming SSE message payload", err);
      }
    };

    eventSource.onerror = (e) => {
      console.warn("SSE Connection lost. Retrying...", e);
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isAuthenticated, fetchResumes, fetchDashboardData]);
};
