# src/services/pdf_processor.py
"""PDF processing service for extracting text and structure from student papers."""
import logging
from typing import List, Dict, Tuple, Optional
import PyPDF2
from pathlib import Path
import re
from docx import Document
logger = logging.getLogger(__name__)

class PDFProcessor:
    """Service for processing PDF files and extracting text content."""
    
    def __init__(self):
        """Initialize PDF processor."""
        logger.info("PDF processor initialized")


    def load_docx_text(docx_path: str) -> str:
        doc = Document(docx_path)
        return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])

    
    def extract_text_from_pdf(self, pdf_path: str) -> Dict[int, str]:
        """
        Extract text from PDF file page by page.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Dictionary mapping page numbers to extracted text
        """
        page_texts = {}
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                for page_num, page in enumerate(pdf_reader.pages, 1):
                    try:
                        text = page.extract_text()
                        # Clean and normalize the text
                        cleaned_text = self._clean_extracted_text(text)
                        page_texts[page_num] = cleaned_text
                        logger.debug(f"Extracted text from page {page_num}")
                    except Exception as e:
                        logger.warning(f"Error extracting text from page {page_num}: {e}")
                        page_texts[page_num] = ""
                
                logger.info(f"Successfully extracted text from {len(page_texts)} pages")
                return page_texts
                
        except Exception as e:
            logger.error(f"Error processing PDF {pdf_path}: {e}")
            raise Exception(f"Failed to process PDF: {e}")
    
    def _clean_extracted_text(self, text: str) -> str:
        """Clean and normalize extracted text."""
        if not text:
            return ""
        
        # Remove excessive whitespace and normalize line breaks
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n\s*\n', '\n', text)
        
        # Remove common PDF artifacts
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]', '', text)  # Remove control characters
        
        # Normalize quotes and apostrophes
        text = re.sub(r'[""''`]', '"', text)
        text = re.sub(r'[''`]', "'", text)
        
        return text.strip()
    
    def detect_paper_structure(self, page_texts: Dict[int, str]) -> Dict[str, any]:
        """
        Detect the structure of the paper (questions, sections, etc.).
        
        Args:
            page_texts: Dictionary of page texts
            
        Returns:
            Dictionary containing detected structure information
        """
        structure = {
            'questions': [],
            'total_pages': len(page_texts),
            'student_info': {},
            'question_boundaries': {}
        }
        
        all_text = '\n'.join(page_texts.values())
        
        # Extract student information
        structure['student_info'] = self._extract_student_info(all_text)
        
        # Detect questions
        questions = self._detect_questions(page_texts)
        structure['questions'] = questions
        
        # Map question boundaries to pages
        structure['question_boundaries'] = self._map_question_boundaries(questions, page_texts)
        
        logger.info(f"Detected paper structure: {len(questions)} questions across {len(page_texts)} pages")
        return structure
    
    def _extract_student_info(self, text: str) -> Dict[str, str]:
        """Extract student information from the paper."""
        student_info = {}
        
        # Common patterns for student information
        patterns = {
            'name': [
                r'Name:\s*([A-Za-z\s]+)',
                r'Student Name:\s*([A-Za-z\s]+)',
                r'Full Name:\s*([A-Za-z\s]+)'
            ],
            'id': [
                r'Student ID:\s*([A-Za-z0-9]+)',
                r'ID:\s*([A-Za-z0-9]+)',
                r'Student Number:\s*([A-Za-z0-9]+)'
            ],
            'class': [
                r'Class:\s*([A-Za-z0-9\s]+)',
                r'Course:\s*([A-Za-z0-9\s]+)',
                r'Subject:\s*([A-Za-z0-9\s]+)'
            ]
        }
        
        for info_type, pattern_list in patterns.items():
            for pattern in pattern_list:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    student_info[info_type] = match.group(1).strip()
                    break
        
        return student_info
    
    def _detect_questions(self, page_texts: Dict[int, str]) -> List[Dict[str, any]]:
        """Detect questions in the paper text."""
        questions = []
        
        # Common question patterns
        question_patterns = [
            r'(?:^|\n)\s*(?:Question\s*)?(\d+)[\.\)]\s*(.+?)(?=(?:^|\n)\s*(?:Question\s*)?\d+[\.\)]|$)',
            r'(?:^|\n)\s*([Q]\d+)[\.\)]\s*(.+?)(?=(?:^|\n)\s*[Q]\d+[\.\)]|$)',
            r'(?:^|\n)\s*(\d+)\.\s*(.+?)(?=(?:^|\n)\s*\d+\.|$)'
        ]
        
        for page_num, text in page_texts.items():
            for pattern in question_patterns:
                matches = re.finditer(pattern, text, re.IGNORECASE | re.DOTALL)
                
                for match in matches:
                    question_id = match.group(1)
                    question_text = match.group(2).strip()
                    
                    if len(question_text) > 10:  # Filter out very short matches
                        question_info = {
                            'id': f"Q{question_id}" if not question_id.startswith('Q') else question_id,
                            'text': question_text[:200] + "..." if len(question_text) > 200 else question_text,
                            'page': page_num,
                            'full_text': question_text
                        }
                        
                        # Check for sub-questions
                        sub_questions = self._detect_sub_questions(question_text)
                        if sub_questions:
                            question_info['sub_questions'] = sub_questions
                        
                        questions.append(question_info)
        
        # Remove duplicates and sort by question ID
        unique_questions = {}
        for q in questions:
            if q['id'] not in unique_questions:
                unique_questions[q['id']] = q
        
        sorted_questions = sorted(unique_questions.values(), key=lambda x: self._extract_question_number(x['id']))
        return sorted_questions
    
    def _detect_sub_questions(self, question_text: str) -> List[Dict[str, str]]:
        """Detect sub-questions within a question."""
        sub_questions = []
        
        # Patterns for sub-questions (i), ii), a), b), etc.
        sub_patterns = [
            r'(?:^|\n)\s*([i]+)\)\s*(.+?)(?=(?:^|\n)\s*[i]+\)|$)',
            r'(?:^|\n)\s*([a-z])\)\s*(.+?)(?=(?:^|\n)\s*[a-z]\)|$)',
            r'(?:^|\n)\s*\(([i]+)\)\s*(.+?)(?=(?:^|\n)\s*\([i]+\)|$)',
            r'(?:^|\n)\s*\(([a-z])\)\s*(.+?)(?=(?:^|\n)\s*\([a-z]\)|$)'
        ]
        
        for pattern in sub_patterns:
            matches = re.finditer(pattern, question_text, re.IGNORECASE | re.DOTALL)
            
            for match in matches:
                sub_id = match.group(1)
                sub_text = match.group(2).strip()
                
                if len(sub_text) > 5:  # Filter out very short matches
                    sub_questions.append({
                        'id': sub_id,
                        'text': sub_text[:100] + "..." if len(sub_text) > 100 else sub_text,
                        'full_text': sub_text
                    })
        
        return sub_questions
    
    def _map_question_boundaries(self, questions: List[Dict], page_texts: Dict[int, str]) -> Dict[str, Dict]:
        """Map question boundaries to specific pages and positions."""
        boundaries = {}
        
        for question in questions:
            question_id = question['id']
            boundaries[question_id] = {
                'start_page': question['page'],
                'end_page': question['page'],  # Will be updated if question spans multiple pages
                'text_positions': []
            }
            
            # Find question text in all pages to determine span
            for page_num, text in page_texts.items():
                if question['full_text'][:50] in text:  # Check first 50 chars
                    if page_num < boundaries[question_id]['start_page']:
                        boundaries[question_id]['start_page'] = page_num
                    if page_num > boundaries[question_id]['end_page']:
                        boundaries[question_id]['end_page'] = page_num
        
        return boundaries
    
    def _extract_question_number(self, question_id: str) -> int:
        """Extract numeric part from question ID for sorting."""
        match = re.search(r'(\d+)', question_id)
        return int(match.group(1)) if match else 0
    
    def extract_images_from_pdf(self, pdf_path: str) -> List[Dict[str, any]]:
        """
        Extract images from PDF (if any).
        Note: This is a basic implementation. For complex image extraction,
        consider using libraries like pdf2image or pymupdf.
        """
        images = []
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                for page_num, page in enumerate(pdf_reader.pages, 1):
                    if '/XObject' in page['/Resources']:
                        xObject = page['/Resources']['/XObject'].get_object()
                        
                        for obj in xObject:
                            if xObject[obj]['/Subtype'] == '/Image':
                                images.append({
                                    'page': page_num,
                                    'object_id': obj,
                                    'width': xObject[obj].get('/Width', 0),
                                    'height': xObject[obj].get('/Height', 0)
                                })
                
                logger.info(f"Found {len(images)} images in PDF")
                return images
                
        except Exception as e:
            logger.warning(f"Error extracting images: {e}")
            return []
    
    def validate_pdf(self, pdf_path: str) -> Tuple[bool, str]:
        """
        Validate if PDF can be processed.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            if not Path(pdf_path).exists():
                return False, "PDF file does not exist"
            
            if not pdf_path.lower().endswith('.pdf'):
                return False, "File is not a PDF"
            
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                if len(pdf_reader.pages) == 0:
                    return False, "PDF has no pages"
                
                # Try to extract text from first page
                first_page_text = pdf_reader.pages[0].extract_text()
                if not first_page_text.strip():
                    logger.warning("PDF appears to be image-based (no extractable text)")
                    # This is a warning, not an error - we can still process it
                
                return True, "PDF is valid"
                
        except Exception as e:
            return False, f"Error validating PDF: {str(e)}"
    
    def get_pdf_metadata(self, pdf_path: str) -> Dict[str, any]:
        """Extract metadata from PDF."""
        metadata = {}
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                if pdf_reader.metadata:
                    metadata.update({
                        'title': pdf_reader.metadata.get('/Title', ''),
                        'author': pdf_reader.metadata.get('/Author', ''),
                        'subject': pdf_reader.metadata.get('/Subject', ''),
                        'creator': pdf_reader.metadata.get('/Creator', ''),
                        'producer': pdf_reader.metadata.get('/Producer', ''),
                        'creation_date': pdf_reader.metadata.get('/CreationDate', ''),
                        'modification_date': pdf_reader.metadata.get('/ModDate', '')
                    })
                
                metadata['page_count'] = len(pdf_reader.pages)
                metadata['file_size'] = Path(pdf_path).stat().st_size
                
                return metadata
                
        except Exception as e:
            logger.warning(f"Error extracting PDF metadata: {e}")
            return {'error': str(e)}