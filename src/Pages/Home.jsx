import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, CheckCircle2, Loader2, FileUp } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (e) => {
    const picked = e.target.files[0];
    if (picked) {
      setFile(picked);
      setStatus("idle");
      setErrorMsg("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped);
      setStatus("idle");
      setErrorMsg("");
    } else {
      setErrorMsg("Please drop a valid PDF file.");
      setStatus("error");
    }
  };

  const clearFile = () => {
    setFile(null);
    setStatus("idle");
    inputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://ikms-api.servecounterstrike.com/index-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

 return (
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-[#020617] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 rounded-[32px] p-8 shadow-2xl shadow-blue-900/10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 mb-4">
            <FileUp size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Add Source</h1>
          <p className="text-xs text-blue-500/60 uppercase tracking-widest mt-1 font-bold">PDF Knowledge Base</p>
        </div>

        <div
          onClick={() => inputRef.current.click()}
          className={`group border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer flex flex-col items-center
            ${file ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/20" : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
        >
          <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
          
          {file ? (
            <div className="flex items-center gap-3 w-full animate-in fade-in">
              <FileText className="text-blue-600 shrink-0" size={20} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                <p className="text-[10px] text-blue-400 font-mono">{(file.size/1024).toFixed(1)} KB</p>
              </div>
              <X size={14} className="text-slate-300 hover:text-red-400" onClick={(e) => { e.stopPropagation(); setFile(null); }} />
            </div>
          ) : (
            <span className="text-xs font-medium text-slate-400 group-hover:text-blue-500 transition-colors">Select a PDF file</span>
          )}
        </div>

        {status === "success" && (
          <div className="mt-4 flex items-center gap-2 text-blue-600 animate-in slide-in-from-top-1 justify-center">
            <CheckCircle2 size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Indexed successfully</span>
          </div>
        )}
        {status === "error" && errorMsg && (
        <div className="mt-4 text-center text-red-600 text-xs font-bold">
          {errorMsg}
        </div>
      )}
        <Button
          onClick={handleSubmit}
          disabled={!file || status === "loading"}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20 disabled:opacity-30 transition-all active:scale-95"
        >
          {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : "Upload Document"}
        </Button>
      </div>
    </div>
  );

}