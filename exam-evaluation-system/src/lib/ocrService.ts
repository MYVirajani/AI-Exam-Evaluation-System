// // import fs from 'fs/promises';
// // import path from 'path';
// // import FormData from 'form-data';
// // import fetch from 'node-fetch';

// // // Configuration for the OCR service
// // const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:5001';
// // const OCR_HEALTH_CHECK_RETRIES = 3;
// // const OCR_HEALTH_CHECK_DELAY = 2000; // 2 seconds

// // interface OcrServiceResponse {
// //   success: boolean;
// //   error?: string;
// // }

// // interface HealthCheckResponse {
// //   status: string;
// //   trocr_available: boolean;
// // }

// // export class OcrService {
// //   private static instance: OcrService;
// //   private isServiceHealthy: boolean = false;

// //   private constructor() {
// //     this.checkServiceHealth();
// //   }

// //   public static getInstance(): OcrService {
// //     if (!OcrService.instance) {
// //       OcrService.instance = new OcrService();
// //     }
// //     return OcrService.instance;
// //   }

// //   private async checkServiceHealth(): Promise<void> {
// //     let retries = OCR_HEALTH_CHECK_RETRIES;
    
// //     while (retries > 0) {
// //       try {
// //         console.log(`Checking OCR service health... (${retries} retries left)`);
        
// //         // Create AbortController for timeout functionality
// //         const controller = new AbortController();
// //         const timeoutId = setTimeout(() => controller.abort(), 5000);
        
// //         const response = await fetch(`${OCR_SERVICE_URL}/health`, {
// //           method: 'GET',
// //           signal: controller.signal,
// //         });

// //         clearTimeout(timeoutId);

// //         if (response.ok) {
// //           const data = await response.json() as HealthCheckResponse;
// //           this.isServiceHealthy = data.status === 'healthy' && data.trocr_available;
          
// //           if (this.isServiceHealthy) {
// //             console.log('OCR service is healthy and ready');
// //             return;
// //           } else {
// //             console.warn('OCR service is running but TrOCR models are not available');
// //           }
// //         } else {
// //           console.warn(`OCR service health check failed with status: ${response.status}`);
// //         }
// //       } catch (error) {
// //         console.warn(`OCR service health check error: ${error}`);
// //       }

// //       retries--;
// //       if (retries > 0) {
// //         console.log(`Waiting ${OCR_HEALTH_CHECK_DELAY}ms before next health check...`);
// //         await new Promise(resolve => setTimeout(resolve, OCR_HEALTH_CHECK_DELAY));
// //       }
// //     }

// //     console.error('OCR service is not available after all retries');
// //     this.isServiceHealthy = false;
// //   }

// //   public async isReady(): Promise<boolean> {
// //     if (!this.isServiceHealthy) {
// //       await this.checkServiceHealth();
// //     }
// //     return this.isServiceHealthy;
// //   }

// //   public async convertHandwrittenPdf(
// //     handwrittenFilePath: string,
// //     outputDirectory: string,
// //     fileName: string
// //   ): Promise<{ success: boolean; convertedFilePath?: string; error?: string }> {
// //     try {
// //       // Check if service is ready
// //       if (!(await this.isReady())) {
// //         return {
// //           success: false,
// //           error: 'OCR service is not available. Please ensure the Python service is running.'
// //         };
// //       }

// //       // Check if input file exists
// //       try {
// //         await fs.access(handwrittenFilePath);
// //       } catch (error) {
// //         return {
// //           success: false,
// //           error: `Handwritten file not found: ${handwrittenFilePath}`
// //         };
// //       }

// //       console.log(`Starting OCR conversion for: ${handwrittenFilePath}`);

// //       // Read the handwritten PDF file
// //       const fileBuffer = await fs.readFile(handwrittenFilePath);

// //       // Create form data
// //       const formData = new FormData();
// //       formData.append('file', fileBuffer, {
// //         filename: path.basename(handwrittenFilePath),
// //         contentType: 'application/pdf',
// //       });

// //       // Create AbortController for timeout functionality
// //       const controller = new AbortController();
// //       const timeoutId = setTimeout(() => controller.abort(), 1200000); // 2 minutes timeout

// //       // Send request to OCR service
// //       const response = await fetch(`${OCR_SERVICE_URL}/convert-handwritten`, {
// //         method: 'POST',
// //         body: formData,
// //         signal: controller.signal,
// //       });

// //       clearTimeout(timeoutId);

// //       if (!response.ok) {
// //         const errorData = await response.json() as OcrServiceResponse;
// //         return {
// //           success: false,
// //           error: errorData.error || `OCR service returned status: ${response.status}`
// //         };
// //       }

// //       // Check if response is a PDF (binary data)
// //       const contentType = response.headers.get('content-type');
// //       if (contentType && contentType.includes('application/pdf')) {
// //         // Save the converted PDF
// //         const convertedBuffer = Buffer.from(await response.arrayBuffer());
        
// //         // Ensure output directory exists
// //         await fs.mkdir(outputDirectory, { recursive: true });
        
// //         // Create output file path
// //         const outputFilePath = path.join(outputDirectory, fileName);
        
// //         // Write converted PDF to file
// //         await fs.writeFile(outputFilePath, convertedBuffer);
        
// //         console.log(`OCR conversion completed successfully: ${outputFilePath}`);
        
// //         return {
// //           success: true,
// //           convertedFilePath: outputFilePath
// //         };
// //       } else {
// //         // Handle JSON error response
// //         const errorData = await response.json() as OcrServiceResponse;
// //         return {
// //           success: false,
// //           error: errorData.error || 'OCR conversion failed'
// //         };
// //       }

// //     } catch (error) {
// //       console.error('Error in OCR conversion:', error);
// //       return {
// //         success: false,
// //         error: error instanceof Error ? error.message : 'Unknown error occurred during OCR conversion'
// //       };
// //     }
// //   }

// //   public async startService(): Promise<boolean> {
// //     try {
// //       console.log('Attempting to start OCR service...');
      
// //       // Try to start the service (this would need to be implemented based on your deployment)
// //       // For now, just check if it's already running
// //       await this.checkServiceHealth();
      
// //       return this.isServiceHealthy;
// //     } catch (error) {
// //       console.error('Failed to start OCR service:', error);
// //       return false;
// //     }
// //   }
// // }

// // // Export singleton instance
// // export const ocrService = OcrService.getInstance();

// import fs from 'fs/promises';
// import path from 'path';
// import FormData from 'form-data';
// import fetch from 'node-fetch';

// // Configuration for the OCR service
// const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:5001';
// const OCR_HEALTH_CHECK_RETRIES = 3;
// const OCR_HEALTH_CHECK_DELAY = 2000; // 2 seconds

// interface OcrServiceResponse {
//   success: boolean;
//   error?: string;
// }

// interface HealthCheckResponse {
//   status: string;
//   trocr_available: boolean;
// }

// export class OcrService {
//   private static instance: OcrService;
//   private isServiceHealthy: boolean = false;

//   private constructor() {
//     this.checkServiceHealth();
//   }

//   public static getInstance(): OcrService {
//     if (!OcrService.instance) {
//       OcrService.instance = new OcrService();
//     }
//     return OcrService.instance;
//   }

//   private async checkServiceHealth(): Promise<void> {
//     let retries = OCR_HEALTH_CHECK_RETRIES;
    
//     while (retries > 0) {
//       try {
//         console.log(`Checking OCR service health... (${retries} retries left)`);
        
//         // Create AbortController for timeout functionality
//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 5000);
        
//         const response = await fetch(`${OCR_SERVICE_URL}/health`, {
//           method: 'GET',
//           signal: controller.signal,
//         });

//         clearTimeout(timeoutId);

//         if (response.ok) {
//           const data = await response.json() as HealthCheckResponse;
//           this.isServiceHealthy = data.status === 'healthy' && data.trocr_available;
          
//           if (this.isServiceHealthy) {
//             console.log('OCR service is healthy and ready');
//             return;
//           } else {
//             console.warn('OCR service is running but TrOCR models are not available');
//           }
//         } else {
//           console.warn(`OCR service health check failed with status: ${response.status}`);
//         }
//       } catch (error) {
//         console.warn(`OCR service health check error: ${error}`);
//       }

//       retries--;
//       if (retries > 0) {
//         console.log(`Waiting ${OCR_HEALTH_CHECK_DELAY}ms before next health check...`);
//         await new Promise(resolve => setTimeout(resolve, OCR_HEALTH_CHECK_DELAY));
//       }
//     }

//     console.error('OCR service is not available after all retries');
//     this.isServiceHealthy = false;
//   }

//   public async isReady(): Promise<boolean> {
//     if (!this.isServiceHealthy) {
//       await this.checkServiceHealth();
//     }
//     return this.isServiceHealthy;
//   }

//   private isImageFile(filename: string): boolean {
//     const imageExtensions = ['.png', '.jpg', '.jpeg'];
//     return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
//   }

//   private isPdfFile(filename: string): boolean {
//     return filename.toLowerCase().endsWith('.pdf');
//   }

//   public async convertHandwrittenFile(
//     handwrittenFilePath: string,
//     outputDirectory: string,
//     fileName: string
//   ): Promise<{ success: boolean; convertedFilePath?: string; error?: string }> {
//     try {
//       // Check if service is ready
//       if (!(await this.isReady())) {
//         return {
//           success: false,
//           error: 'OCR service is not available. Please ensure the Python service is running.'
//         };
//       }

//       // Check if input file exists
//       try {
//         await fs.access(handwrittenFilePath);
//       } catch (error) {
//         return {
//           success: false,
//           error: `Handwritten file not found: ${handwrittenFilePath}`
//         };
//       }

//       // Validate file format
//       const inputFileName = path.basename(handwrittenFilePath);
//       if (!this.isPdfFile(inputFileName) && !this.isImageFile(inputFileName)) {
//         return {
//           success: false,
//           error: 'Input file must be a PDF, PNG, JPG, or JPEG file'
//         };
//       }

//       console.log(`Starting OCR conversion for: ${handwrittenFilePath} (${this.isPdfFile(inputFileName) ? 'PDF' : 'Image'})`);

//       // Read the handwritten file
//       const fileBuffer = await fs.readFile(handwrittenFilePath);

//       // Create form data
//       const formData = new FormData();
//       formData.append('file', fileBuffer, {
//         filename: inputFileName,
//         contentType: this.getContentType(inputFileName),
//       });

//       // Create AbortController for timeout functionality
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 1200000); // 20 minutes timeout for image processing

//       // Send request to OCR service
//       const response = await fetch(`${OCR_SERVICE_URL}/convert-handwritten`, {
//         method: 'POST',
//         body: formData,
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);

//       if (!response.ok) {
//         const errorData = await response.json() as OcrServiceResponse;
//         return {
//           success: false,
//           error: errorData.error || `OCR service returned status: ${response.status}`
//         };
//       }

//       // Check if response is a PDF (binary data)
//       const contentType = response.headers.get('content-type');
//       if (contentType && contentType.includes('application/pdf')) {
//         // Save the converted PDF
//         const convertedBuffer = Buffer.from(await response.arrayBuffer());
        
//         // Ensure output directory exists
//         await fs.mkdir(outputDirectory, { recursive: true });
        
//         // Create output file path
//         const outputFilePath = path.join(outputDirectory, fileName);
        
//         // Write converted PDF to file
//         await fs.writeFile(outputFilePath, convertedBuffer);
        
//         console.log(`OCR conversion completed successfully: ${outputFilePath}`);
        
//         return {
//           success: true,
//           convertedFilePath: outputFilePath
//         };
//       } else {
//         // Handle JSON error response
//         const errorData = await response.json() as OcrServiceResponse;
//         return {
//           success: false,
//           error: errorData.error || 'OCR conversion failed'
//         };
//       }

//     } catch (error) {
//       console.error('Error in OCR conversion:', error);
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : 'Unknown error occurred during OCR conversion'
//       };
//     }
//   }

//   private getContentType(filename: string): string {
//     const ext = path.extname(filename).toLowerCase();
//     switch (ext) {
//       case '.pdf':
//         return 'application/pdf';
//       case '.png':
//         return 'image/png';
//       case '.jpg':
//       case '.jpeg':
//         return 'image/jpeg';
//       default:
//         return 'application/octet-stream';
//     }
//   }

//   // Backward compatibility - keep the old method name
//   public async convertHandwrittenPdf(
//     handwrittenFilePath: string,
//     outputDirectory: string,
//     fileName: string
//   ): Promise<{ success: boolean; convertedFilePath?: string; error?: string }> {
//     console.log('Note: convertHandwrittenPdf is deprecated. Use convertHandwrittenFile instead.');
//     return this.convertHandwrittenFile(handwrittenFilePath, outputDirectory, fileName);
//   }

//   public async startService(): Promise<boolean> {
//     try {
//       console.log('Attempting to start OCR service...');
      
//       // Try to start the service (this would need to be implemented based on your deployment)
//       // For now, just check if it's already running
//       await this.checkServiceHealth();
      
//       return this.isServiceHealthy;
//     } catch (error) {
//       console.error('Failed to start OCR service:', error);
//       return false;
//     }
//   }
// }

// // Export singleton instance
// export const ocrService = OcrService.getInstance();

// import fs from 'fs/promises';
// import path from 'path';
// import FormData from 'form-data';
// import fetch from 'node-fetch';

// // Configuration for the OCR service
// const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:5001';
// const OCR_HEALTH_CHECK_RETRIES = 3;
// const OCR_HEALTH_CHECK_DELAY = 2000; // 2 seconds

// interface OcrServiceResponse {
//   success: boolean;
//   error?: string;
// }

// interface HealthCheckResponse {
//   status: string;
//   trocr_available: boolean;
// }

// export class OcrService {
//   private static instance: OcrService;
//   private isServiceHealthy: boolean = false;

//   private constructor() {
//     this.checkServiceHealth();
//   }

//   public static getInstance(): OcrService {
//     if (!OcrService.instance) {
//       OcrService.instance = new OcrService();
//     }
//     return OcrService.instance;
//   }

//   private async checkServiceHealth(): Promise<void> {
//     let retries = OCR_HEALTH_CHECK_RETRIES;
    
//     while (retries > 0) {
//       try {
//         console.log(`Checking OCR service health... (${retries} retries left)`);
        
//         // Create AbortController for timeout functionality
//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 5000);
        
//         const response = await fetch(`${OCR_SERVICE_URL}/health`, {
//           method: 'GET',
//           signal: controller.signal,
//         });

//         clearTimeout(timeoutId);

//         if (response.ok) {
//           const data = await response.json() as HealthCheckResponse;
//           this.isServiceHealthy = data.status === 'healthy' && data.trocr_available;
          
//           if (this.isServiceHealthy) {
//             console.log('OCR service is healthy and ready');
//             return;
//           } else {
//             console.warn('OCR service is running but TrOCR models are not available');
//           }
//         } else {
//           console.warn(`OCR service health check failed with status: ${response.status}`);
//         }
//       } catch (error) {
//         console.warn(`OCR service health check error: ${error}`);
//       }

//       retries--;
//       if (retries > 0) {
//         console.log(`Waiting ${OCR_HEALTH_CHECK_DELAY}ms before next health check...`);
//         await new Promise(resolve => setTimeout(resolve, OCR_HEALTH_CHECK_DELAY));
//       }
//     }

//     console.error('OCR service is not available after all retries');
//     this.isServiceHealthy = false;
//   }

//   public async isReady(): Promise<boolean> {
//     if (!this.isServiceHealthy) {
//       await this.checkServiceHealth();
//     }
//     return this.isServiceHealthy;
//   }

//   private isImageFile(filename: string): boolean {
//     const imageExtensions = ['.png', '.jpg', '.jpeg'];
//     const result = imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
//     console.log(`DEBUG: Node.js isImageFile('${filename}') = ${result}`);
//     return result;
//   }

//   private isPdfFile(filename: string): boolean {
//     const result = filename.toLowerCase().endsWith('.pdf');
//     console.log(`DEBUG: Node.js isPdfFile('${filename}') = ${result}`);
//     return result;
//   }

//   public async convertHandwrittenFile(
//     handwrittenFilePath: string,
//     outputDirectory: string,
//     fileName: string
//   ): Promise<{ success: boolean; convertedFilePath?: string; error?: string }> {
//     try {
//       console.log(`=== NODE.JS OCR SERVICE DEBUG ===`);
//       console.log(`Input file path: ${handwrittenFilePath}`);
//       console.log(`Output directory: ${outputDirectory}`);
//       console.log(`Output filename: ${fileName}`);

//       // Check if service is ready
//       if (!(await this.isReady())) {
//         return {
//           success: false,
//           error: 'OCR service is not available. Please ensure the Python service is running.'
//         };
//       }

//       // Check if input file exists
//       try {
//         await fs.access(handwrittenFilePath);
//         console.log(`✓ Input file exists and is accessible`);
//       } catch (error) {
//         console.log(`✗ Input file not found: ${handwrittenFilePath}`);
//         return {
//           success: false,
//           error: `Handwritten file not found: ${handwrittenFilePath}`
//         };
//       }

//       // Get file stats for debugging
//       const fileStats = await fs.stat(handwrittenFilePath);
//       console.log(`File size: ${fileStats.size} bytes`);

//       // Validate file format
//       const inputFileName = path.basename(handwrittenFilePath);
//       const isPdf = this.isPdfFile(inputFileName);
//       const isImage = this.isImageFile(inputFileName);
      
//       console.log(`Input filename: ${inputFileName}`);
//       console.log(`Is PDF: ${isPdf}`);
//       console.log(`Is Image: ${isImage}`);

//       if (!isPdf && !isImage) {
//         return {
//           success: false,
//           error: `Input file must be a PDF, PNG, JPG, or JPEG file. Received: ${inputFileName}`
//         };
//       }

//       console.log(`Starting OCR conversion for: ${handwrittenFilePath} (${isPdf ? 'PDF' : 'Image'})`);

//       // Read the handwritten file
//       const fileBuffer = await fs.readFile(handwrittenFilePath);
//       console.log(`File buffer size: ${fileBuffer.length} bytes`);

//       // Create form data
//       const formData = new FormData();
//       formData.append('file', fileBuffer, {
//         filename: inputFileName,
//         contentType: this.getContentType(inputFileName),
//       });

//       console.log(`Sending request to: ${OCR_SERVICE_URL}/convert-handwritten`);
//       console.log(`Content-Type: ${this.getContentType(inputFileName)}`);

//       // Create AbortController for timeout functionality
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 1200000); // 20 minutes timeout for image processing

//       // Send request to OCR service
//       const response = await fetch(`${OCR_SERVICE_URL}/convert-handwritten`, {
//         method: 'POST',
//         body: formData,
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);

//       console.log(`OCR service response status: ${response.status}`);
//       console.log(`Response content-type: ${response.headers.get('content-type')}`);

//       if (!response.ok) {
//         let errorMessage = `OCR service returned status: ${response.status}`;
//         try {
//           const errorData = await response.json() as OcrServiceResponse;
//           errorMessage = errorData.error || errorMessage;
//         } catch (parseError) {
//           console.warn('Could not parse error response as JSON');
//           const textResponse = await response.text();
//           console.log(`Error response text: ${textResponse.substring(0, 500)}`);
//           errorMessage = textResponse || errorMessage;
//         }
        
//         console.log(`✗ OCR service error: ${errorMessage}`);
//         return {
//           success: false,
//           error: errorMessage
//         };
//       }

//       // Check if response is a PDF (binary data)
//       const contentType = response.headers.get('content-type');
//       if (contentType && contentType.includes('application/pdf')) {
//         console.log(`✓ Received PDF response`);
        
//         // Save the converted PDF
//         const convertedBuffer = Buffer.from(await response.arrayBuffer());
//         console.log(`Converted buffer size: ${convertedBuffer.length} bytes`);
        
//         // Ensure output directory exists
//         await fs.mkdir(outputDirectory, { recursive: true });
//         console.log(`✓ Output directory ensured: ${outputDirectory}`);
        
//         // Create output file path
//         const outputFilePath = path.join(outputDirectory, fileName);
//         console.log(`Writing to: ${outputFilePath}`);
        
//         // Write converted PDF to file
//         await fs.writeFile(outputFilePath, convertedBuffer);
        
//         // Verify file was written
//         const outputStats = await fs.stat(outputFilePath);
//         console.log(`✓ File written successfully: ${outputFilePath} (${outputStats.size} bytes)`);
        
//         console.log(`OCR conversion completed successfully: ${outputFilePath}`);
        
//         return {
//           success: true,
//           convertedFilePath: outputFilePath
//         };
//       } else {
//         // Handle JSON error response
//         console.log(`✗ Unexpected response content-type: ${contentType}`);
//         try {
//           const errorData = await response.json() as OcrServiceResponse;
//           console.log(`Error data:`, errorData);
//           return {
//             success: false,
//             error: errorData.error || 'OCR conversion failed - unexpected response format'
//           };
//         } catch (parseError) {
//           const textResponse = await response.text();
//           console.log(`Raw response: ${textResponse.substring(0, 500)}`);
//           return {
//             success: false,
//             error: `OCR conversion failed - could not parse response: ${textResponse.substring(0, 200)}`
//           };
//         }
//       }

//     } catch (error) {
//       console.error('✗ Error in OCR conversion:', error);
      
//       // Provide more specific error information
//       let errorMessage = 'Unknown error occurred during OCR conversion';
//       if (error instanceof Error) {
//         errorMessage = error.message;
        
//         // Check for specific error types
//         if (error.name === 'AbortError') {
//           errorMessage = 'OCR conversion timed out (20 minutes exceeded)';
//         } else if (error.message.includes('ECONNREFUSED')) {
//           errorMessage = 'Could not connect to OCR service. Is the Python service running?';
//         } else if (error.message.includes('fetch')) {
//           errorMessage = `Network error: ${error.message}`;
//         }
//       }
      
//       return {
//         success: false,
//         error: errorMessage
//       };
//     }
//   }

//   private getContentType(filename: string): string {
//     const ext = path.extname(filename).toLowerCase();
//     switch (ext) {
//       case '.pdf':
//         return 'application/pdf';
//       case '.png':
//         return 'image/png';
//       case '.jpg':
//       case '.jpeg':
//         return 'image/jpeg';
//       default:
//         return 'application/octet-stream';
//     }
//   }

//   // Backward compatibility - keep the old method name
//   public async convertHandwrittenPdf(
//     handwrittenFilePath: string,
//     outputDirectory: string,
//     fileName: string
//   ): Promise<{ success: boolean; convertedFilePath?: string; error?: string }> {
//     console.log('Note: convertHandwrittenPdf is deprecated. Use convertHandwrittenFile instead.');
//     return this.convertHandwrittenFile(handwrittenFilePath, outputDirectory, fileName);
//   }

//   public async startService(): Promise<boolean> {
//     try {
//       console.log('Attempting to start OCR service...');
      
//       // Try to start the service (this would need to be implemented based on your deployment)
//       // For now, just check if it's already running
//       await this.checkServiceHealth();
      
//       return this.isServiceHealthy;
//     } catch (error) {
//       console.error('Failed to start OCR service:', error);
//       return false;
//     }
//   }
// }

// // Export singleton instance
// export const ocrService = OcrService.getInstance();


// import fs from 'fs/promises';
// import path from 'path';
// import FormData from 'form-data';
// import fetch from 'node-fetch';

// // Configuration for the OCR service
// const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:5001';
// const OCR_HEALTH_CHECK_RETRIES = 3;
// const OCR_HEALTH_CHECK_DELAY = 2000; // 2 seconds

// interface OcrServiceResponse {
//   success: boolean;
//   error?: string;
// }

// interface HealthCheckResponse {
//   status: string;
//   trocr_available: boolean;
// }

// export class OcrService {
//   private static instance: OcrService;
//   private isServiceHealthy: boolean = false;

//   private constructor() {
//     this.checkServiceHealth();
//   }

//   public static getInstance(): OcrService {
//     if (!OcrService.instance) {
//       OcrService.instance = new OcrService();
//     }
//     return OcrService.instance;
//   }

//   private async checkServiceHealth(): Promise<void> {
//     let retries = OCR_HEALTH_CHECK_RETRIES;
    
//     while (retries > 0) {
//       try {
//         console.log(`Checking OCR service health... (${retries} retries left)`);
//         console.log(`OCR service URL: ${OCR_SERVICE_URL}`);
        
//         // Create AbortController for timeout functionality
//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 5000);
        
//         const response = await fetch(`${OCR_SERVICE_URL}/health`, {
//           method: 'GET',
//           signal: controller.signal,
//         });

//         clearTimeout(timeoutId);

//         console.log(`Health check response status: ${response.status}`);

//         if (response.ok) {
//           const data = await response.json() as HealthCheckResponse;
//           console.log(`Health check response:`, data);
          
//           this.isServiceHealthy = data.status === 'healthy' && data.trocr_available;
          
//           if (this.isServiceHealthy) {
//             console.log('✓ OCR service is healthy and ready');
//             return;
//           } else {
//             console.warn('⚠ OCR service is running but TrOCR models are not available');
//           }
//         } else {
//           console.warn(`OCR service health check failed with status: ${response.status}`);
//           const responseText = await response.text();
//           console.warn(`Response text: ${responseText}`);
//         }
//       } catch (error) {
//         console.warn(`OCR service health check error: ${error}`);
//         if (error instanceof Error) {
//           if (error.name === 'AbortError') {
//             console.warn('Health check timed out');
//           } else if (error.message.includes('ECONNREFUSED')) {
//             console.warn('Connection refused - OCR service might not be running');
//           }
//         }
//       }

//       retries--;
//       if (retries > 0) {
//         console.log(`Waiting ${OCR_HEALTH_CHECK_DELAY}ms before next health check...`);
//         await new Promise(resolve => setTimeout(resolve, OCR_HEALTH_CHECK_DELAY));
//       }
//     }

//     console.error('✗ OCR service is not available after all retries');
//     this.isServiceHealthy = false;
//   }

//   public async isReady(): Promise<boolean> {
//     if (!this.isServiceHealthy) {
//       console.log('Rechecking OCR service health...');
//       await this.checkServiceHealth();
//     }
//     console.log(`OCR service ready status: ${this.isServiceHealthy}`);
//     return this.isServiceHealthy;
//   }

//   private isImageFile(filename: string): boolean {
//     const imageExtensions = ['.png', '.jpg', '.jpeg'];
//     const result = imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
//     console.log(`DEBUG: Node.js isImageFile('${filename}') = ${result}`);
//     return result;
//   }

//   private isPdfFile(filename: string): boolean {
//     const result = filename.toLowerCase().endsWith('.pdf');
//     console.log(`DEBUG: Node.js isPdfFile('${filename}') = ${result}`);
//     return result;
//   }

//   public async convertHandwrittenFile(
//     handwrittenFilePath: string,
//     outputDirectory: string,
//     fileName: string
//   ): Promise<{ success: boolean; convertedFilePath?: string; error?: string }> {
//     try {
//       console.log(`=== NODE.JS OCR SERVICE DEBUG ===`);
//       console.log(`Input file path: ${handwrittenFilePath}`);
//       console.log(`Output directory: ${outputDirectory}`);
//       console.log(`Output filename: ${fileName}`);

//       // Check if service is ready
//       if (!(await this.isReady())) {
//         const errorMsg = 'OCR service is not available. Please ensure the Python service is running.';
//         console.log(`✗ ${errorMsg}`);
//         return {
//           success: false,
//           error: errorMsg
//         };
//       }

//       // Check if input file exists
//       try {
//         await fs.access(handwrittenFilePath);
//         console.log(`✓ Input file exists and is accessible`);
//       } catch (error) {
//         console.log(`✗ Input file not found: ${handwrittenFilePath}`);
//         console.log(`Access error:`, error);
//         return {
//           success: false,
//           error: `Handwritten file not found: ${handwrittenFilePath}`
//         };
//       }

//       // Get file stats for debugging
//       const fileStats = await fs.stat(handwrittenFilePath);
//       console.log(`File size: ${fileStats.size} bytes`);
//       console.log(`File created: ${fileStats.birthtime}`);
//       console.log(`File modified: ${fileStats.mtime}`);

//       // Validate file format
//       const inputFileName = path.basename(handwrittenFilePath);
//       const isPdf = this.isPdfFile(inputFileName);
//       const isImage = this.isImageFile(inputFileName);
      
//       console.log(`Input filename: ${inputFileName}`);
//       console.log(`Is PDF: ${isPdf}`);
//       console.log(`Is Image: ${isImage}`);

//       if (!isPdf && !isImage) {
//         const errorMsg = `Input file must be a PDF, PNG, JPG, or JPEG file. Received: ${inputFileName}`;
//         console.log(`✗ ${errorMsg}`);
//         return {
//           success: false,
//           error: errorMsg
//         };
//       }

//       console.log(`Starting OCR conversion for: ${handwrittenFilePath} (${isPdf ? 'PDF' : 'Image'})`);

//       // Read the handwritten file
//       const fileBuffer = await fs.readFile(handwrittenFilePath);
//       console.log(`File buffer size: ${fileBuffer.length} bytes`);

//       // Validate file content (basic checks)
//       if (fileBuffer.length === 0) {
//         console.log(`✗ File is empty`);
//         return {
//           success: false,
//           error: 'Input file is empty'
//         };
//       }

//       // Check file signature
//       const fileSignature = fileBuffer.slice(0, 8);
//       console.log(`File signature (hex): ${fileSignature.toString('hex')}`);
      
//       if (isPdf && !fileBuffer.toString('ascii', 0, 4).includes('%PDF')) {
//         console.log(`⚠ Warning: PDF file doesn't start with expected signature`);
//       }

//       // Create form data
//       const formData = new FormData();
//       formData.append('file', fileBuffer, {
//         filename: inputFileName,
//         contentType: this.getContentType(inputFileName),
//       });

//       console.log(`Sending request to: ${OCR_SERVICE_URL}/convert-handwritten`);
//       console.log(`Content-Type: ${this.getContentType(inputFileName)}`);

//       // Create AbortController for timeout functionality
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 1200000); // 20 minutes timeout for image processing

//       // Send request to OCR service
//       console.log('Sending request to Python OCR service...');
//       const response = await fetch(`${OCR_SERVICE_URL}/convert-handwritten`, {
//         method: 'POST',
//         body: formData,
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);

//       console.log(`OCR service response status: ${response.status}`);
//       console.log(`Response content-type: ${response.headers.get('content-type')}`);
//       console.log(`Response content-length: ${response.headers.get('content-length')}`);

//       if (!response.ok) {
//         let errorMessage = `OCR service returned status: ${response.status}`;
//         try {
//           const errorData = await response.json() as OcrServiceResponse;
//           errorMessage = errorData.error || errorMessage;
//           console.log('Error response data:', errorData);
//         } catch (parseError) {
//           console.warn('Could not parse error response as JSON');
//           const textResponse = await response.text();
//           console.log(`Error response text: ${textResponse.substring(0, 500)}`);
//           errorMessage = textResponse || errorMessage;
//         }
        
//         console.log(`✗ OCR service error: ${errorMessage}`);
//         return {
//           success: false,
//           error: errorMessage
//         };
//       }

//       // Check if response is a PDF (binary data)
//       const contentType = response.headers.get('content-type');
//       if (contentType && contentType.includes('application/pdf')) {
//         console.log(`✓ Received PDF response`);
        
//         // Save the converted PDF
//         const convertedBuffer = Buffer.from(await response.arrayBuffer());
//         console.log(`Converted buffer size: ${convertedBuffer.length} bytes`);
        
//         if (convertedBuffer.length === 0) {
//           console.log(`✗ Received empty PDF response`);
//           return {
//             success: false,
//             error: 'OCR service returned empty PDF'
//           };
//         }
        
//         // Ensure output directory exists
//         await fs.mkdir(outputDirectory, { recursive: true });
//         console.log(`✓ Output directory ensured: ${outputDirectory}`);
        
//         // Create output file path
//         const outputFilePath = path.join(outputDirectory, fileName);
//         console.log(`Writing to: ${outputFilePath}`);
        
//         // Write converted PDF to file
//         await fs.writeFile(outputFilePath, convertedBuffer);
        
//         // Verify file was written
//         const outputStats = await fs.stat(outputFilePath);
//         console.log(`✓ File written successfully: ${outputFilePath} (${outputStats.size} bytes)`);
        
//         // Additional verification - try to read the file back
//         try {
//           await fs.access(outputFilePath, fs.constants.R_OK);
//           console.log(`✓ Output file is readable`);
//         } catch (readError) {
//           console.log(`⚠ Warning: Output file might not be readable: ${readError}`);
//         }
        
//         console.log(`OCR conversion completed successfully: ${outputFilePath}`);
        
//         return {
//           success: true,
//           convertedFilePath: outputFilePath
//         };
//       } else {
//         // Handle JSON error response
//         console.log(`✗ Unexpected response content-type: ${contentType}`);
//         try {
//           const errorData = await response.json() as OcrServiceResponse;
//           console.log(`Error data:`, errorData);
//           return {
//             success: false,
//             error: errorData.error || 'OCR conversion failed - unexpected response format'
//           };
//         } catch (parseError) {
//           const textResponse = await response.text();
//           console.log(`Raw response: ${textResponse.substring(0, 500)}`);
//           return {
//             success: false,
//             error: `OCR conversion failed - could not parse response: ${textResponse.substring(0, 200)}`
//           };
//         }
//       }

//     } catch (error) {
//       console.error('✗ Error in OCR conversion:', error);
      
//       // Provide more specific error information
//       let errorMessage = 'Unknown error occurred during OCR conversion';
//       if (error instanceof Error) {
//         errorMessage = error.message;
//         console.error(`Error stack:`, error.stack);
        
//         // Check for specific error types
//         if (error.name === 'AbortError') {
//           errorMessage = 'OCR conversion timed out (20 minutes exceeded)';
//         } else if (error.message.includes('ECONNREFUSED')) {
//           errorMessage = 'Could not connect to OCR service. Is the Python service running?';
//         } else if (error.message.includes('fetch')) {
//           errorMessage = `Network error: ${error.message}`;
//         } else if (error.message.includes('ENOENT')) {
//           errorMessage = 'File not found during OCR processing';
//         } else if (error.message.includes('EACCES')) {
//           errorMessage = 'Permission denied during OCR processing';
//         }
//       }
      
//       return {
//         success: false,
//         error: errorMessage
//       };
//     }
//   }

//   private getContentType(filename: string): string {
//     const ext = path.extname(filename).toLowerCase();
//     switch (ext) {
//       case '.pdf':
//         return 'application/pdf';
//       case '.png':
//         return 'image/png';
//       case '.jpg':
//       case '.jpeg':
//         return 'image/jpeg';
//       default:
//         return 'application/octet-stream';
//     }
//   }

//   // Backward compatibility - keep the old method name
//   public async convertHandwrittenPdf(
//     handwrittenFilePath: string,
//     outputDirectory: string,
//     fileName: string
//   ): Promise<{ success: boolean; convertedFilePath?: string; error?: string }> {
//     console.log('Note: convertHandwrittenPdf is deprecated. Use convertHandwrittenFile instead.');
//     return this.convertHandwrittenFile(handwrittenFilePath, outputDirectory, fileName);
//   }

//   public async startService(): Promise<boolean> {
//     try {
//       console.log('Attempting to start OCR service...');
      
//       // Try to start the service (this would need to be implemented based on your deployment)
//       // For now, just check if it's already running
//       await this.checkServiceHealth();
      
//       return this.isServiceHealthy;
//     } catch (error) {
//       console.error('Failed to start OCR service:', error);
//       return false;
//     }
//   }
// }

// // Export singleton instance
// export const ocrService = OcrService.getInstance();

// import fs from 'fs/promises';
// import path from 'path';
// import FormData from 'form-data';
// import fetch from 'node-fetch';

// // Configuration for the OCR service
// const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:5001';
// const OCR_HEALTH_CHECK_RETRIES = 3;
// const OCR_HEALTH_CHECK_DELAY = 2000; // 2 seconds

// interface OcrServiceResponse {
//   success: boolean;
//   error?: string;
// }

// interface HealthCheckResponse {
//   status: string;
//   trocr_available: boolean;
// }

// export class OcrService {
//   private static instance: OcrService;
//   private isServiceHealthy: boolean = false;

//   private constructor() {
//     this.checkServiceHealth();
//   }

//   public static getInstance(): OcrService {
//     if (!OcrService.instance) {
//       OcrService.instance = new OcrService();
//     }
//     return OcrService.instance;
//   }

//   private async checkServiceHealth(): Promise<void> {
//     let retries = OCR_HEALTH_CHECK_RETRIES;
    
//     while (retries > 0) {
//       try {
//         console.log(`Checking OCR service health... (${retries} retries left)`);
//         console.log(`OCR service URL: ${OCR_SERVICE_URL}`);
        
//         // Create AbortController for timeout functionality
//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 5000);
        
//         const response = await fetch(`${OCR_SERVICE_URL}/health`, {
//           method: 'GET',
//           signal: controller.signal,
//         });

//         clearTimeout(timeoutId);

//         console.log(`Health check response status: ${response.status}`);

//         if (response.ok) {
//           const data = await response.json() as HealthCheckResponse;
//           console.log(`Health check response:`, data);
          
//           this.isServiceHealthy = data.status === 'healthy' && data.trocr_available;
          
//           if (this.isServiceHealthy) {
//             console.log('✓ OCR service is healthy and ready');
//             return;
//           } else {
//             console.warn('⚠ OCR service is running but TrOCR models are not available');
//           }
//         } else {
//           console.warn(`OCR service health check failed with status: ${response.status}`);
//           const responseText = await response.text();
//           console.warn(`Response text: ${responseText}`);
//         }
//       } catch (error) {
//         console.warn(`OCR service health check error: ${error}`);
//         if (error instanceof Error) {
//           if (error.name === 'AbortError') {
//             console.warn('Health check timed out');
//           } else if (error.message.includes('ECONNREFUSED')) {
//             console.warn('Connection refused - OCR service might not be running');
//           }
//         }
//       }

//       retries--;
//       if (retries > 0) {
//         console.log(`Waiting ${OCR_HEALTH_CHECK_DELAY}ms before next health check...`);
//         await new Promise(resolve => setTimeout(resolve, OCR_HEALTH_CHECK_DELAY));
//       }
//     }

//     console.error('✗ OCR service is not available after all retries');
//     this.isServiceHealthy = false;
//   }

//   public async isReady(): Promise<boolean> {
//     if (!this.isServiceHealthy) {
//       console.log('Rechecking OCR service health...');
//       await this.checkServiceHealth();
//     }
//     console.log(`OCR service ready status: ${this.isServiceHealthy}`);
//     return this.isServiceHealthy;
//   }

//   private isImageFile(filename: string): boolean {
//     const imageExtensions = ['.png', '.jpg', '.jpeg'];
//     const result = imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
//     console.log(`DEBUG: Node.js isImageFile('${filename}') = ${result}`);
//     return result;
//   }

//   private isPdfFile(filename: string): boolean {
//     const result = filename.toLowerCase().endsWith('.pdf');
//     console.log(`DEBUG: Node.js isPdfFile('${filename}') = ${result}`);
//     return result;
//   }

//   public async convertHandwrittenFile(
//     handwrittenFilePath: string,
//     outputDirectory: string,
//     fileName: string
//   ): Promise<{ success: boolean; convertedFilePath?: string; error?: string }> {
//     try {
//       console.log(`=== NODE.JS OCR SERVICE DEBUG ===`);
//       console.log(`Input file path: ${handwrittenFilePath}`);
//       console.log(`Output directory: ${outputDirectory}`);
//       console.log(`Output filename: ${fileName}`);

//       // Check if service is ready
//       if (!(await this.isReady())) {
//         const errorMsg = 'OCR service is not available. Please ensure the Python service is running.';
//         console.log(`✗ ${errorMsg}`);
//         return {
//           success: false,
//           error: errorMsg
//         };
//       }

//       // Check if input file exists
//       try {
//         await fs.access(handwrittenFilePath);
//         console.log(`✓ Input file exists and is accessible`);
//       } catch (error) {
//         console.log(`✗ Input file not found: ${handwrittenFilePath}`);
//         console.log(`Access error:`, error);
//         return {
//           success: false,
//           error: `Handwritten file not found: ${handwrittenFilePath}`
//         };
//       }

//       // Get file stats for debugging
//       const fileStats = await fs.stat(handwrittenFilePath);
//       console.log(`File size: ${fileStats.size} bytes`);
//       console.log(`File created: ${fileStats.birthtime}`);
//       console.log(`File modified: ${fileStats.mtime}`);

//       // CRITICAL FIX: Get the original filename from the file path
//       const inputFileName = path.basename(handwrittenFilePath);
//       const isPdf = this.isPdfFile(inputFileName);
//       const isImage = this.isImageFile(inputFileName);
      
//       console.log(`Input filename: ${inputFileName}`);
//       console.log(`Is PDF: ${isPdf}`);
//       console.log(`Is Image: ${isImage}`);

//       if (!isPdf && !isImage) {
//         const errorMsg = `Input file must be a PDF, PNG, JPG, or JPEG file. Received: ${inputFileName}`;
//         console.log(`✗ ${errorMsg}`);
//         return {
//           success: false,
//           error: errorMsg
//         };
//       }

//       console.log(`Starting OCR conversion for: ${handwrittenFilePath} (${isPdf ? 'PDF' : 'Image'})`);

//       // Read the handwritten file
//       const fileBuffer = await fs.readFile(handwrittenFilePath);
//       console.log(`File buffer size: ${fileBuffer.length} bytes`);

//       // Validate file content (basic checks)
//       if (fileBuffer.length === 0) {
//         console.log(`✗ File is empty`);
//         return {
//           success: false,
//           error: 'Input file is empty'
//         };
//       }

//       // Check file signature
//       const fileSignature = fileBuffer.slice(0, 8);
//       console.log(`File signature (hex): ${fileSignature.toString('hex')}`);
      
//       if (isPdf && !fileBuffer.toString('ascii', 0, 4).includes('%PDF')) {
//         console.log(`⚠ Warning: PDF file doesn't start with expected signature`);
//       }
      
//       // For images, check basic signatures
//       if (isImage) {
//         const isPng = fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x4E && fileBuffer[3] === 0x47;
//         const isJpeg = fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8 && fileBuffer[2] === 0xFF;
        
//         if (!isPng && !isJpeg) {
//           console.log(`⚠ Warning: Image file doesn't have expected signature (PNG: ${isPng}, JPEG: ${isJpeg})`);
//         } else {
//           console.log(`✓ Image signature validated (PNG: ${isPng}, JPEG: ${isJpeg})`);
//         }
//       }

//       // Create form data - CRITICAL FIX: Use original filename to help Python service identify file type
//       const formData = new FormData();
//       formData.append('file', fileBuffer, {
//         filename: inputFileName, // Use the actual filename from the path, not a generated one
//         contentType: this.getContentType(inputFileName),
//       });

//       console.log(`Sending request to: ${OCR_SERVICE_URL}/convert-handwritten`);
//       console.log(`Content-Type: ${this.getContentType(inputFileName)}`);
//       console.log(`Filename being sent: ${inputFileName}`);

//       // Create AbortController for timeout functionality
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 1200000); // 20 minutes timeout for image processing

//       // Send request to OCR service
//       console.log('Sending request to Python OCR service...');
//       const response = await fetch(`${OCR_SERVICE_URL}/convert-handwritten`, {
//         method: 'POST',
//         body: formData,
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);

//       console.log(`OCR service response status: ${response.status}`);
//       console.log(`Response content-type: ${response.headers.get('content-type')}`);
//       console.log(`Response content-length: ${response.headers.get('content-length')}`);

//       if (!response.ok) {
//         let errorMessage = `OCR service returned status: ${response.status}`;
//         try {
//           const errorData = await response.json() as OcrServiceResponse;
//           errorMessage = errorData.error || errorMessage;
//           console.log('Error response data:', errorData);
//         } catch (parseError) {
//           console.warn('Could not parse error response as JSON');
//           const textResponse = await response.text();
//           console.log(`Error response text: ${textResponse.substring(0, 500)}`);
//           errorMessage = textResponse || errorMessage;
//         }
        
//         console.log(`✗ OCR service error: ${errorMessage}`);
//         return {
//           success: false,
//           error: errorMessage
//         };
//       }

//       // Check if response is a PDF (binary data)
//       const contentType = response.headers.get('content-type');
//       if (contentType && contentType.includes('application/pdf')) {
//         console.log(`✓ Received PDF response`);
        
//         // Save the converted PDF
//         const convertedBuffer = Buffer.from(await response.arrayBuffer());
//         console.log(`Converted buffer size: ${convertedBuffer.length} bytes`);
        
//         if (convertedBuffer.length === 0) {
//           console.log(`✗ Received empty PDF response`);
//           return {
//             success: false,
//             error: 'OCR service returned empty PDF'
//           };
//         }
        
//         // Basic PDF validation
//         if (!convertedBuffer.toString('ascii', 0, 4).includes('%PDF')) {
//           console.log(`⚠ Warning: Converted response doesn't start with PDF signature`);
//         }
        
//         // Ensure output directory exists
//         await fs.mkdir(outputDirectory, { recursive: true });
//         console.log(`✓ Output directory ensured: ${outputDirectory}`);
        
//         // Create output file path
//         const outputFilePath = path.join(outputDirectory, fileName);
//         console.log(`Writing to: ${outputFilePath}`);
        
//         // Write converted PDF to file
//         await fs.writeFile(outputFilePath, convertedBuffer);
        
//         // Verify file was written
//         const outputStats = await fs.stat(outputFilePath);
//         console.log(`✓ File written successfully: ${outputFilePath} (${outputStats.size} bytes)`);
        
//         // Additional verification - try to read the file back
//         try {
//           await fs.access(outputFilePath, fs.constants.R_OK);
//           console.log(`✓ Output file is readable`);
          
//           // Verify it's a valid PDF by reading first few bytes
//           const testBuffer = await fs.readFile(outputFilePath);
//           if (testBuffer.length > 0 && testBuffer.toString('ascii', 0, 4).includes('%PDF')) {
//             console.log(`✓ Output file is a valid PDF`);
//           } else {
//             console.log(`⚠ Warning: Output file may not be a valid PDF`);
//           }
//         } catch (readError) {
//           console.log(`⚠ Warning: Output file might not be readable: ${readError}`);
//         }
        
//         console.log(`OCR conversion completed successfully: ${outputFilePath}`);
        
//         return {
//           success: true,
//           convertedFilePath: outputFilePath
//         };
//       } else {
//         // Handle JSON error response
//         console.log(`✗ Unexpected response content-type: ${contentType}`);
//         try {
//           const errorData = await response.json() as OcrServiceResponse;
//           console.log(`Error data:`, errorData);
//           return {
//             success: false,
//             error: errorData.error || 'OCR conversion failed - unexpected response format'
//           };
//         } catch (parseError) {
//           const textResponse = await response.text();
//           console.log(`Raw response: ${textResponse.substring(0, 500)}`);
//           return {
//             success: false,
//             error: `OCR conversion failed - could not parse response: ${textResponse.substring(0, 200)}`
//           };
//         }
//       }

//     } catch (error) {
//       console.error('✗ Error in OCR conversion:', error);
      
//       // Provide more specific error information
//       let errorMessage = 'Unknown error occurred during OCR conversion';
//       if (error instanceof Error) {
//         errorMessage = error.message;
//         console.error(`Error stack:`, error.stack);
        
//         // Check for specific error types
//         if (error.name === 'AbortError') {
//           errorMessage = 'OCR conversion timed out (20 minutes exceeded)';
//         } else if (error.message.includes('ECONNREFUSED')) {
//           errorMessage = 'Could not connect to OCR service. Is the Python service running?';
//         } else if (error.message.includes('fetch')) {
//           errorMessage = `Network error: ${error.message}`;
//         } else if (error.message.includes('ENOENT')) {
//           errorMessage = 'File not found during OCR processing';
//         } else if (error.message.includes('EACCES')) {
//           errorMessage = 'Permission denied during OCR processing';
//         }
//       }
      
//       return {
//         success: false,
//         error: errorMessage
//       };
//     }
//   }

//   private getContentType(filename: string): string {
//     const ext = path.extname(filename).toLowerCase();
//     switch (ext) {
//       case '.pdf':
//         return 'application/pdf';
//       case '.png':
//         return 'image/png';
//       case '.jpg':
//       case '.jpeg':
//         return 'image/jpeg';
//       default:
//         return 'application/octet-stream';
//     }
//   }

//   // Backward compatibility - keep the old method name
//   public async convertHandwrittenPdf(
//     handwrittenFilePath: string,
//     outputDirectory: string,
//     fileName: string
//   ): Promise<{ success: boolean; convertedFilePath?: string; error?: string }> {
//     console.log('Note: convertHandwrittenPdf is deprecated. Use convertHandwrittenFile instead.');
//     return this.convertHandwrittenFile(handwrittenFilePath, outputDirectory, fileName);
//   }

//   public async startService(): Promise<boolean> {
//     try {
//       console.log('Attempting to start OCR service...');
      
//       // Try to start the service (this would need to be implemented based on your deployment)
//       // For now, just check if it's already running
//       await this.checkServiceHealth();
      
//       return this.isServiceHealthy;
//     } catch (error) {
//       console.error('Failed to start OCR service:', error);
//       return false;
//     }
//   }
// }

// // Export singleton instance
// export const ocrService = OcrService.getInstance();

import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Configuration for the OCR service
const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:5001';
const OCR_HEALTH_CHECK_RETRIES = 3;
const OCR_HEALTH_CHECK_DELAY = 2000; // 2 seconds

interface OcrServiceResponse {
  success: boolean;
  error?: string;
}

interface HealthCheckResponse {
  status: string;
  trocr_available: boolean;
}

export class OcrService {
  private static instance: OcrService;
  private isServiceHealthy: boolean = false;

  private constructor() {
    this.checkServiceHealth();
  }

  public static getInstance(): OcrService {
    if (!OcrService.instance) {
      OcrService.instance = new OcrService();
    }
    return OcrService.instance;
  }

  private async checkServiceHealth(): Promise<void> {
    let retries = OCR_HEALTH_CHECK_RETRIES;
    
    while (retries > 0) {
      try {
        console.log(`Checking OCR service health... (${retries} retries left)`);
        console.log(`OCR service URL: ${OCR_SERVICE_URL}`);
        
        // Create AbortController for timeout functionality
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${OCR_SERVICE_URL}/health`, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log(`Health check response status: ${response.status}`);

        if (response.ok) {
          const data = await response.json() as HealthCheckResponse;
          console.log(`Health check response:`, data);
          
          this.isServiceHealthy = data.status === 'healthy' && data.trocr_available;
          
          if (this.isServiceHealthy) {
            console.log('✓ OCR service is healthy and ready');
            return;
          } else {
            console.warn('⚠ OCR service is running but TrOCR models are not available');
          }
        } else {
          console.warn(`OCR service health check failed with status: ${response.status}`);
          const responseText = await response.text();
          console.warn(`Response text: ${responseText}`);
        }
      } catch (error) {
        console.warn(`OCR service health check error: ${error}`);
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.warn('Health check timed out');
          } else if (error.message.includes('ECONNREFUSED')) {
            console.warn('Connection refused - OCR service might not be running');
          }
        }
      }

      retries--;
      if (retries > 0) {
        console.log(`Waiting ${OCR_HEALTH_CHECK_DELAY}ms before next health check...`);
        await new Promise(resolve => setTimeout(resolve, OCR_HEALTH_CHECK_DELAY));
      }
    }

    console.error('✗ OCR service is not available after all retries');
    this.isServiceHealthy = false;
  }

  public async isReady(): Promise<boolean> {
    if (!this.isServiceHealthy) {
      console.log('Rechecking OCR service health...');
      await this.checkServiceHealth();
    }
    console.log(`OCR service ready status: ${this.isServiceHealthy}`);
    return this.isServiceHealthy;
  }

  private isImageFile(filename: string): boolean {
    const imageExtensions = ['.png', '.jpg', '.jpeg'];
    const ext = path.extname(filename).toLowerCase();
    const result = imageExtensions.includes(ext);
    console.log(`DEBUG: Node.js isImageFile('${filename}') = ${result} (extension: ${ext})`);
    return result;
  }

  private isPdfFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    const result = ext === '.pdf';
    console.log(`DEBUG: Node.js isPdfFile('${filename}') = ${result} (extension: ${ext})`);
    return result;
  }

  public async convertHandwrittenFile(
    handwrittenFilePath: string,
    outputDirectory: string,
    fileName: string
  ): Promise<{ success: boolean; convertedFilePath?: string; error?: string }> {
    try {
      console.log(`=== NODE.JS OCR SERVICE DEBUG ===`);
      console.log(`Input file path: ${handwrittenFilePath}`);
      console.log(`Output directory: ${outputDirectory}`);
      console.log(`Output filename: ${fileName}`);

      // Check if service is ready
      if (!(await this.isReady())) {
        const errorMsg = 'OCR service is not available. Please ensure the Python service is running.';
        console.log(`✗ ${errorMsg}`);
        return {
          success: false,
          error: errorMsg
        };
      }

      // Check if input file exists
      try {
        await fs.access(handwrittenFilePath);
        console.log(`✓ Input file exists and is accessible`);
      } catch (error) {
        console.log(`✗ Input file not found: ${handwrittenFilePath}`);
        console.log(`Access error:`, error);
        return {
          success: false,
          error: `Handwritten file not found: ${handwrittenFilePath}`
        };
      }

      // Get file stats for debugging
      const fileStats = await fs.stat(handwrittenFilePath);
      console.log(`File size: ${fileStats.size} bytes`);
      console.log(`File created: ${fileStats.birthtime}`);
      console.log(`File modified: ${fileStats.mtime}`);

      // CRITICAL FIX: Get the original filename from the file path
      const inputFileName = path.basename(handwrittenFilePath);
      const isPdf = this.isPdfFile(inputFileName);
      const isImage = this.isImageFile(inputFileName);
      
      console.log(`Input filename: ${inputFileName}`);
      console.log(`Is PDF: ${isPdf}`);
      console.log(`Is Image: ${isImage}`);

      if (!isPdf && !isImage) {
        const errorMsg = `Input file must be a PDF, PNG, JPG, or JPEG file. Received: ${inputFileName}`;
        console.log(`✗ ${errorMsg}`);
        return {
          success: false,
          error: errorMsg
        };
      }

      console.log(`Starting OCR conversion for: ${handwrittenFilePath} (${isPdf ? 'PDF' : 'Image'})`);

      // Read the handwritten file
      const fileBuffer = await fs.readFile(handwrittenFilePath);
      console.log(`File buffer size: ${fileBuffer.length} bytes`);

      // Validate file content (basic checks)
      if (fileBuffer.length === 0) {
        console.log(`✗ File is empty`);
        return {
          success: false,
          error: 'Input file is empty'
        };
      }

      // Check file signature with enhanced validation for images
      const fileSignature = fileBuffer.slice(0, 8);
      console.log(`File signature (hex): ${fileSignature.toString('hex')}`);
      
      if (isPdf) {
        const pdfSignature = fileBuffer.toString('ascii', 0, 4);
        if (!pdfSignature.includes('%PDF')) {
          console.log(`⚠ Warning: PDF file doesn't start with expected signature (${pdfSignature})`);
        } else {
          console.log(`✓ PDF signature validated`);
        }
      }
      
      // Enhanced image signature validation
      if (isImage) {
        const isPng = fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x4E && fileBuffer[3] === 0x47;
        const isJpeg = fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8 && fileBuffer[2] === 0xFF;
        
        console.log(`Image signature validation:`);
        console.log(`  - PNG signature: ${isPng}`);
        console.log(`  - JPEG signature: ${isJpeg}`);
        
        if (!isPng && !isJpeg) {
          console.log(`⚠ Warning: Image file doesn't have expected signature but proceeding anyway`);
          console.log(`  - First 4 bytes (hex): ${fileBuffer.slice(0, 4).toString('hex')}`);
          console.log(`  - First 4 bytes (decimal): [${Array.from(fileBuffer.slice(0, 4)).join(', ')}]`);
        } else {
          console.log(`✓ Image signature validated`);
        }
      }

      // Create form data - CRITICAL FIX: Use original filename to help Python service identify file type
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: inputFileName, // Use the actual filename from the path
        contentType: this.getContentType(inputFileName),
      });

      console.log(`Sending request to: ${OCR_SERVICE_URL}/convert-handwritten`);
      console.log(`Content-Type: ${this.getContentType(inputFileName)}`);
      console.log(`Filename being sent: ${inputFileName}`);
      console.log(`File type being processed: ${isPdf ? 'PDF' : 'Image'}`);

      // Create AbortController for timeout functionality
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200000); // 20 minutes timeout for image processing

      // Send request to OCR service
      console.log('Sending request to Python OCR service...');
      const response = await fetch(`${OCR_SERVICE_URL}/convert-handwritten`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`OCR service response status: ${response.status}`);
      console.log(`Response content-type: ${response.headers.get('content-type')}`);
      console.log(`Response content-length: ${response.headers.get('content-length')}`);

      if (!response.ok) {
        let errorMessage = `OCR service returned status: ${response.status}`;
        try {
          const errorData = await response.json() as OcrServiceResponse;
          errorMessage = errorData.error || errorMessage;
          console.log('Error response data:', errorData);
        } catch (parseError) {
          console.warn('Could not parse error response as JSON');
          const textResponse = await response.text();
          console.log(`Error response text: ${textResponse.substring(0, 500)}`);
          errorMessage = textResponse || errorMessage;
        }
        
        console.log(`✗ OCR service error: ${errorMessage}`);
        return {
          success: false,
          error: errorMessage
        };
      }

      // Check if response is a PDF (binary data)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/pdf')) {
        console.log(`✓ Received PDF response`);
        
        // Save the converted PDF
        const convertedBuffer = Buffer.from(await response.arrayBuffer());
        console.log(`Converted buffer size: ${convertedBuffer.length} bytes`);
        
        if (convertedBuffer.length === 0) {
          console.log(`✗ Received empty PDF response`);
          return {
            success: false,
            error: 'OCR service returned empty PDF'
          };
        }
        
        // Basic PDF validation
        const pdfSignature = convertedBuffer.toString('ascii', 0, 4);
        if (!pdfSignature.includes('%PDF')) {
          console.log(`⚠ Warning: Converted response doesn't start with PDF signature (${pdfSignature})`);
        } else {
          console.log(`✓ Converted PDF signature validated`);
        }
        
        // Ensure output directory exists
        await fs.mkdir(outputDirectory, { recursive: true });
        console.log(`✓ Output directory ensured: ${outputDirectory}`);
        
        // Create output file path
        const outputFilePath = path.join(outputDirectory, fileName);
        console.log(`Writing to: ${outputFilePath}`);
        
        // Write converted PDF to file
        await fs.writeFile(outputFilePath, convertedBuffer);
        
        // Verify file was written
        const outputStats = await fs.stat(outputFilePath);
        console.log(`✓ File written successfully: ${outputFilePath} (${outputStats.size} bytes)`);
        
        // Additional verification - try to read the file back
        try {
          await fs.access(outputFilePath, fs.constants.R_OK);
          console.log(`✓ Output file is readable`);
          
          // Verify it's a valid PDF by reading first few bytes
          const testBuffer = await fs.readFile(outputFilePath);
          const testPdfSignature = testBuffer.toString('ascii', 0, 4);
          if (testBuffer.length > 0 && testPdfSignature.includes('%PDF')) {
            console.log(`✓ Output file is a valid PDF (signature: ${testPdfSignature})`);
          } else {
            console.log(`⚠ Warning: Output file may not be a valid PDF (signature: ${testPdfSignature})`);
          }
        } catch (readError) {
          console.log(`⚠ Warning: Output file might not be readable: ${readError}`);
        }
        
        console.log(`OCR conversion completed successfully: ${outputFilePath}`);
        console.log(`Conversion summary:`);
        console.log(`  - Input: ${inputFileName} (${isPdf ? 'PDF' : 'Image'}, ${fileStats.size} bytes)`);
        console.log(`  - Output: ${fileName} (PDF, ${outputStats.size} bytes)`);
        
        return {
          success: true,
          convertedFilePath: outputFilePath
        };
      } else {
        // Handle JSON error response
        console.log(`✗ Unexpected response content-type: ${contentType}`);
        try {
          const errorData = await response.json() as OcrServiceResponse;
          console.log(`Error data:`, errorData);
          return {
            success: false,
            error: errorData.error || 'OCR conversion failed - unexpected response format'
          };
        } catch (parseError) {
          const textResponse = await response.text();
          console.log(`Raw response: ${textResponse.substring(0, 500)}`);
          return {
            success: false,
            error: `OCR conversion failed - could not parse response: ${textResponse.substring(0, 200)}`
          };
        }
      }

    } catch (error) {
      console.error('✗ Error in OCR conversion:', error);
      
      // Provide more specific error information
      let errorMessage = 'Unknown error occurred during OCR conversion';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error(`Error stack:`, error.stack);
        
        // Check for specific error types
        if (error.name === 'AbortError') {
          errorMessage = 'OCR conversion timed out (20 minutes exceeded)';
        } else if (error.message.includes('ECONNREFUSED')) {
          errorMessage = 'Could not connect to OCR service. Is the Python service running?';
        } else if (error.message.includes('fetch')) {
          errorMessage = `Network error: ${error.message}`;
        } else if (error.message.includes('ENOENT')) {
          errorMessage = 'File not found during OCR processing';
        } else if (error.message.includes('EACCES')) {
          errorMessage = 'Permission denied during OCR processing';
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
      case '.pdf':
        return 'application/pdf';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      default:
        console.log(`⚠ Warning: Unknown file extension ${ext}, defaulting to octet-stream`);
        return 'application/octet-stream';
    }
  }

  // Backward compatibility - keep the old method name
  public async convertHandwrittenPdf(
    handwrittenFilePath: string,
    outputDirectory: string,
    fileName: string
  ): Promise<{ success: boolean; convertedFilePath?: string; error?: string }> {
    console.log('Note: convertHandwrittenPdf is deprecated. Use convertHandwrittenFile instead.');
    return this.convertHandwrittenFile(handwrittenFilePath, outputDirectory, fileName);
  }

  public async startService(): Promise<boolean> {
    try {
      console.log('Attempting to start OCR service...');
      
      // Try to start the service (this would need to be implemented based on your deployment)
      // For now, just check if it's already running
      await this.checkServiceHealth();
      
      return this.isServiceHealthy;
    } catch (error) {
      console.error('Failed to start OCR service:', error);
      return false;
    }
  }
}

// Export singleton instance
export const ocrService = OcrService.getInstance();