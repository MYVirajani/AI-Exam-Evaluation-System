// 'use client';

// import React, { useState, useEffect } from 'react';
// import { FileText, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

// interface DocumentViewerProps {
//   fileUrl: string;
// }

// const DocumentViewer: React.FC<DocumentViewerProps> = ({ fileUrl }) => {
//   const [fileType, setFileType] = useState<string>('');
//   const [zoom, setZoom] = useState(100);
//   const [rotation, setRotation] = useState(0);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Determine file type from URL
//     const extension = fileUrl.split('.').pop()?.toLowerCase();
//     setFileType(extension || '');
//     setLoading(false);
//   }, [fileUrl]);

//   const handleDownload = () => {
//     const link = document.createElement('a');
//     link.href = fileUrl;
//     link.download = fileUrl.split('/').pop() || 'document';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleZoomIn = () => {
//     setZoom(prev => Math.min(prev + 25, 200));
//   };

//   const handleZoomOut = () => {
//     setZoom(prev => Math.max(prev - 25, 50));
//   };

//   const handleRotate = () => {
//     setRotation(prev => (prev + 90) % 360);
//   };

//   const renderViewer = () => {
//     if (loading) {
//       return (
//         <div className="flex items-center justify-center h-96">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
//         </div>
//       );
//     }

//     if (error) {
//       return (
//         <div className="flex flex-col items-center justify-center h-96 text-red-600">
//           <FileText className="w-16 h-16 mb-4 text-red-300" />
//           <p className="text-lg font-medium">Error loading document</p>
//           <p className="text-sm">{error}</p>
//         </div>
//       );
//     }

//     switch (fileType) {
//       case 'pdf':
//         return (
//           <div className="relative h-96 overflow-auto border border-gray-300 rounded">
//             <iframe
//               src={fileUrl}
//               className="w-full h-full"
//               title="PDF Viewer"
//               style={{
//                 transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
//                 transformOrigin: 'top left'
//               }}
//             />
//           </div>
//         );

//       case 'jpg':
//       case 'jpeg':
//       case 'png':
//       case 'gif':
//       case 'bmp':
//       case 'webp':
//         return (
//           <div className="relative h-96 overflow-auto border border-gray-300 rounded bg-gray-50">
//             <div className="flex items-center justify-center h-full">
//               <img
//                 src={fileUrl}
//                 alt="Answer Script"
//                 className="max-w-full max-h-full object-contain"
//                 style={{
//                   transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
//                   transformOrigin: 'center'
//                 }}
//                 onError={() => setError('Failed to load image')}
//               />
//             </div>
//           </div>
//         );

//       case 'docx':
//       case 'doc':
//         return (
//           <div className="relative h-96 overflow-auto border border-gray-300 rounded bg-gray-50">
//             <div className="flex flex-col items-center justify-center h-full text-gray-600">
//               <FileText className="w-16 h-16 mb-4 text-gray-400" />
//               <p className="text-lg font-medium mb-2">Word Document</p>
//               <p className="text-sm text-gray-500 mb-4">
//                 Preview not available for Word documents
//               </p>
//               <button
//                 onClick={handleDownload}
//                 className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 <Download className="w-4 h-4 mr-2" />
//                 Download to View
//               </button>
//             </div>
//           </div>
//         );

//       default:
//         return (
//           <div className="relative h-96 overflow-auto border border-gray-300 rounded bg-gray-50">
//             <div className="flex flex-col items-center justify-center h-full text-gray-600">
//               <FileText className="w-16 h-16 mb-4 text-gray-400" />
//               <p className="text-lg font-medium mb-2">Unsupported Format</p>
//               <p className="text-sm text-gray-500 mb-4">
//                 Cannot preview .{fileType} files
//               </p>
//               <button
//                 onClick={handleDownload}
//                 className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 <Download className="w-4 h-4 mr-2" />
//                 Download File
//               </button>
//             </div>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {/* Toolbar */}
//       {(['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType)) && (
//         <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={handleZoomOut}
//               disabled={zoom <= 50}
//               className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//               title="Zoom Out"
//             >
//               <ZoomOut className="w-4 h-4" />
//             </button>
            
//             <span className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium min-w-[60px] text-center">
//               {zoom}%
//             </span>
            
//             <button
//               onClick={handleZoomIn}
//               disabled={zoom >= 200}
//               className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//               title="Zoom In"
//             >
//               <ZoomIn className="w-4 h-4" />
//             </button>
            
//             <button
//               onClick={handleRotate}
//               className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
//               title="Rotate"
//             >
//               <RotateCw className="w-4 h-4" />
//             </button>
//           </div>
          
//           <button
//             onClick={handleDownload}
//             className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//             title="Download"
//           >
//             <Download className="w-4 h-4 mr-2" />
//             Download
//           </button>
//         </div>
//       )}

//       {/* Document Viewer */}
//       {renderViewer()}
      
//       {/* File Info */}
//       <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
//         <div className="flex items-center justify-between">
//           <span>File: {fileUrl.split('/').pop()}</span>
//           <span>Type: {fileType.toUpperCase()}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentViewer;

'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface DocumentViewerProps {
  fileUrl: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ fileUrl }) => {
  const [fileType, setFileType] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine file type from URL and process the URL
    let processedFileUrl = fileUrl;
    
    // If the URL is a local file path, convert it to API route
    if (fileUrl && !fileUrl.startsWith('http') && !fileUrl.startsWith('/api/')) {
      // Convert Windows-style path to forward slashes
      let cleanPath = fileUrl.replace(/\\/g, '/');
      
      // Remove drive letter if present (e.g., "D:/FYP Mid/..." -> "FYP Mid/...")
      cleanPath = cleanPath.replace(/^[A-Z]:\//i, '');
      
      // If the path starts with the project directory, remove it
      // Assuming your project structure: "FYP Mid/AI-Exam-Evaluation-System/exam-evaluation-system/data/..."
      const projectPaths = [
        'FYP Mid/AI-Exam-Evaluation-System/exam-evaluation-system/',
        'AI-Exam-Evaluation-System/exam-evaluation-system/',
        'exam-evaluation-system/'
      ];
      
      for (const projectPath of projectPaths) {
        if (cleanPath.startsWith(projectPath)) {
          cleanPath = cleanPath.substring(projectPath.length);
          break;
        }
      }
      
      // Ensure the path starts with 'data/' if it doesn't already
      if (!cleanPath.startsWith('data/')) {
        // If it starts with just the folder names, prepend 'data/'
        if (cleanPath.startsWith('Handwritten_Answer_Scripts/') || 
            cleanPath.startsWith('Answer_Scripts/')) {
          cleanPath = `data/${cleanPath}`;
        }
      }
      
      processedFileUrl = `/api/files/${cleanPath}`;
      console.log('Original URL:', fileUrl);
      console.log('Processed URL:', processedFileUrl);
    }
    
    setProcessedUrl(processedFileUrl);
    const extension = processedFileUrl.split('.').pop()?.toLowerCase();
    setFileType(extension || '');
    setLoading(false);
  }, [fileUrl]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = processedUrl.split('/').pop() || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const renderViewer = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-red-600">
          <FileText className="w-16 h-16 mb-4 text-red-300" />
          <p className="text-lg font-medium">Error loading document</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    switch (fileType) {
      case 'pdf':
        return (
          <div className="relative h-96 overflow-auto border border-gray-300 rounded">
            <iframe
              src={processedUrl}
              className="w-full h-full"
              title="PDF Viewer"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'top left'
              }}
            />
          </div>
        );

      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
        return (
          <div className="relative h-96 overflow-auto border border-gray-300 rounded bg-gray-50">
            <div className="flex items-center justify-center h-full">
              <img
                src={processedUrl}
                alt="Answer Script"
                className="max-w-full max-h-full object-contain"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center'
                }}
                onError={() => setError('Failed to load image')}
              />
            </div>
          </div>
        );

      case 'docx':
      case 'doc':
        return (
          <div className="relative h-96 overflow-auto border border-gray-300 rounded bg-gray-50">
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
              <FileText className="w-16 h-16 mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Word Document</p>
              <p className="text-sm text-gray-500 mb-4">
                Preview not available for Word documents
              </p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download to View
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="relative h-96 overflow-auto border border-gray-300 rounded bg-gray-50">
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
              <FileText className="w-16 h-16 mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Unsupported Format</p>
              <p className="text-sm text-gray-500 mb-4">
                Cannot preview .{fileType} files
              </p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download File
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {(['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType)) && (
        <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium min-w-[60px] text-center">
              {zoom}%
            </span>
            
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleRotate}
              className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              title="Rotate"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>
      )}

      {/* Document Viewer */}
      {renderViewer()}
      
      {/* File Info */}
      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
        <div className="flex items-center justify-between">
          <span>File: {processedUrl.split('/').pop()}</span>
          <span>Type: {fileType.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;