import type React from "react";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useResumeStore } from "../../store/resumeStore";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";
import { Button } from "../../components/ui/Button";
import { 
  ArrowLeft, 
  TrendingUp, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  Briefcase, 
  Award,
  Sparkles,
  AlertTriangle,
  FileText,
  FileCheck2,
  Copy,
  Check,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import type { AppError } from "../../types";

export const ResumeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedResume, selectedAnalysis, matchResult, isMatching, isLoading, fetchResumeDetail, matchResume } = useResumeStore();
  
  const [activeTab, setActiveTab] = useState<"analysis" | "matcher">("analysis");
  const [jobDescription, setJobDescription] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchResumeDetail(id);
    }
  }, [id, fetchResumeDetail]);

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Bullet point copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!jobDescription.trim()) {
      toast.error("Please paste a target Job Description to match.");
      return;
    }
    try {
      await matchResume(id, jobDescription);
      toast.success("Job description match score generated!");
    } catch (err: unknown) {
      const apiErr = err as AppError;
      toast.error(apiErr.message || "Failed to compare resume with targeted job description.");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-rose-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30";
    if (score >= 50) return "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30";
    return "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!selectedResume) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <AlertTriangle className="h-12 w-12 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold">Resume Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">The requested resume document could not be loaded.</p>
        <Link to="/resumes" className="mt-6">
          <Button variant="primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resumes
          </Button>
        </Link>
      </div>
    );
  }

  const score = selectedAnalysis?.atsScore || 0;
  const matchScore = matchResult?.matchScore || 0;

  return (
    <div className="space-y-8">
      {/* Back button & Title */}
      <div className="space-y-2">
        <Link to="/resumes" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Resumes
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight truncate max-w-lg sm:max-w-xl">{selectedResume.originalName || selectedResume.fileName}</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Uploaded on {new Date(selectedResume.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Tabs Controller */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("analysis")}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-all duration-200 flex items-center gap-2 ${
            activeTab === "analysis"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <FileText className="h-4.5 w-4.5" />
          ATS Parse Analysis
        </button>
        <button
          onClick={() => setActiveTab("matcher")}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-all duration-200 flex items-center gap-2 ${
            activeTab === "matcher"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <FileCheck2 className="h-4.5 w-4.5" />
          Target Job Matcher
        </button>
      </div>

      {activeTab === "analysis" ? (
        /* ================= GENERAL ANALYSIS TAB ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: AI Parsed Results */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Analysis Summary */}
            <Card className="p-8">
              <CardHeader className="px-0 flex flex-row items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <CardTitle>AI Analysis Executive Summary</CardTitle>
              </CardHeader>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {selectedAnalysis?.summary || "No summary analysis available."}
              </p>
            </Card>

            {/* Extracted Skills */}
            <Card className="p-8">
              <CardHeader className="px-0 flex flex-row items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <CardTitle>Extracted Core Skills</CardTitle>
              </CardHeader>
              <div className="flex flex-wrap gap-2.5 mt-2">
                {selectedAnalysis?.skills.length === 0 ? (
                  <p className="text-sm text-slate-500">No skills parsed from this document.</p>
                ) : (
                  selectedAnalysis?.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/20"
                    >
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </Card>

            {/* Work Experience */}
            <Card className="p-8">
              <CardHeader className="px-0 flex flex-row items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-500" />
                <CardTitle>Work Experience Summary</CardTitle>
              </CardHeader>
              <ul className="space-y-3.5 list-disc pl-5 mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedAnalysis?.experience.length === 0 ? (
                  <p className="text-slate-500 pl-0 list-none">No experience details detected.</p>
                ) : (
                  selectedAnalysis?.experience.map((exp, index) => (
                    <li key={index}>{exp}</li>
                  ))
                )}
              </ul>
            </Card>

            {/* Education & Projects & Certifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <CardHeader className="px-0 flex flex-row items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <ul className="space-y-2 list-disc pl-5 text-xs text-slate-600 dark:text-slate-300">
                  {selectedAnalysis?.education.length === 0 ? (
                    <p className="text-slate-500 list-none pl-0">No education sections detected.</p>
                  ) : (
                    selectedAnalysis?.education.map((edu, index) => (
                      <li key={index}>{edu}</li>
                    ))
                  )}
                </ul>
              </Card>

              <Card className="p-6">
                <CardHeader className="px-0 flex flex-row items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-500" />
                  <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <ul className="space-y-2 list-disc pl-5 text-xs text-slate-600 dark:text-slate-300">
                  {selectedAnalysis?.certifications.length === 0 ? (
                    <p className="text-slate-500 list-none pl-0">No certifications parsed.</p>
                  ) : (
                    selectedAnalysis?.certifications.map((cert, index) => (
                      <li key={index}>{cert}</li>
                    ))
                  )}
                </ul>
              </Card>
            </div>
          </div>

          {/* Right Column: ATS Score, Missing Skills, Suggestions */}
          <div className="space-y-6">
            <div className={`border rounded-2xl p-8 text-center shadow-lg ${getScoreBg(score)}`}>
              <TrendingUp className="h-8 w-8 mx-auto mb-3" />
              <h3 className="text-xs uppercase font-bold tracking-widest text-slate-500">ATS Score</h3>
              <p className={`text-5xl font-black mt-2 ${getScoreColor(score)}`}>{score}%</p>
              <p className="text-xs text-slate-500 mt-4 leading-normal font-medium">
                Calculated using standard keywords matches, formatting, and structural checks.
              </p>
            </div>

            <Card className="p-6 border-rose-200/50 dark:border-rose-950/20">
              <CardHeader className="px-0 flex flex-row items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                <CardTitle className="text-rose-700 dark:text-rose-400">Missing Keywords</CardTitle>
              </CardHeader>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedAnalysis?.missingSkills.length === 0 ? (
                  <p className="text-xs text-slate-500">No missing critical keywords detected.</p>
                ) : (
                  selectedAnalysis?.missingSkills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/20"
                    >
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-6">
              <CardHeader className="px-0 flex flex-row items-center gap-2">
                <HelpCircle className="h-5 w-5 text-indigo-500" />
                <CardTitle>Optimization Checklist</CardTitle>
              </CardHeader>
              <ul className="space-y-3 pl-0 mt-2 list-none text-xs text-slate-600 dark:text-slate-400">
                {selectedAnalysis?.suggestions.length === 0 ? (
                  <p className="text-slate-500">No suggestions available.</p>
                ) : (
                  selectedAnalysis?.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex gap-2.5 items-start">
                      <span className="h-4.5 w-4.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-[10px] shrink-0">{index + 1}</span>
                      <span className="leading-relaxed">{suggestion}</span>
                    </li>
                  ))
                )}
              </ul>
            </Card>
          </div>
        </div>
      ) : (
        /* ================= TARGET JOB MATCHER TAB ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: JD input and comparisons */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8">
              <CardHeader className="px-0 flex flex-row items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-indigo-500" />
                <div>
                  <CardTitle>Target Job Description</CardTitle>
                  <CardDescription>Paste the target job description text below to check keyword match and generate resume tailoring suggestions.</CardDescription>
                </div>
              </CardHeader>

              <form onSubmit={handleMatchSubmit} className="space-y-4 mt-2">
                <textarea
                  rows={8}
                  placeholder="Paste LinkedIn/Indeed job description text here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 leading-relaxed font-normal"
                />
                
                <div className="flex justify-end">
                  <Button type="submit" isLoading={isMatching} disabled={isMatching}>
                    {isMatching ? "Comparing..." : "Analyze Match"}
                  </Button>
                </div>
              </form>
            </Card>

            {matchResult && (
              <>
                {/* AI Rewritten Bullet Points */}
                <Card className="p-8">
                  <CardHeader className="px-0 flex flex-row items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                    <div>
                      <CardTitle>AI-Tailored Bullet Points</CardTitle>
                      <CardDescription>Copy these custom re-written points directly into your resume to match the targeted JD:</CardDescription>
                    </div>
                  </CardHeader>
                  
                  <div className="space-y-4.5 mt-4">
                    {matchResult.tailoredBulletPoints.length === 0 ? (
                      <p className="text-sm text-slate-500">No suggestions generated.</p>
                    ) : (
                      matchResult.tailoredBulletPoints.map((bullet, idx) => (
                        <div key={idx} className="flex gap-4 p-4.5 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/10 items-start justify-between group hover:border-indigo-500/20 hover:bg-white dark:hover:bg-slate-900/20 transition-all">
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {bullet}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 shrink-0 hover:text-indigo-500"
                            onClick={() => handleCopyText(bullet, idx)}
                          >
                            {copiedIndex === idx ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* AI Tailored Cover Letter */}
                {matchResult.coverLetter && (
                  <Card className="p-8">
                    <CardHeader className="px-0 flex flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-500" />
                        <div>
                          <CardTitle>AI-Tailored Cover Letter</CardTitle>
                          <CardDescription>Ready-to-use cover letter tailored for this position:</CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => {
                          navigator.clipboard.writeText(matchResult.coverLetter || "");
                          toast.success("Cover letter copied to clipboard!");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        Copy Letter
                      </Button>
                    </CardHeader>
                    <div className="mt-4 p-6 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/10 max-h-[400px] overflow-y-auto font-normal text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap select-text scrollbar-thin">
                      {matchResult.coverLetter}
                    </div>
                  </Card>
                )}

                {/* Missing Keywords specific to this JD */}
                <Card className="p-8">
                  <CardHeader className="px-0 flex flex-row items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                    <div>
                      <CardTitle>Missing Job Keywords</CardTitle>
                      <CardDescription>Critical skills/keywords from the job posting missing in your resume:</CardDescription>
                    </div>
                  </CardHeader>
                  <div className="flex flex-wrap gap-2.5 mt-4">
                    {matchResult.missingKeywords.length === 0 ? (
                      <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/20">All critical keywords matched!</p>
                    ) : (
                      matchResult.missingKeywords.map((kw, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/20"
                        >
                          {kw}
                        </span>
                      ))
                    )}
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* Right Column: Match Score, suggestions checklist */}
          <div className="space-y-6">
            {isMatching && !matchResult && (
              <Card className="p-8 text-center min-h-[300px] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-xs text-slate-500 font-semibold">Gemini is comparing your resume against the target role...</p>
              </Card>
            )}

            {matchResult && (
              <>
                {/* Match score radial display */}
                <div className={`border rounded-2xl p-8 text-center shadow-lg ${getScoreBg(matchScore)}`}>
                  <TrendingUp className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="text-xs uppercase font-bold tracking-widest text-slate-500">Compatibility Match</h3>
                  <p className={`text-5xl font-black mt-2 ${getScoreColor(matchScore)}`}>{matchScore}%</p>
                  <p className="text-xs text-slate-500 mt-4 leading-normal font-medium">
                    Compatibility match computed specifically for the pasted job description parameters.
                  </p>
                </div>

                {/* Match suggestions list */}
                <Card className="p-6">
                  <CardHeader className="px-0 flex flex-row items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-indigo-500" />
                    <CardTitle>Match Enhancement Checklist</CardTitle>
                  </CardHeader>
                  <ul className="space-y-3.5 pl-0 mt-2 list-none text-xs text-slate-600 dark:text-slate-400">
                    {matchResult.suggestions.length === 0 ? (
                      <p className="text-slate-500">No suggestions available.</p>
                    ) : (
                      matchResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex gap-2.5 items-start">
                          <span className="h-4.5 w-4.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-[10px] shrink-0">{index + 1}</span>
                          <span className="leading-relaxed">{suggestion}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
