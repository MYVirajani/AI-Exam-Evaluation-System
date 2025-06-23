import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const courseId = formData.get('courseId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const projectRoot = process.cwd()
    
    // Get the parent directory of your project
    const parentDir = path.dirname(projectRoot)
    
    // Create the parallel data directory path
    const baseDir = path.join(parentDir, 'data')
    const uploadDir = type === 'answerScripts' 
      ? path.join(baseDir, 'Answer_Scripts') 
      : path.join(baseDir, 'Model_Answers')

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir)
    }
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const fileName = `${type}_${courseId || 'unknown'}_${timestamp}${fileExtension}`
    const filePath = path.join(uploadDir, fileName)

    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, buffer)

    return NextResponse.json({ 
      success: true, 
      filePath: filePath 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}