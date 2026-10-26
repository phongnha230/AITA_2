'use client';

import React, { useState, useMemo } from 'react';
import {
  FolderTree,
  FileCode,
  Search,
  Copy,
  Check,
  Download,
  Terminal,
  Folder,
  Layers,
  ChevronRight,
  Sparkles,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SolutionFileItem {
  fullPath: string;
  displayPath: string;
  question: string;
  folder: string;
  filename: string;
  extension: string;
  content: string;
  lineCount: number;
}

interface SolutionIdeViewerProps {
  sourceCode: string;
  title?: string;
  solutionIndex?: number;
}

export const SolutionIdeViewer: React.FC<SolutionIdeViewerProps> = ({
  sourceCode,
  title,
  solutionIndex = 0,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedFile, setCopiedFile] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // 1. Parse individual files from sourceCode
  const allFiles = useMemo<SolutionFileItem[]>(() => {
    if (!sourceCode) return [];

    const markerPattern = /^\/\/ === AITA SOLUTION FILE: (.+) ===$/gm;
    const markers = [...sourceCode.matchAll(markerPattern)];

    if (markers.length === 0) {
      const lines = sourceCode.split('\n');
      return [
        {
          fullPath: 'Solution.java',
          displayPath: 'Solution.java',
          question: 'Q1',
          folder: '',
          filename: 'Solution.java',
          extension: '.java',
          content: sourceCode,
          lineCount: lines.length,
        },
      ];
    }

    const rawFiles = markers.map((marker, index) => {
      const contentStart = (marker.index ?? 0) + marker[0].length + 1;
      const contentEnd = markers[index + 1]?.index ?? sourceCode.length;
      const path = marker[1].trim();
      const content = sourceCode
        .slice(contentStart, contentEnd)
        .replace(/^\n+/, '')
        .replace(/\n+$/, '');
      return { path, content };
    });

    // Detect common root prefix across all files (e.g. "submission_10of10/")
    let commonPrefix = '';
    if (rawFiles.length > 1) {
      const firstParts = rawFiles[0].path.split('/');
      for (let i = 0; i < firstParts.length - 1; i++) {
        const candidate = firstParts.slice(0, i + 1).join('/') + '/';
        if (rawFiles.every((f) => f.path.startsWith(candidate))) {
          commonPrefix = candidate;
        } else {
          break;
        }
      }
    }

    return rawFiles.map(({ path, content }) => {
      const displayPath = commonPrefix ? path.slice(commonPrefix.length) : path;
      const parts = displayPath.split('/');
      const filename = parts[parts.length - 1];
      const folder = parts.slice(0, -1).join('/');

      // Extract question grouping (e.g. Q1, Q2, Q3...)
      let question = 'Chung';
      const qMatch = path.match(/(?:^|\/|_)(Q\d+|Question\s*\d+|Bai\s*\d+|Part\s*\d+)(?:$|\/|_)/i);
      if (qMatch) {
        question = qMatch[1].toUpperCase().replace(/\s+/, '');
      } else if (parts.length > 1 && /^q\d+$/i.test(parts[0])) {
        question = parts[0].toUpperCase();
      }

      const extension = filename.includes('.')
        ? filename.slice(filename.lastIndexOf('.')).toLowerCase()
        : '';

      return {
        fullPath: path,
        displayPath,
        question,
        folder,
        filename,
        extension,
        content,
        lineCount: content.split('\n').length,
      };
    });
  }, [sourceCode]);

  // Extract unique questions (e.g. Q1, Q2, Q3)
  const questionTabs = useMemo(() => {
    const set = new Set<string>();
    allFiles.forEach((f) => set.add(f.question));
    const sorted = Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return ['ALL', ...sorted];
  }, [allFiles]);

  // Filter files by search & selected question
  const filteredFiles = useMemo(() => {
    return allFiles.filter((f) => {
      const matchQuestion = selectedQuestion === 'ALL' || f.question === selectedQuestion;
      const matchSearch =
        !searchQuery.trim() ||
        f.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.displayPath.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQuestion && matchSearch;
    });
  }, [allFiles, selectedQuestion, searchQuery]);

  // Currently selected file
  const [selectedFilePath, setSelectedFilePath] = useState<string>(() => {
    return allFiles[0]?.fullPath || '';
  });

  // Ensure an active file is always selected when filtering
  const activeFile = useMemo(() => {
    const found = filteredFiles.find((f) => f.fullPath === selectedFilePath);
    if (found) return found;
    return filteredFiles[0] || allFiles[0] || null;
  }, [filteredFiles, allFiles, selectedFilePath]);

  // Group filtered files by Question
  const groupedByQuestion = useMemo(() => {
    const groups: Record<string, SolutionFileItem[]> = {};
    filteredFiles.forEach((file) => {
      if (!groups[file.question]) {
        groups[file.question] = [];
      }
      groups[file.question].push(file);
    });
    return groups;
  }, [filteredFiles]);

  const handleCopyFile = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(sourceCode);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadActiveFile = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (allFiles.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs bg-slate-900 rounded-2xl border border-slate-800">
        Không tìm thấy mã nguồn bài giải hợp lệ.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0c1017] shadow-xl overflow-hidden flex flex-col font-sans">
      {/* 1. TOP TOOLBAR: QUESTION NAVIGATION & QUICK ACTIONS */}
      <div className="bg-[#121824] px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Question filter tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 mr-2 text-xs font-bold text-slate-300">
            <Layers className="size-4 text-indigo-400" />
            <span className="hidden sm:inline">Phân mục đề:</span>
          </div>
          {questionTabs.map((q) => {
            const count = q === 'ALL' ? allFiles.length : allFiles.filter((f) => f.question === q).length;
            const isActive = selectedQuestion === q;
            return (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setSelectedQuestion(q);
                  const firstOfQ = q === 'ALL' ? allFiles[0] : allFiles.find((f) => f.question === q);
                  if (firstOfQ) setSelectedFilePath(firstOfQ.fullPath);
                }}
                className={`h-8 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{q === 'ALL' ? 'Tất cả câu' : q}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Toolbar actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Lọc tệp mã nguồn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 rounded-lg text-xs bg-slate-900/90 text-slate-200 border border-slate-700/80 focus:border-indigo-500 focus:outline-hidden placeholder:text-slate-500 w-36 sm:w-48 transition"
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyAll}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70"
            title="Sao chép toàn bộ mã nguồn của tất cả các file gộp lại"
          >
            {copiedAll ? (
              <>
                <Check className="size-3.5 mr-1 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">Đã chép hết</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 mr-1 text-slate-400" />
                <span className="text-[11px]">Chép tất cả</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. MAIN IDE SPLIT VIEW: FILE TREE (LEFT) + CODE VIEWER (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 h-[650px] min-h-[500px] overflow-hidden">
        {/* LEFT COLUMN: FILE EXPLORER SIDEBAR */}
        <div className="lg:col-span-4 xl:col-span-3 border-r border-slate-800 bg-[#0e131d] flex flex-col h-full min-h-0 overflow-hidden">
          {/* Explorer Header */}
          <div className="px-3.5 py-2.5 border-b border-slate-800/80 bg-[#111722] flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider shrink-0">
            <div className="flex items-center gap-1.5 text-slate-300">
              <FolderTree className="size-3.5 text-indigo-400" />
              <span>Cấu trúc thư mục</span>
            </div>
            <span className="text-slate-500 font-mono text-[10px]">
              {filteredFiles.length} / {allFiles.length} files
            </span>
          </div>

          {/* Explorer File List */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-700">
            {Object.keys(groupedByQuestion).length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                Không có file nào phù hợp với từ khóa &quot;{searchQuery}&quot;
              </div>
            ) : (
              Object.entries(groupedByQuestion).map(([questionName, files]) => (
                <div key={questionName} className="space-y-1">
                  {/* Group header */}
                  <div className="flex items-center justify-between px-2 py-1 text-xs font-bold text-slate-300 bg-slate-800/40 rounded-md">
                    <div className="flex items-center gap-1.5 text-indigo-300">
                      <Folder className="size-3.5 text-amber-400/90 fill-amber-400/20" />
                      <span>{questionName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {files.length} tệp
                    </span>
                  </div>

                  {/* Group Files */}
                  <div className="pl-2 space-y-0.5">
                    {files.map((file) => {
                      const isSelected = activeFile?.fullPath === file.fullPath;
                      const isMainClass =
                        file.filename.includes('List') ||
                        file.filename.includes('Tree') ||
                        file.filename.includes('Graph') ||
                        file.filename.includes('Main');

                      return (
                        <button
                          key={file.fullPath}
                          type="button"
                          onClick={() => setSelectedFilePath(file.fullPath)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-between group ${
                            isSelected
                              ? 'bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 font-bold'
                              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 truncate">
                            <FileCode
                              className={`size-3.5 shrink-0 ${
                                isSelected
                                  ? 'text-indigo-400'
                                  : isMainClass
                                  ? 'text-amber-400'
                                  : 'text-slate-500 group-hover:text-slate-400'
                              }`}
                            />
                            <span className="truncate">{file.filename}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-1.5">
                            {file.folder && (
                              <span className="text-[10px] text-slate-500 truncate max-w-[60px] opacity-70">
                                {file.folder.split('/').pop()}
                              </span>
                            )}
                            <span
                              className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                                isSelected
                                  ? 'bg-indigo-950 text-indigo-300'
                                  : 'bg-slate-900 text-slate-400'
                              }`}
                            >
                              {file.lineCount}L
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Note Footer */}
          <div className="p-2.5 border-t border-slate-800/80 bg-[#111722] text-[11px] text-slate-400 flex items-center gap-2 shrink-0">
            <Sparkles className="size-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Tự động cấu trúc theo bài thi PE</span>
          </div>
        </div>

        {/* RIGHT COLUMN: CODE VIEWER PANE */}
        <div className="lg:col-span-8 xl:col-span-9 bg-[#0b0f17] flex flex-col h-full min-h-0 overflow-hidden">
          {activeFile ? (
            <>
              {/* File Tab & Action Toolbar */}
              <div className="bg-[#121824] px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
                {/* Active Tab info */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0b0f17] border border-slate-700/60 text-slate-200 text-xs font-mono font-bold shadow-2xs">
                    <FileCode className="size-3.5 text-amber-400" />
                    <span>{activeFile.filename}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-500 truncate">
                    <span>Đường dẫn:</span>
                    <span className="text-slate-400">{activeFile.displayPath}</span>
                  </div>
                </div>

                {/* File stats & actions */}
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400 mr-1">
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
                      {activeFile.extension === '.java' ? 'Java JDK' : activeFile.extension}
                    </span>
                    <span>{activeFile.lineCount} dòng</span>
                    <span>•</span>
                    <span>{(activeFile.content.length / 1024).toFixed(1)} KB</span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyFile}
                    className="h-7 px-2.5 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition"
                  >
                    {copiedFile ? (
                      <>
                        <Check className="size-3 mr-1 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3 mr-1 text-slate-400" />
                        <span className="text-[11px]">Sao chép file</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadActiveFile}
                    className="h-7 px-2.5 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition"
                    title="Tải tệp này về máy"
                  >
                    <Download className="size-3 mr-1 text-slate-400" />
                    <span className="text-[11px]">Tải file</span>
                  </Button>
                </div>
              </div>

              {/* Code Content with Line Numbers: Scrollable both vertically and horizontally */}
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto flex font-mono text-xs leading-relaxed text-slate-100 bg-[#080c13] select-text [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#0b0f17] [&::-webkit-scrollbar-thumb]:bg-slate-700/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
                {/* Sticky Line Numbers Gutter: Stays anchored left on horizontal scroll, scrolls vertically in sync with code */}
                <div className="sticky left-0 py-4 pr-3 pl-3 text-right text-slate-500 bg-[#080c13] select-none border-r border-slate-800/80 shrink-0 font-mono text-[11px] leading-6 z-10">
                  {Array.from({ length: activeFile.lineCount }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                {/* Code Body */}
                <div className="py-4 px-4 flex-1 font-mono text-xs leading-6 text-slate-200 whitespace-pre">
                  {activeFile.content}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 text-xs">
              Vui lòng chọn một tệp từ danh sách bên trái để xem mã nguồn.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
