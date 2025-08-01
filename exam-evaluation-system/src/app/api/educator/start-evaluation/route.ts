// // // // // app/api/educator/start-evaluation/route.ts
// // // // import { NextRequest, NextResponse } from 'next/server'
// // // // import { exec } from 'child_process'
// // // // import { promisify } from 'util'
// // // // import fs from 'fs/promises'
// // // // import path from 'path'

// // // // const execAsync = promisify(exec)

// // // // export async function POST(request: NextRequest) {
// // // //   try {
// // // //     const { moduleId, selectedModel } = await request.json()

// // // //     if (!moduleId) {
// // // //       return NextResponse.json(
// // // //         { error: 'Module ID is required' },
// // // //         { status: 400 }
// // // //       )
// // // //     }

// // // //     console.log(`Starting evaluation for module: ${moduleId} with model: ${selectedModel}`)

// // // //     // Read commands from run.txt file
// // // //     const runFilePath = path.join(process.cwd(), 'run.txt')
    
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
        
// // // //         // You can modify commands dynamically based on moduleId or selectedModel
// // // //         let modifiedCommand = command
// // // //           .replace('{{moduleId}}', moduleId)
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
// // // //       moduleId,
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
// // //     const runFilePath = path.join(process.cwd(), '../../../../../run.txt')
    
// // //     let commandsContent: string
// // //     try {
// // //       commandsContent = await fs.readFile(runFilePath, 'utf-8')
// // //     } catch (error) {
// // //       console.error('Error reading run.txt:', error)
// // //       return NextResponse.json(
// // //         { error: 'Could not read run.txt file' },
// // //         { status: 500 }
// // //       )
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
// //     const commands = commandsContent
// //       .split('\n')
// //       .map(line => line.trim())
// //       .filter(line => line && !line.startsWith('#'))

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
// //           cwd: process.cwd(),
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
//     const { selectedModel } = await request.json()

//     console.log(`Starting evaluation with model: ${selectedModel}`)

//     // Read commands from run.txt file
//     const runFilePath = path.join(process.cwd(), 'run.txt')
    
//     console.log('Looking for run.txt at:', runFilePath)
    
//     let commandsContent: string
//     try {
//       commandsContent = await fs.readFile(runFilePath, 'utf-8')
//     } catch (error) {
//       console.error('Error reading run.txt:', error)
//       console.error('Current working directory:', process.cwd())
//       console.error('Attempted path:', runFilePath)
      
//       // Try alternative path (parent directory)
//       const alternativePath = path.join(process.cwd(), '..', 'run.txt')
//       console.log('Trying alternative path:', alternativePath)
      
//       try {
//         commandsContent = await fs.readFile(alternativePath, 'utf-8')
//         console.log('Found run.txt at alternative path')
//       } catch (altError) {
//         console.error('Alternative path also failed:', altError)
//         return NextResponse.json(
//           { error: 'Could not find run.txt file. Please ensure it exists in the project root.' },
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
//         { error: 'No valid commands found in run.txt' },
//         { status: 400 }
//       )
//     }

//     console.log(`Found ${commands.length} commands to execute`)

//     // Execute commands sequentially
//     const results: { command: string; success: boolean; output?: string; error?: string }[] = []

//     for (const command of commands) {
//       try {
//         console.log(`Executing: ${command}`)
        
//         // You can modify commands dynamically based on selectedModel
//         let modifiedCommand = command
//           .replace('{{selectedModel}}', selectedModel)

//         const { stdout, stderr } = await execAsync(modifiedCommand, {
//           cwd: path.join(process.cwd(), '..'), // Run from parent directory where src folder exists
//           timeout: 300000, // 5 minutes timeout per command
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
//       }
//     }

//     // Check if all commands were successful
//     const allSuccessful = results.every(result => result.success)
//     const successfulCount = results.filter(result => result.success).length

//     return NextResponse.json({
//       success: allSuccessful,
//       message: allSuccessful 
//         ? 'All evaluation commands completed successfully'
//         : `${successfulCount}/${results.length} commands completed successfully`,
//       results,
//       selectedModel,
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
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { selectedModel, moduleId, assessmentId } = await request.json()

    console.log(`Starting evaluation with model: ${selectedModel}`)
    console.log(`Module ID: ${moduleId}, Assessment ID: ${assessmentId}`)

    // Map model names to corresponding run files
    const modelToFileMap: { [key: string]: string } = {
      'ChatGPT': 'run_openai.txt',
      'Deepseek': 'run.txt',
      'Gemini': 'run_gemini.txt',
      'Llama': 'run.txt'
    }

    // Get the appropriate run file based on selected model
    const runFileName = modelToFileMap[selectedModel] || 'run.txt'
    
    console.log(`Using run file: ${runFileName} for model: ${selectedModel}`)

    // Read commands from the appropriate run file
    const runFilePath = path.join(process.cwd(), runFileName)
    
    console.log('Looking for run file at:', runFilePath)
    
    let commandsContent: string
    try {
      commandsContent = await fs.readFile(runFilePath, 'utf-8')
    } catch (error) {
      console.error(`Error reading ${runFileName}:`, error)
      console.error('Current working directory:', process.cwd())
      console.error('Attempted path:', runFilePath)
      
      // Try alternative path (parent directory)
      const alternativePath = path.join(process.cwd(), '..', runFileName)
      console.log('Trying alternative path:', alternativePath)
      
      try {
        commandsContent = await fs.readFile(alternativePath, 'utf-8')
        console.log(`Found ${runFileName} at alternative path`)
      } catch (altError) {
        console.error('Alternative path also failed:', altError)
        return NextResponse.json(
          { error: `Could not find ${runFileName} file. Please ensure it exists in the project root.` },
          { status: 500 }
        )
      }
    }

    // Split commands by lines and filter out empty lines and comments
    // Also handle multi-line commands by joining lines that end with backtick
    const rawLines = commandsContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))

    const commands: string[] = []
    let currentCommand = ''

    for (const line of rawLines) {
      if (line.endsWith('`')) {
        // This line continues to the next line
        currentCommand += line.slice(0, -1).trim() + ' '
      } else {
        // This is the end of the command
        currentCommand += line
        if (currentCommand.trim()) {
          commands.push(currentCommand.trim())
        }
        currentCommand = ''
      }
    }

    // Handle case where last line ended with backtick
    if (currentCommand.trim()) {
      commands.push(currentCommand.trim())
    }

    if (commands.length === 0) {
      return NextResponse.json(
        { error: `No valid commands found in ${runFileName}` },
        { status: 400 }
      )
    }

    console.log(`Found ${commands.length} commands to execute from ${runFileName}`)

    // Execute commands sequentially
    const results: { command: string; success: boolean; output?: string; error?: string }[] = []

    for (const command of commands) {
      try {
        console.log(`Executing: ${command}`)
        
        // Replace placeholders in commands with actual values
        let modifiedCommand = command
          .replace(/\{\{selectedModel\}\}/g, selectedModel)
          .replace(/\{\{model\}\}/g, selectedModel.toLowerCase())
          .replace(/\{\{moduleId\}\}/g, moduleId || '')
          .replace(/\{\{assessmentId\}\}/g, assessmentId || '')

        const { stdout, stderr } = await execAsync(modifiedCommand, {
          cwd: path.join(process.cwd(), '..'), // Run from parent directory where src folder exists
          timeout: 300000, // 5 minutes timeout per command
          env: {
            ...process.env,
            SELECTED_MODEL: selectedModel,
            MODULE_ID: moduleId || '',
            ASSESSMENT_ID: assessmentId || ''
          }
        })

        results.push({
          command: modifiedCommand,
          success: true,
          output: stdout,
        })

        if (stderr) {
          console.warn(`Warning for command "${modifiedCommand}":`, stderr)
        }

        console.log(`✅ Completed: ${modifiedCommand}`)

      } catch (error: any) {
        console.error(`❌ Failed: ${command}`, error)
        
        results.push({
          command,
          success: false,
          error: error.message,
        })

        // Decide whether to continue or stop on error
        // For now, we'll continue with remaining commands
        // You can change this behavior based on your needs
        console.log('Continuing with next command despite error...')
      }
    }

    // Check if all commands were successful
    const allSuccessful = results.every(result => result.success)
    const successfulCount = results.filter(result => result.success).length

    console.log(`Evaluation completed: ${successfulCount}/${results.length} commands successful`)

    return NextResponse.json({
      success: allSuccessful,
      message: allSuccessful 
        ? `All evaluation commands completed successfully using ${runFileName}`
        : `${successfulCount}/${results.length} commands completed successfully using ${runFileName}`,
      results,
      selectedModel,
      runFile: runFileName,
      moduleId,
      assessmentId,
      executedCommands: results.length,
      successfulCommands: successfulCount
    })

  } catch (error: any) {
    console.error('Error in start-evaluation API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}