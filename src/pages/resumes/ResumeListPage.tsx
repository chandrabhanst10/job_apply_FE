import type React from "react";
import { useEffect, useState, useRef, type JSX } from "react";
import { useResumeStore } from "../../store/resumeStore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  UploadCloud,
  FileText,
  Trash2,
  Download,
  Play,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { AppError } from "../../types";

export const ResumeListPage: React.FC = () => {
  const {
    resumes,
    isLoading,
    isUploading,
    uploadProgress,
    fetchResumes,
    uploadResume,
    deleteResume,
    analyzeResume,
  } = useResumeStore();

  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file format. Please upload PDF or DOCX documents.");
      return;
    }
    const maxMb = 10;
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`File size exceeds the limit of ${maxMb}MB.`);
      return;
    }

    try {
      await uploadResume(file);
      toast.success("Resume uploaded successfully!");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
      const apiErr = err as AppError;
      toast.error(apiErr.message || "Failed to upload resume.");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this resume? This cannot be undone.",
      )
    )
      return;
    try {
      await deleteResume(id);
      toast.success("Resume deleted successfully!");
    } catch (err: unknown) {
      const apiErr = err as AppError;
      toast.error(apiErr.message || "Failed to delete resume.");
    }
  };

  const handleAnalyze = async (id: string) => {
    try {
      toast.info("AI resume parsing initiated...");
      await analyzeResume(id);
      toast.success("AI analysis completed successfully!");
    } catch (err: unknown) {
      const apiErr = err as AppError;
      toast.error(apiErr.message || "AI Analysis failed. Try again.");
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  };

  const filteredResumes = resumes.filter((r) =>
    (r.originalName || r.fileName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      pending: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Pending
        </span>
      ),
      uploaded: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          Analyzing
        </span>
      ),
      processing: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          Analyzing
        </span>
      ),
      completed: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
          <CheckCircle className="h-3 w-3" /> Completed
        </span>
      ),
      analyzed: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
          <CheckCircle className="h-3 w-3" /> Completed
        </span>
      ),
      failed: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
          <AlertCircle className="h-3 w-3" /> Failed
        </span>
      ),
      analysis_failed: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
          <AlertCircle className="h-3 w-3" /> Failed
        </span>
      ),
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Resume Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Upload your resume files to generate detailed ATS readiness scores.
        </p>
      </div>

      {/* Drag & Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-10 text-center transition-all duration-300 ${
          isDragActive
            ? "border-indigo-600 bg-indigo-50/10 scale-[1.01]"
            : "border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/10 hover:border-slate-400 dark:hover:border-slate-700"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-4 w-full max-w-xs">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto" />
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>Uploading document...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-16 w-16 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <UploadCloud className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold">
                Drag and drop your resume here, or click to browse
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Supports PDF & DOCX formats (Max 10MB)
              </p>
            </div>
            <Button size="sm" onClick={() => fileInputRef.current?.click()}>
              Choose File
            </Button>
          </div>
        )}
      </div>

      {/* Resumes List Card */}
      <Card className="p-8">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-0">
          <div>
            <CardTitle>My Uploaded Resumes</CardTitle>
            <CardDescription>
              A list of your uploaded documents and their analysis status
            </CardDescription>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search resumes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>
        </CardHeader>

        {/* Resumes rendering */}
        {isLoading && resumes.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl border border-slate-100 dark:border-slate-800/40">
            <FileText className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No resumes found
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Upload a PDF or DOCX file to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 text-xs uppercase font-semibold">
                  <th className="py-4 pr-4">File Name</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Uploaded At</th>
                  <th className="py-4 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredResumes.map((resume) => (
                  <tr
                    key={resume.id}
                    className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
                  >
                    <td className="py-4 pr-4 font-medium flex items-center gap-3">
                      <FileText className="h-5 w-5 text-indigo-500 shrink-0" />
                      <span className="truncate max-w-[200px] sm:max-w-xs">
                        {resume.originalName || resume.fileName}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(resume.status)}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-500">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 pl-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* Detailed analysis view (only if complete/failed) */}
                      {resume.status === "completed" ||
                      resume.status === "analyzed" ? (
                        <Link to={`/resumes/${resume.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 cursor-pointer"
                            title="View AI Report"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
                          title="Run AI Analysis"
                          onClick={() => handleAnalyze(resume.id)}
                          disabled={
                            resume.status === "processing" ||
                            resume.status === "uploaded"
                          }
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Download link */}
                      <a
                        href={`http://localhost:4000/api/v1/resumes/${resume.id}/download`}
                        download
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 cursor-pointer"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>

                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 cursor-pointer"
                        title="Delete"
                        onClick={() => handleDelete(resume.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
