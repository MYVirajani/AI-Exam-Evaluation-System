"use client";

import { X, Download } from "lucide-react";

interface FilePreviewProps {
  url: string;
  type: string;
  onClose: () => void;
}

export default function FilePreview({ url, type, onClose }: FilePreviewProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-slate-50 to-slate-100">
          <h3 className="font-semibold text-xl text-slate-800">File Preview</h3>

          <div className="flex gap-2">
            <a
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5 text-slate-700" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50">
          {type === "pdf" ? (
            <iframe
              src={url}
              className="w-full h-full min-h-[600px] rounded-lg"
              title="PDF Viewer"
            />
          ) : type === "image" ? (
            <img
              src={url}
              alt="Preview"
              className="max-w-full h-auto mx-auto rounded-lg shadow-md"
            />
          ) : type === "video" ? (
            <video
              controls
              className="max-w-full h-auto mx-auto rounded-lg shadow-md"
            >
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-center p-8">
              <p className="text-slate-700">
                Preview not available.{" "}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  Download file
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
