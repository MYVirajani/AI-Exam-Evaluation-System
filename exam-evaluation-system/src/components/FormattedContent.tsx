"use client";

import React from "react";
import { formatTextForDisplay } from "@/utils/formatText";

export default function FormattedContent({ text }: { text: string }) {
  const html = formatTextForDisplay(text);

  return (
    <>
      <style jsx>{`
        .formatted-content {
          color: #1e293b;
          line-height: 1.75;
          font-size: 15px;
        }
        .formatted-content * {
          color: #1e293b !important;
        }
        .formatted-content p {
          margin-bottom: 1em;
        }
        .formatted-content h1,
        .formatted-content h2,
        .formatted-content h3 {
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          color: #0f172a !important;
        }
        .formatted-content ul,
        .formatted-content ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }
        .formatted-content li {
          margin-bottom: 0.5em;
        }
        .formatted-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
        }
        .formatted-content th,
        .formatted-content td {
          border: 1px solid #cbd5e1;
          padding: 0.5em;
          text-align: left;
        }
        .formatted-content th {
          background-color: #f1f5f9;
          font-weight: 600;
        }
        .formatted-content a {
          color: #2563eb !important;
          text-decoration: underline;
        }
        .formatted-content code {
          background-color: #f1f5f9;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
        }
        .formatted-content pre {
          background-color: #f1f5f9;
          padding: 1em;
          border-radius: 6px;
          overflow-x: auto;
          margin: 1em 0;
        }
      `}</style>
      <div
        className="formatted-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
