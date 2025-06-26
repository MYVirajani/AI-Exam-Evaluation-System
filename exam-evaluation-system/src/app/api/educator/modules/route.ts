import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Create modules directory if it doesn't exist
    const modulesDir = path.join(process.cwd(), 'public', 'modules');
    await mkdir(modulesDir, { recursive: true });

    // Create images directory if it doesn't exist
    const imagesDir = path.join(process.cwd(), 'public', 'module-images');
    await mkdir(imagesDir, { recursive: true });

    // Process image if exists
    const imageFile = formData.get('moduleImage') as File | null;
    let imageUrl = '';
    
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const imageName = `${uuidv4()}.${imageFile.name.split('.').pop()}`;
      const imagePath = path.join(imagesDir, imageName);
      await writeFile(imagePath, buffer);
      imageUrl = `/module-images/${imageName}`;
    }

    // Prepare module data
    const moduleData = {
      id: uuidv4(),
      moduleCode: formData.get('moduleCode'),
      moduleName: formData.get('moduleName'),
      semester: formData.get('semester'),
      educationInstitute: formData.get('educationInstitute'),
      maxStudents: formData.get('maxStudents'),
      learningOutcomes: formData.get('learningOutcomes'),
      enrollmentKey: formData.get('enrollmentKey'),
      image: imageUrl,
      enrolled: '0/' + formData.get('maxStudents'),
      createdAt: new Date().toISOString()
    };

    // Save module data to JSON file
    const modulePath = path.join(modulesDir, `${moduleData.id}.json`);
    await writeFile(modulePath, JSON.stringify(moduleData, null, 2));

    return NextResponse.json({ success: true, module: moduleData });
  } catch (error) {
    console.error('Error saving module:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save module' },
      { status: 500 }
    );
  }
}