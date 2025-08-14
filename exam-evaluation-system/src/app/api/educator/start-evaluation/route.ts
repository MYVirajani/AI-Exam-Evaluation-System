// // // // // // app/api/educator/start-evaluation/route.ts
// // // // // import { NextRequest, NextResponse } from 'next/server'
// // // // // import { exec } from 'child_process'
// // // // // import { promisify } from 'util'
// // // // // import fs from 'fs/promises'
// // // // // import path from 'path'

// // // // // const execAsync = promisify(exec)

// // // // // export async function POST(request: NextRequest) {
// // // // //   try {
// // // // //     const { moduleId, selectedModel } = await request.json()

// // // // //     if (!moduleId) {
// // // // //       return NextResponse.json(
// // // // //         { error: 'Module ID is required' },
// // // // //         { status: 400 }
// // // // //       )
// // // // //     }

// // // // //     console.log(`Starting evaluation for module: ${moduleId} with model: ${selectedModel}`)

// // // // //     // Read commands from run.txt file
// // // // //     const runFilePath = path.join(process.cwd(), 'run.txt')
    
// // // // //     let commandsContent: string
// // // // //     try {
// // // // //       commandsContent = await fs.readFile(runFilePath, 'utf-8')
// // // // //     } catch (error) {
// // // // //       console.error('Error reading run.txt:', error)
// // // // //       return NextResponse.json(
// // // // //         { error: 'Could not read run.txt file' },
// // // // //         { status: 500 }
// // // // //       )
// // // // //     }

// // // // //     // Split commands by lines and filter out empty lines and comments
// // // // //     const commands = commandsContent
// // // // //       .split('\n')
// // // // //       .map(line => line.trim())
// // // // //       .filter(line => line && !line.startsWith('#'))

// // // // //     if (commands.length === 0) {
// // // // //       return NextResponse.json(
// // // // //         { error: 'No valid commands found in run.txt' },
// // // // //         { status: 400 }
// // // // //       )
// // // // //     }

// // // // //     console.log(`Found ${commands.length} commands to execute`)

// // // // //     // Execute commands sequentially
// // // // //     const results: { command: string; success: boolean; output?: string; error?: string }[] = []

// // // // //     for (const command of commands) {
// // // // //       try {
// // // // //         console.log(`Executing: ${command}`)
        
// // // // //         // You can modify commands dynamically based on moduleId or selectedModel
// // // // //         let modifiedCommand = command
// // // // //           .replace('{{moduleId}}', moduleId)
// // // // //           .replace('{{selectedModel}}', selectedModel)

// // // // //         const { stdout, stderr } = await execAsync(modifiedCommand, {
// // // // //           cwd: process.cwd(),
// // // // //           timeout: 300000, // 5 minutes timeout per command
// // // // //         })

// // // // //         results.push({
// // // // //           command: modifiedCommand,
// // // // //           success: true,
// // // // //           output: stdout,
// // // // //         })

// // // // //         if (stderr) {
// // // // //           console.warn(`Warning for command "${modifiedCommand}":`, stderr)
// // // // //         }

// // // // //         console.log(`✅ Completed: ${modifiedCommand}`)

// // // // //       } catch (error: any) {
// // // // //         console.error(`❌ Failed: ${command}`, error)
        
// // // // //         results.push({
// // // // //           command,
// // // // //           success: false,
// // // // //           error: error.message,
// // // // //         })

// // // // //         // Decide whether to continue or stop on error
// // // // //         // For now, we'll continue with remaining commands
// // // // //         // You can change this behavior based on your needs
// // // // //       }
// // // // //     }

// // // // //     // Check if all commands were successful
// // // // //     const allSuccessful = results.every(result => result.success)
// // // // //     const successfulCount = results.filter(result => result.success).length

// // // // //     return NextResponse.json({
// // // // //       success: allSuccessful,
// // // // //       message: allSuccessful 
// // // // //         ? 'All evaluation commands completed successfully'
// // // // //         : `${successfulCount}/${results.length} commands completed successfully`,
// // // // //       results,
// // // // //       moduleId,
// // // // //       selectedModel,
// // // // //     })

// // // // //   } catch (error: any) {
// // // // //     console.error('Error in start-evaluation API:', error)
// // // // //     return NextResponse.json(
// // // // //       { error: 'Internal server error', details: error.message },
// // // // //       { status: 500 }
// // // // //     )
// // // // //   }
// // // // // }

// // // // // app/api/educator/start-evaluation/route.ts
// // // // import { NextRequest, NextResponse } from 'next/server'
// // // // import { exec } from 'child_process'
// // // // import { promisify } from 'util'
// // // // import fs from 'fs/promises'
// // // // import path from 'path'

// // // // const execAsync = promisify(exec)

// // // // export async function POST(request: NextRequest) {
// // // //   try {
// // // //     const { selectedModel } = await request.json()

// // // //     console.log(`Starting evaluation with model: ${selectedModel}`)

// // // //     // Read commands from run.txt file
// // // //     const runFilePath = path.join(process.cwd(), '../../../../../run.txt')
    
// // // //     let commandsContent: string
// // // //     try {
// // // //       commandsContent = await fs.readFile(runFilePath, 'utf-8')
// // // //     } catch (error) {
// // // //       console.error('Error reading run.txt:', error)
// // // //       return NextResponse.json(
// // // //         { error: 'Could not read run.txt file' },
// // // //         { status: 500 }
// // // //       )
// // // //     }

// // // //     // Split commands by lines and filter out empty lines and comments
// // // //     const commands = commandsContent
// // // //       .split('\n')
// // // //       .map(line => line.trim())
// // // //       .filter(line => line && !line.startsWith('#'))

// // // //     if (commands.length === 0) {
// // // //       return NextResponse.json(
// // // //         { error: 'No valid commands found in run.txt' },
// // // //         { status: 400 }
// // // //       )
// // // //     }

// // // //     console.log(`Found ${commands.length} commands to execute`)

// // // //     // Execute commands sequentially
// // // //     const results: { command: string; success: boolean; output?: string; error?: string }[] = []

// // // //     for (const command of commands) {
// // // //       try {
// // // //         console.log(`Executing: ${command}`)
        
// // // //         // You can modify commands dynamically based on selectedModel
// // // //         let modifiedCommand = command
// // // //           .replace('{{selectedModel}}', selectedModel)

// // // //         const { stdout, stderr } = await execAsync(modifiedCommand, {
// // // //           cwd: process.cwd(),
// // // //           timeout: 300000, // 5 minutes timeout per command
// // // //         })

// // // //         results.push({
// // // //           command: modifiedCommand,
// // // //           success: true,
// // // //           output: stdout,
// // // //         })

// // // //         if (stderr) {
// // // //           console.warn(`Warning for command "${modifiedCommand}":`, stderr)
// // // //         }

// // // //         console.log(`✅ Completed: ${modifiedCommand}`)

// // // //       } catch (error: any) {
// // // //         console.error(`❌ Failed: ${command}`, error)
        
// // // //         results.push({
// // // //           command,
// // // //           success: false,
// // // //           error: error.message,
// // // //         })

// // // //         // Decide whether to continue or stop on error
// // // //         // For now, we'll continue with remaining commands
// // // //         // You can change this behavior based on your needs
// // // //       }
// // // //     }

// // // //     // Check if all commands were successful
// // // //     const allSuccessful = results.every(result => result.success)
// // // //     const successfulCount = results.filter(result => result.success).length

// // // //     return NextResponse.json({
// // // //       success: allSuccessful,
// // // //       message: allSuccessful 
// // // //         ? 'All evaluation commands completed successfully'
// // // //         : `${successfulCount}/${results.length} commands completed successfully`,
// // // //       results,
// // // //       selectedModel,
// // // //     })

// // // //   } catch (error: any) {
// // // //     console.error('Error in start-evaluation API:', error)
// // // //     return NextResponse.json(
// // // //       { error: 'Internal server error', details: error.message },
// // // //       { status: 500 }
// // // //     )
// // // //   }
// // // // }

// // // // app/api/educator/start-evaluation/route.ts
// // // import { NextRequest, NextResponse } from 'next/server'
// // // import { exec } from 'child_process'
// // // import { promisify } from 'util'
// // // import fs from 'fs/promises'
// // // import path from 'path'

// // // const execAsync = promisify(exec)

// // // export async function POST(request: NextRequest) {
// // //   try {
// // //     const { selectedModel } = await request.json()

// // //     console.log(`Starting evaluation with model: ${selectedModel}`)

// // //     // Read commands from run.txt file
// // //     const runFilePath = path.join(process.cwd(), 'run.txt')
    
// // //     console.log('Looking for run.txt at:', runFilePath)
    
// // //     let commandsContent: string
// // //     try {
// // //       commandsContent = await fs.readFile(runFilePath, 'utf-8')
// // //     } catch (error) {
// // //       console.error('Error reading run.txt:', error)
// // //       console.error('Current working directory:', process.cwd())
// // //       console.error('Attempted path:', runFilePath)
      
// // //       // Try alternative path (parent directory)
// // //       const alternativePath = path.join(process.cwd(), '..', 'run.txt')
// // //       console.log('Trying alternative path:', alternativePath)
      
// // //       try {
// // //         commandsContent = await fs.readFile(alternativePath, 'utf-8')
// // //         console.log('Found run.txt at alternative path')
// // //       } catch (altError) {
// // //         console.error('Alternative path also failed:', altError)
// // //         return NextResponse.json(
// // //           { error: 'Could not find run.txt file. Please ensure it exists in the project root.' },
// // //           { status: 500 }
// // //         )
// // //       }
// // //     }

// // //     // Split commands by lines and filter out empty lines and comments
// // //     const commands = commandsContent
// // //       .split('\n')
// // //       .map(line => line.trim())
// // //       .filter(line => line && !line.startsWith('#'))

// // //     if (commands.length === 0) {
// // //       return NextResponse.json(
// // //         { error: 'No valid commands found in run.txt' },
// // //         { status: 400 }
// // //       )
// // //     }

// // //     console.log(`Found ${commands.length} commands to execute`)

// // //     // Execute commands sequentially
// // //     const results: { command: string; success: boolean; output?: string; error?: string }[] = []

// // //     for (const command of commands) {
// // //       try {
// // //         console.log(`Executing: ${command}`)
        
// // //         // You can modify commands dynamically based on selectedModel
// // //         let modifiedCommand = command
// // //           .replace('{{selectedModel}}', selectedModel)

// // //         const { stdout, stderr } = await execAsync(modifiedCommand, {
// // //           cwd: process.cwd(),
// // //           timeout: 300000, // 5 minutes timeout per command
// // //         })

// // //         results.push({
// // //           command: modifiedCommand,
// // //           success: true,
// // //           output: stdout,
// // //         })

// // //         if (stderr) {
// // //           console.warn(`Warning for command "${modifiedCommand}":`, stderr)
// // //         }

// // //         console.log(`✅ Completed: ${modifiedCommand}`)

// // //       } catch (error: any) {
// // //         console.error(`❌ Failed: ${command}`, error)
        
// // //         results.push({
// // //           command,
// // //           success: false,
// // //           error: error.message,
// // //         })

// // //         // Decide whether to continue or stop on error
// // //         // For now, we'll continue with remaining commands
// // //         // You can change this behavior based on your needs
// // //       }
// // //     }

// // //     // Check if all commands were successful
// // //     const allSuccessful = results.every(result => result.success)
// // //     const successfulCount = results.filter(result => result.success).length

// // //     return NextResponse.json({
// // //       success: allSuccessful,
// // //       message: allSuccessful 
// // //         ? 'All evaluation commands completed successfully'
// // //         : `${successfulCount}/${results.length} commands completed successfully`,
// // //       results,
// // //       selectedModel,
// // //     })

// // //   } catch (error: any) {
// // //     console.error('Error in start-evaluation API:', error)
// // //     return NextResponse.json(
// // //       { error: 'Internal server error', details: error.message },
// // //       { status: 500 }
// // //     )
// // //   }
// // // }

// // // app/api/educator/start-evaluation/route.ts
// // import { NextRequest, NextResponse } from 'next/server'
// // import { exec } from 'child_process'
// // import { promisify } from 'util'
// // import fs from 'fs/promises'
// // import path from 'path'

// // const execAsync = promisify(exec)

// // export async function POST(request: NextRequest) {
// //   try {
// //     const { selectedModel } = await request.json()

// //     console.log(`Starting evaluation with model: ${selectedModel}`)

// //     // Read commands from run.txt file
// //     const runFilePath = path.join(process.cwd(), 'run.txt')
    
// //     console.log('Looking for run.txt at:', runFilePath)
    
// //     let commandsContent: string
// //     try {
// //       commandsContent = await fs.readFile(runFilePath, 'utf-8')
// //     } catch (error) {
// //       console.error('Error reading run.txt:', error)
// //       console.error('Current working directory:', process.cwd())
// //       console.error('Attempted path:', runFilePath)
      
// //       // Try alternative path (parent directory)
// //       const alternativePath = path.join(process.cwd(), '..', 'run.txt')
// //       console.log('Trying alternative path:', alternativePath)
      
// //       try {
// //         commandsContent = await fs.readFile(alternativePath, 'utf-8')
// //         console.log('Found run.txt at alternative path')
// //       } catch (altError) {
// //         console.error('Alternative path also failed:', altError)
// //         return NextResponse.json(
// //           { error: 'Could not find run.txt file. Please ensure it exists in the project root.' },
// //           { status: 500 }
// //         )
// //       }
// //     }

// //     // Split commands by lines and filter out empty lines and comments
// //     // Also handle multi-line commands by joining lines that end with backtick
// //     const rawLines = commandsContent
// //       .split('\n')
// //       .map(line => line.trim())
// //       .filter(line => line && !line.startsWith('#'))

// //     const commands: string[] = []
// //     let currentCommand = ''

// //     for (const line of rawLines) {
// //       if (line.endsWith('`')) {
// //         // This line continues to the next line
// //         currentCommand += line.slice(0, -1).trim() + ' '
// //       } else {
// //         // This is the end of the command
// //         currentCommand += line
// //         if (currentCommand.trim()) {
// //           commands.push(currentCommand.trim())
// //         }
// //         currentCommand = ''
// //       }
// //     }

// //     // Handle case where last line ended with backtick
// //     if (currentCommand.trim()) {
// //       commands.push(currentCommand.trim())
// //     }

// //     if (commands.length === 0) {
// //       return NextResponse.json(
// //         { error: 'No valid commands found in run.txt' },
// //         { status: 400 }
// //       )
// //     }

// //     console.log(`Found ${commands.length} commands to execute`)

// //     // Execute commands sequentially
// //     const results: { command: string; success: boolean; output?: string; error?: string }[] = []

// //     for (const command of commands) {
// //       try {
// //         console.log(`Executing: ${command}`)
        
// //         // You can modify commands dynamically based on selectedModel
// //         let modifiedCommand = command
// //           .replace('{{selectedModel}}', selectedModel)

// //         const { stdout, stderr } = await execAsync(modifiedCommand, {
// //           cwd: path.join(process.cwd(), '..'), // Run from parent directory where src folder exists
// //           timeout: 300000, // 5 minutes timeout per command
// //         })

// //         results.push({
// //           command: modifiedCommand,
// //           success: true,
// //           output: stdout,
// //         })

// //         if (stderr) {
// //           console.warn(`Warning for command "${modifiedCommand}":`, stderr)
// //         }

// //         console.log(`✅ Completed: ${modifiedCommand}`)

// //       } catch (error: any) {
// //         console.error(`❌ Failed: ${command}`, error)
        
// //         results.push({
// //           command,
// //           success: false,
// //           error: error.message,
// //         })

// //         // Decide whether to continue or stop on error
// //         // For now, we'll continue with remaining commands
// //         // You can change this behavior based on your needs
// //       }
// //     }

// //     // Check if all commands were successful
// //     const allSuccessful = results.every(result => result.success)
// //     const successfulCount = results.filter(result => result.success).length

// //     return NextResponse.json({
// //       success: allSuccessful,
// //       message: allSuccessful 
// //         ? 'All evaluation commands completed successfully'
// //         : `${successfulCount}/${results.length} commands completed successfully`,
// //       results,
// //       selectedModel,
// //     })

// //   } catch (error: any) {
// //     console.error('Error in start-evaluation API:', error)
// //     return NextResponse.json(
// //       { error: 'Internal server error', details: error.message },
// //       { status: 500 }
// //     )
// //   }
// // }

// // app/api/educator/start-evaluation/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { exec } from 'child_process'
// import { promisify } from 'util'
// import fs from 'fs/promises'
// import path from 'path'

// const execAsync = promisify(exec)

// export async function POST(request: NextRequest) {
//   try {
//     const { selectedModel, moduleId, assessmentId } = await request.json()

//     console.log(`Starting evaluation with model: ${selectedModel}`)
//     console.log(`Module ID: ${moduleId}, Assessment ID: ${assessmentId}`)

//     // Map model names to corresponding run files
//     const modelToFileMap: { [key: string]: string } = {
//       'ChatGPT': 'run_openai.txt',
//       'Deepseek': 'run.txt',
//       'Gemini': 'run_gemini.txt',
//       'Llama': 'run.txt'
//     }

//     // Get the appropriate run file based on selected model
//     const runFileName = modelToFileMap[selectedModel] || 'run.txt'
    
//     console.log(`Using run file: ${runFileName} for model: ${selectedModel}`)

//     // Read commands from the appropriate run file
//     const runFilePath = path.join(process.cwd(), runFileName)
    
//     console.log('Looking for run file at:', runFilePath)
    
//     let commandsContent: string
//     try {
//       commandsContent = await fs.readFile(runFilePath, 'utf-8')
//     } catch (error) {
//       console.error(`Error reading ${runFileName}:`, error)
//       console.error('Current working directory:', process.cwd())
//       console.error('Attempted path:', runFilePath)
      
//       // Try alternative path (parent directory)
//       const alternativePath = path.join(process.cwd(), '..', runFileName)
//       console.log('Trying alternative path:', alternativePath)
      
//       try {
//         commandsContent = await fs.readFile(alternativePath, 'utf-8')
//         console.log(`Found ${runFileName} at alternative path`)
//       } catch (altError) {
//         console.error('Alternative path also failed:', altError)
//         return NextResponse.json(
//           { error: `Could not find ${runFileName} file. Please ensure it exists in the project root.` },
//           { status: 500 }
//         )
//       }
//     }

//     // Split commands by lines and filter out empty lines and comments
//     // Also handle multi-line commands by joining lines that end with backtick
//     const rawLines = commandsContent
//       .split('\n')
//       .map(line => line.trim())
//       .filter(line => line && !line.startsWith('#'))

//     const commands: string[] = []
//     let currentCommand = ''

//     for (const line of rawLines) {
//       if (line.endsWith('`')) {
//         // This line continues to the next line
//         currentCommand += line.slice(0, -1).trim() + ' '
//       } else {
//         // This is the end of the command
//         currentCommand += line
//         if (currentCommand.trim()) {
//           commands.push(currentCommand.trim())
//         }
//         currentCommand = ''
//       }
//     }

//     // Handle case where last line ended with backtick
//     if (currentCommand.trim()) {
//       commands.push(currentCommand.trim())
//     }

//     if (commands.length === 0) {
//       return NextResponse.json(
//         { error: `No valid commands found in ${runFileName}` },
//         { status: 400 }
//       )
//     }

//     console.log(`Found ${commands.length} commands to execute from ${runFileName}`)

//     // Execute commands sequentially
//     const results: { command: string; success: boolean; output?: string; error?: string }[] = []

//     for (const command of commands) {
//       try {
//         console.log(`Executing: ${command}`)
        
//         // Replace placeholders in commands with actual values
//         let modifiedCommand = command
//           .replace(/\{\{selectedModel\}\}/g, selectedModel)
//           .replace(/\{\{model\}\}/g, selectedModel.toLowerCase())
//           .replace(/\{\{moduleId\}\}/g, moduleId || '')
//           .replace(/\{\{assessmentId\}\}/g, assessmentId || '')

//         const { stdout, stderr } = await execAsync(modifiedCommand, {
//           cwd: path.join(process.cwd(), '..'), // Run from parent directory where src folder exists
//           timeout: 300000, // 5 minutes timeout per command
//           env: {
//             ...process.env,
//             SELECTED_MODEL: selectedModel,
//             MODULE_ID: moduleId || '',
//             ASSESSMENT_ID: assessmentId || ''
//           }
//         })

//         results.push({
//           command: modifiedCommand,
//           success: true,
//           output: stdout,
//         })

//         if (stderr) {
//           console.warn(`Warning for command "${modifiedCommand}":`, stderr)
//         }

//         console.log(`✅ Completed: ${modifiedCommand}`)

//       } catch (error: any) {
//         console.error(`❌ Failed: ${command}`, error)
        
//         results.push({
//           command,
//           success: false,
//           error: error.message,
//         })

//         // Decide whether to continue or stop on error
//         // For now, we'll continue with remaining commands
//         // You can change this behavior based on your needs
//         console.log('Continuing with next command despite error...')
//       }
//     }

//     // Check if all commands were successful
//     const allSuccessful = results.every(result => result.success)
//     const successfulCount = results.filter(result => result.success).length

//     console.log(`Evaluation completed: ${successfulCount}/${results.length} commands successful`)

//     return NextResponse.json({
//       success: allSuccessful,
//       message: allSuccessful 
//         ? `All evaluation commands completed successfully using ${runFileName}`
//         : `${successfulCount}/${results.length} commands completed successfully using ${runFileName}`,
//       results,
//       selectedModel,
//       runFile: runFileName,
//       moduleId,
//       assessmentId,
//       executedCommands: results.length,
//       successfulCommands: successfulCount
//     })

//   } catch (error: any) {
//     console.error('Error in start-evaluation API:', error)
//     return NextResponse.json(
//       { error: 'Internal server error', details: error.message },
//       { status: 500 }
//     )
//   }
// }

// app/api/educator/start-evaluation/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Flask API base URL - adjust this to match your Flask server
const FLASK_API_BASE = process.env.FLASK_API_BASE || 'http://localhost:7000'

export async function POST(request: NextRequest) {
  try {
    const { selectedModel, moduleId, assessmentId, evaluationType, parameters } = await request.json()

    console.log(`Starting evaluation with model: ${selectedModel}`)
    console.log(`Module ID: ${moduleId}, Assessment ID: ${assessmentId}`)
    console.log(`Evaluation type: ${evaluationType}`)

    // Map frontend model names to backend provider names
    const modelToProviderMap: { [key: string]: string } = {
      'ChatGPT': 'OpenAI',
      'Deepseek': 'OpenAI',  // Assuming Deepseek uses OpenAI-compatible API
      'Gemini': 'GoogleGemini',
      'Llama': 'OpenAI'  // Assuming Llama uses OpenAI-compatible API
    }

    const provider = modelToProviderMap[selectedModel] || 'OpenAI'

    // Prepare the request payload for Flask API
    const flaskPayload = {
      provider: provider,
      module_code: moduleId,
      year: parameters?.year || '2025',
      month: parameters?.month || 'June',
      assessment_id: assessmentId,
      ...parameters  // Include any additional parameters
    }

    let flaskEndpoint: string
    let taskDescription: string

    // Determine which Flask endpoint to call based on evaluation type
    switch (evaluationType) {
      case 'embed-lecture-materials':
        flaskEndpoint = `${FLASK_API_BASE}/api/embed-lecture-materials`
        taskDescription = 'Embedding lecture materials'
        break
      
      case 'extract-and-save':
        flaskEndpoint = `${FLASK_API_BASE}/api/extract-and-save`
        taskDescription = 'Extracting and saving student answers'
        break
      
      case 'embed-from-db':
        flaskEndpoint = `${FLASK_API_BASE}/api/embed-from-db`
        taskDescription = 'Embedding student answers from database'
        break
      
      case 'embed-model-answers':
        flaskEndpoint = `${FLASK_API_BASE}/api/embed-model-answers`
        taskDescription = 'Embedding model answers'
        break
      
      case 'mark-papers':
        flaskEndpoint = `${FLASK_API_BASE}/api/mark-papers`
        taskDescription = 'Marking all papers'
        break
      
      case 'full-evaluation':
      default:
        flaskEndpoint = `${FLASK_API_BASE}/api/run-full-evaluation`
        taskDescription = 'Running complete evaluation pipeline'
        break
    }

    console.log(`Calling Flask API: ${flaskEndpoint}`)
    console.log('Payload:', JSON.stringify(flaskPayload, null, 2))

    // Make request to Flask API with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minute timeout

    try {
      const response = await fetch(flaskEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flaskPayload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Flask API error: ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      console.log('Flask API response:', result)

      return NextResponse.json({
        success: result.success,
        message: result.success 
          ? `${taskDescription} completed successfully`
          : `${taskDescription} failed: ${result.error}`,
        provider: provider,
        selectedModel: selectedModel,
        moduleId: moduleId,
        assessmentId: assessmentId,
        evaluationType: evaluationType || 'full-evaluation',
        results: result.results || null,
        parameters: result.parameters || flaskPayload,
        flaskResponse: result
      })

    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - operation took too long')
      }
      throw fetchError
    }

  } catch (error: any) {
    console.error('Error in start-evaluation API:', error)
    
    // Check if it's a fetch error (Flask server not available)
    if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Flask API server not available', 
          details: 'Please ensure the Flask API server is running on port 7000',
          suggestion: 'Run: python flask_api.py'
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint to check Flask API health
export async function GET(request: NextRequest) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout for health check

    const response = await fetch(`${FLASK_API_BASE}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Flask API health check failed: ${response.statusText}`)
    }

    const result = await response.json()

    return NextResponse.json({
      flaskApiStatus: 'healthy',
      flaskApiResponse: result,
      flaskApiBase: FLASK_API_BASE,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({
      flaskApiStatus: 'unavailable',
      error: error.message,
      flaskApiBase: FLASK_API_BASE,
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}