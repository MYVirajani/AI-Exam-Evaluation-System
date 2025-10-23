// // // import { NextRequest, NextResponse } from 'next/server';
// // // import { readFile, stat } from 'fs/promises';
// // // import path from 'path';
// // // import { existsSync } from 'fs';

// // // export async function GET(
// // //   request: NextRequest,
// // //   { params }: { params: Promise<{ path: string[] }> }
// // // ) {
// // //   try {
// // //     const { path: filePath } = await params;
    
// // //     // Reconstruct the file path
// // //     const requestedPath = filePath.join('/');
    
// // //     // Define your local files directory - this should be the root where 'data' folder exists
// // //     const filesDirectory = path.join(process.cwd(), 'data');
// // //     const fullPath = path.join(filesDirectory, requestedPath);
    
// // //     // Security check: ensure the file is within the data directory
// // //     const resolvedPath = path.resolve(fullPath);
// // //     const resolvedDataDir = path.resolve(filesDirectory);
    
// // //     if (!resolvedPath.startsWith(resolvedDataDir)) {
// // //       return NextResponse.json(
// // //         { error: 'Access denied' },
// // //         { status: 403 }
// // //       );
// // //     }
    
// // //     // Check if file exists
// // //     if (!existsSync(resolvedPath)) {
// // //       console.error('File not found:', resolvedPath);
// // //       return NextResponse.json(
// // //         { error: 'File not found' },
// // //         { status: 404 }
// // //       );
// // //     }
    
// // //     // Get file stats
// // //     const stats = await stat(resolvedPath);
// // //     if (!stats.isFile()) {
// // //       return NextResponse.json(
// // //         { error: 'Not a file' },
// // //         { status: 400 }
// // //       );
// // //     }
    
// // //     // Read the file
// // //     const fileBuffer = await readFile(resolvedPath);
    
// // //     // Determine content type based on file extension
// // //     const ext = path.extname(resolvedPath).toLowerCase();
// // //     let contentType = 'application/octet-stream';
    
// // //     const contentTypes: { [key: string]: string } = {
// // //       '.pdf': 'application/pdf',
// // //       '.jpg': 'image/jpeg',
// // //       '.jpeg': 'image/jpeg',
// // //       '.png': 'image/png',
// // //       '.gif': 'image/gif',
// // //       '.bmp': 'image/bmp',
// // //       '.webp': 'image/webp',
// // //       '.doc': 'application/msword',
// // //       '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// // //       '.txt': 'text/plain',
// // //     };
    
// // //     if (contentTypes[ext]) {
// // //       contentType = contentTypes[ext];
// // //     }
    
// // //     // Return the file with appropriate headers
// // //     return new NextResponse(fileBuffer, {
// // //       headers: {
// // //         'Content-Type': contentType,
// // //         'Content-Length': stats.size.toString(),
// // //         'Cache-Control': 'public, max-age=31536000',
// // //         'Content-Disposition': `inline; filename="${path.basename(resolvedPath)}"`,
// // //         // Add CORS headers if needed
// // //         'Access-Control-Allow-Origin': '*',
// // //         'Access-Control-Allow-Methods': 'GET',
// // //         'Access-Control-Allow-Headers': 'Content-Type',
// // //       },
// // //     });
    
// // //   } catch (error) {
// // //     console.error('Error serving file:', error);
// // //     return NextResponse.json(
// // //       { error: 'Internal server error' },
// // //       { status: 500 }
// // //     );
// // //   }
// // // }

// // import { NextRequest, NextResponse } from 'next/server';
// // import { readFile, stat } from 'fs/promises';
// // import path from 'path';
// // import { existsSync } from 'fs';

// // export async function GET(
// //   request: NextRequest,
// //   { params }: { params: Promise<{ path: string[] }> }
// // ) {
// //   try {
// //     const { path: filePath } = await params;
    
// //     // Reconstruct the file path
// //     const requestedPath = filePath.join('/');
    
// //     // Define your local files directory - this should be the root where 'data' folder exists
// //     const filesDirectory = path.join(process.cwd(), 'data');
// //     const fullPath = path.join(filesDirectory, requestedPath);
    
// //     // Security check: ensure the file is within the data directory
// //     const resolvedPath = path.resolve(fullPath);
// //     const resolvedDataDir = path.resolve(filesDirectory);
    
// //     if (!resolvedPath.startsWith(resolvedDataDir)) {
// //       return NextResponse.json(
// //         { error: 'Access denied' },
// //         { status: 403 }
// //       );
// //     }
    
// //     // Check if file exists
// //     if (!existsSync(resolvedPath)) {
// //       console.error('File not found:', resolvedPath);
// //       return NextResponse.json(
// //         { error: 'File not found' },
// //         { status: 404 }
// //       );
// //     }
    
// //     // Get file stats
// //     const stats = await stat(resolvedPath);
// //     if (!stats.isFile()) {
// //       return NextResponse.json(
// //         { error: 'Not a file' },
// //         { status: 400 }
// //       );
// //     }
    
// //     // Read the file
// //     const fileBuffer = await readFile(resolvedPath);
    
// //     // Determine content type based on file extension
// //     const ext = path.extname(resolvedPath).toLowerCase();
// //     let contentType = 'application/octet-stream';
    
// //     const contentTypes: { [key: string]: string } = {
// //       '.pdf': 'application/pdf',
// //       '.jpg': 'image/jpeg',
// //       '.jpeg': 'image/jpeg',
// //       '.png': 'image/png',
// //       '.gif': 'image/gif',
// //       '.bmp': 'image/bmp',
// //       '.webp': 'image/webp',
// //       '.doc': 'application/msword',
// //       '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// //       '.txt': 'text/plain',
// //     };
    
// //     if (contentTypes[ext]) {
// //       contentType = contentTypes[ext];
// //     }
    
// //     // Convert Buffer to Uint8Array for NextResponse
// //     const uint8Array = new Uint8Array(fileBuffer);
    
// //     // Return the file with appropriate headers
// //     return new NextResponse(uint8Array, {
// //       headers: {
// //         'Content-Type': contentType,
// //         'Content-Length': stats.size.toString(),
// //         'Cache-Control': 'public, max-age=31536000',
// //         'Content-Disposition': `inline; filename="${path.basename(resolvedPath)}"`,
// //         // Add CORS headers if needed
// //         'Access-Control-Allow-Origin': '*',
// //         'Access-Control-Allow-Methods': 'GET',
// //         'Access-Control-Allow-Headers': 'Content-Type',
// //       },
// //     });
    
// //   } catch (error) {
// //     console.error('Error serving file:', error);
// //     return NextResponse.json(
// //       { error: 'Internal server error' },
// //       { status: 500 }
// //     );
// //   }
// // }

// import { NextRequest, NextResponse } from 'next/server';
// import { readFile, stat } from 'fs/promises';
// import path from 'path';
// import { existsSync } from 'fs';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ path: string[] }> }
// ) {
//   try {
//     const { path: filePath } = await params;
    
//     // Reconstruct the file path
//     const requestedPath = filePath.join('/');
    
//     // Define your local files directory - this should be the root where 'data' folder exists
//     const filesDirectory = process.cwd();
//     const fullPath = path.join(filesDirectory, requestedPath);
    
//     // Security check: ensure the file is within the project directory
//     const resolvedPath = path.resolve(fullPath);
//     const resolvedProjectDir = path.resolve(filesDirectory);
    
//     if (!resolvedPath.startsWith(resolvedProjectDir)) {
//       return NextResponse.json(
//         { error: 'Access denied' },
//         { status: 403 }
//       );
//     }
    
//     // Check if file exists
//     if (!existsSync(resolvedPath)) {
//       console.error('File not found:', resolvedPath);
//       return NextResponse.json(
//         { error: 'File not found' },
//         { status: 404 }
//       );
//     }
    
//     // Get file stats
//     const stats = await stat(resolvedPath);
//     if (!stats.isFile()) {
//       return NextResponse.json(
//         { error: 'Not a file' },
//         { status: 400 }
//       );
//     }
    
//     // Read the file
//     const fileBuffer = await readFile(resolvedPath);
    
//     // Determine content type based on file extension
//     const ext = path.extname(resolvedPath).toLowerCase();
//     let contentType = 'application/octet-stream';
    
//     const contentTypes: { [key: string]: string } = {
//       '.pdf': 'application/pdf',
//       '.jpg': 'image/jpeg',
//       '.jpeg': 'image/jpeg',
//       '.png': 'image/png',
//       '.gif': 'image/gif',
//       '.bmp': 'image/bmp',
//       '.webp': 'image/webp',
//       '.doc': 'application/msword',
//       '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       '.txt': 'text/plain',
//     };
    
//     if (contentTypes[ext]) {
//       contentType = contentTypes[ext];
//     }
    
//     // Convert Buffer to Uint8Array for NextResponse
//     const uint8Array = new Uint8Array(fileBuffer);
    
//     // Return the file with appropriate headers
//     return new NextResponse(uint8Array, {
//       headers: {
//         'Content-Type': contentType,
//         'Content-Length': stats.size.toString(),
//         'Cache-Control': 'public, max-age=31536000',
//         'Content-Disposition': `inline; filename="${path.basename(resolvedPath)}"`,
//         // Add CORS headers if needed
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Methods': 'GET',
//         'Access-Control-Allow-Headers': 'Content-Type',
//       },
//     });
    
//   } catch (error) {
//     console.error('Error serving file:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: filePath } = await params;
    
    // Reconstruct the file path
    const requestedPath = filePath.join('/');
    
    // Define your local files directory - go up one level from project root to access data folder
    const filesDirectory = path.join(process.cwd(), '..');
    const fullPath = path.join(filesDirectory, requestedPath);
    
    // Security check: ensure the file is within the project directory
    const resolvedPath = path.resolve(fullPath);
    const resolvedProjectDir = path.resolve(filesDirectory);
    
    if (!resolvedPath.startsWith(resolvedProjectDir)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Check if file exists
    if (!existsSync(resolvedPath)) {
      console.error('File not found:', resolvedPath);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Get file stats
    const stats = await stat(resolvedPath);
    if (!stats.isFile()) {
      return NextResponse.json(
        { error: 'Not a file' },
        { status: 400 }
      );
    }
    
    // Read the file
    const fileBuffer = await readFile(resolvedPath);
    
    // Determine content type based on file extension
    const ext = path.extname(resolvedPath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    const contentTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
    };
    
    if (contentTypes[ext]) {
      contentType = contentTypes[ext];
    }
    
    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(fileBuffer);
    
    // Return the file with appropriate headers
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000',
        'Content-Disposition': `inline; filename="${path.basename(resolvedPath)}"`,
        // Add CORS headers if needed
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
    
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}