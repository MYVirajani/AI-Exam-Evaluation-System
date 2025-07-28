import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    console.log('[Upload] Received POST request')

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const moduleId = formData.get('moduleId') as string | null

    console.log('[Upload] File:', file?.name)
    console.log('[Upload] Type:', type)
    console.log('[Upload] Module ID:', moduleId)

    if (!file) {
      console.log('[Upload] No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const maxSize = type === 'answerScripts' ? 50 
                  : type === 'examPaper' ? 10 
                  : type === 'lectureMaterial' ? 20 
                  : 5
    console.log(`[Upload] Max allowed size for type "${type}": ${maxSize}MB`)
    
    if (file.size > maxSize * 1024 * 1024) {
      console.log(`[Upload] File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB`)
      return NextResponse.json(
        { error: `File size exceeds ${maxSize}MB limit` },
        { status: 400 }
      )
    }

    const validExtensions: Record<string, string[]> = {
      examPaper: ['.pdf', '.docx'],
      answerScripts: ['.pdf'],
      modelAnswer: ['.pdf', '.docx'],
      markingScheme: ['.pdf', '.xlsx'],
      lectureMaterial: ['.pdf', '.docx', '.pptx', '.xlsx']
    }

    const fileExtension = path.extname(file.name).toLowerCase()
    console.log('[Upload] File extension:', fileExtension)

    if (!validExtensions[type]?.includes(fileExtension)) {
      console.log(`[Upload] Invalid file type for ${type}`)
      return NextResponse.json(
        { error: `Invalid file type for ${type}` },
        { status: 400 }
      )
    }

    const projectRoot = process.cwd()
    const parentDir = path.dirname(projectRoot)
    const baseDir = path.join(parentDir, 'data')

    let uploadDir: string
    switch (type) {
      case 'answerScripts':
        uploadDir = path.join(baseDir, 'Answer_Scripts')
        break
      case 'modelAnswer':
        uploadDir = path.join(baseDir, 'Model_Answers')
        break
      case 'lectureMaterial':
        if (!moduleId) {
          console.log('[Upload] Module ID missing for lecture materials')
          return NextResponse.json({ error: 'Module ID is required for lecture materials' }, { status: 400 })
        }
        uploadDir = path.join(baseDir, 'Lecture_materials', moduleId)
        break
      default:
        uploadDir = path.join(baseDir, type)
    }

    console.log('[Upload] Upload directory:', uploadDir)

    if (!fs.existsSync(uploadDir)) {
      console.log('[Upload] Directory does not exist. Creating...')
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const timestamp = Date.now()
    const fileName = `${type}_${moduleId || 'unknown'}_${timestamp}${fileExtension}`
    const filePath = path.join(uploadDir, fileName)

    console.log('[Upload] Final file path:', filePath)

    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, buffer)

    console.log('[Upload] File successfully written')

    return NextResponse.json({
      success: true,
      filePath: filePath,
      fileName: fileName
    })
  } catch (error) {
    console.error('[Upload Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
