// src\app\api\educator\assessment\quiz\import-questions\route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { parseExcel } from '@/lib/parsers/excel';
import { parseDocx } from '@/lib/parsers/docx';
import { parseMoodleXML } from '@/lib/parsers/moodle-xml';
import { parseWebCT } from '@/lib/parsers/webct';
import { parseXHTML } from '@/lib/parsers/xhtml';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm();
    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const format = fields.format;
    const file = files.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileContent = fs.readFileSync(file.filepath);
    let questions = [];

    switch (format) {
      case 'excel':
        questions = await parseExcel(fileContent);
        break;
      case 'docx':
        questions = await parseDocx(fileContent);
        break;
      case 'moodle-xml':
        questions = await parseMoodleXML(fileContent.toString());
        break;
      case 'webct':
        questions = await parseWebCT(fileContent.toString());
        break;
      case 'xhtml':
        questions = await parseXHTML(fileContent.toString());
        break;
      default:
        return res.status(400).json({ message: 'Unsupported format' });
    }

    // Clean up the temporary file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({ questions });
  } catch (error) {
    console.error('Error importing questions:', error);
    return res.status(500).json({ message: 'Failed to import questions' });
  }
}