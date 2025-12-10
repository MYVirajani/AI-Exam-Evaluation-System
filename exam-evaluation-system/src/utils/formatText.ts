import katex from "katex";

/**
 * Detect if text contains LaTeX math inline or block
 */
export const containsLatex = (text: string): boolean => {
  return /\\\(|\\\[|\\begin\{.*?}|\\frac|\\sqrt|_/g.test(text);
};

/**
 * Convert LaTeX (including `\(...\)`) → HTML using KaTeX
 */
export const renderLatexToHtml = (text: string): string => {
  try {
    return katex.renderToString(text, {
      throwOnError: false,
      output: "html",
      displayMode: text.startsWith("\\[") || text.includes("\\begin"),
    });
  } catch (err) {
    console.error("Failed to render LaTeX:", err);
    return text;
  }
};

/**
 * Convert LaTeX tabular → HTML table
 */
export const latexTableToHtml = (latex: string): string => {
  // Remove alignment block { |c|c|c| } or {llll}
  const cleanLatex = latex.replace(
    /\\begin\{tabular}\{[^}]+\}/g,
    "\\begin{tabular}"
  );

  // Remove \begin{tabular} and \end{tabular}
  const body = cleanLatex
    .replace(/\\begin\{tabular}/, "")
    .replace(/\\end\{tabular}/, "")
    .trim();

  // Split rows on \hline
  const rows = body
    .split("\\hline")
    .map((r) => r.trim())
    .filter((r) => r.length > 0);

  let html = `<table class="latex-table border border-gray-400 border-collapse">`;

  rows.forEach((row) => {
    const cells = row
      .split("&")
      .map((c) => c.replace(/\\\\/g, "").trim());

    html += "<tr>";
    cells.forEach((c) => {
      html += `<td class="border border-gray-400 px-2 py-1">${c}</td>`;
    });
    html += "</tr>";
  });

  html += "</table>";
  return html;
};

/**
 * Detect LaTeX table
 */
export const containsLatexTable = (text: string): boolean => {
  return /\\begin\{tabular}/.test(text);
};

/**
 * Convert newlines (\n) to HTML <br>
 */
export const convertNewlinesToHtml = (text: string): string => {
  // Replace literal \n or actual newlines with <br>
  return text.replace(/\\n|\n/g, "<br>");
};

/**
 * Master formatter for UI
 */
export const formatTextForDisplay = (text: string): string => {
  if (!text) return "";

  let processed = text;

  // Convert tables first
  if (containsLatexTable(processed)) {
    processed = latexTableToHtml(processed);
  }
  // Convert math equations
  else if (containsLatex(processed)) {
    processed = renderLatexToHtml(processed);
  }
  // Convert literal newlines to <br>
  processed = convertNewlinesToHtml(processed);

  return processed;
};
