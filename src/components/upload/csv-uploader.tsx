"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileType, CheckCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function CsvUploader({ userRole }: { userRole?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ total: number; duplicates: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      // 1. Initialize upload
      const initRes = await fetch("/api/upload-csv/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, totalSize: file.size }),
      });
      const initData = await initRes.json();
      
      if (!initRes.ok) {
        throw new Error(initData.message || "Failed to initialize upload");
      }
      
      const uploadId = initData.uploadId;
      
      let processedBytes = 0;
      const CHUNK_SIZE = 5000; // Rows per batch

      // 2. Parse and upload in chunks
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        chunkSize: 1024 * 1024 * 2, // 2MB chunks for parsing (PapaParse setting)
        chunk: async (results, parser) => {
          parser.pause(); // Pause parsing while we upload this batch

          if (results.data && results.data.length > 0) {
            try {
              const batchRes = await fetch("/api/upload-csv/batch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uploadId, rows: results.data }),
              });
              
              if (!batchRes.ok) {
                throw new Error("Batch upload failed");
              }
              
              // Update progress based on bytes processed
              const cursor = results.meta.cursor || 0;
              const currentProgress = Math.min(95, Math.floor((cursor / file.size) * 100));
              setProgress(currentProgress);
              
            } catch (error) {
              console.error("Batch error:", error);
              parser.abort();
              setUploading(false);
              throw error;
            }
          }
          
          parser.resume(); // Resume parsing after batch upload
        },
        complete: async () => {
          // 3. Finalize upload
          try {
            const finalRes = await fetch("/api/upload-csv/finalize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uploadId }),
            });
            
            const finalData = await finalRes.json();
            if (!finalRes.ok) {
              throw new Error("Finalize failed");
            }
            
            setProgress(100);
            
            setTimeout(() => {
              setUploading(false);
              setResult({ 
                total: finalData.total, 
                duplicates: finalData.duplicates,
                states: finalData.states 
              } as any);
            }, 400);
            
          } catch (error) {
            console.error("Finalize error:", error);
            setUploading(false);
          }
        },
        error: (error) => {
          console.error("PapaParse error:", error);
          setUploading(false);
        }
      });

    } catch (error: any) {
      console.error("Upload error:", error);
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
              isDragging
                ? "border-primary bg-primary/10 scale-[1.02]"
                : "border-border/50 glass hover:border-primary/50 hover:bg-white/5"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-primary/20 rounded-full text-primary shadow-glow">
                <UploadCloud className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Drag & Drop your CSV</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  or click below to browse files from your computer
                </p>
              </div>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="mt-4 glass-card hover:bg-primary/20 hover:text-primary transition-colors rounded-full px-8"
              >
                Browse Files
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 rounded-3xl border-primary/30 relative overflow-hidden"
          >
            {uploading && (
              <div
                className="absolute left-0 top-0 bottom-0 bg-primary/10 transition-all duration-300 ease-out z-0"
                style={{ width: `${progress}%` }}
              />
            )}
            
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/20 text-blue-500 rounded-xl">
                    <FileType className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{file.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                {!uploading && !result && (
                  <button
                    onClick={() => setFile(null)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {uploading && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading and validating...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start space-x-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    {result.total === result.duplicates && result.total > 0 ? (
                      <>
                        <h5 className="font-medium text-amber-500">Data Already Present!</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          All {result.total} records in this CSV are already in the database. No new records were added.
                        </p>
                      </>
                    ) : (
                      <>
                        <h5 className="font-medium text-green-500">Upload Complete!</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          Successfully imported {result.total - result.duplicates} valid leads.
                          <br />
                          Skipped {result.duplicates} duplicate entries.
                        </p>
                      </>
                    )}
                    {(result as any).states && (result as any).states.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-green-500/20">
                        <p className="text-xs font-semibold text-green-500/80 mb-2 uppercase tracking-wider">Detected States in CSV:</p>
                        <div className="flex flex-wrap gap-2">
                          {(result as any).states.map((state: string) => (
                            <span key={state} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-md">
                              {state}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {!uploading && !result && (
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleUpload}
                    className="bg-primary hover:bg-primary/90 rounded-full px-8 shadow-glow"
                  >
                    Add Customer
                  </Button>
                </div>
              )}

              {result && (
                <div className="mt-6 flex justify-end gap-4">
                  <Button
                    onClick={() => {
                      setFile(null);
                      setResult(null);
                    }}
                    variant="outline"
                    className="rounded-full px-8 glass"
                  >
                    Upload Another
                  </Button>
                  {userRole === "SUPER_ADMIN" ? (
                    <Link href={`/dashboard/admins?create=true&states=${encodeURIComponent((result as any).states.join(","))}`}>
                      <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 shadow-glow">
                        Assign Admin
                      </Button>
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
