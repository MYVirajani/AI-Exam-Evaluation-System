
"""RAG service for retrieving relevant context from course materials."""
import logging
from typing import List, Optional, Tuple
from langchain_community.vectorstores.pgvector import PGVector
from langchain_openai import OpenAIEmbeddings
from langchain.schema import Document

from ..config.settings import config
from ..models.student_answer import StudentAnswer
from ..models.question import Question
from ..prompts.rag_prompts import RAGPrompts, RAGUtilities

logger = logging.getLogger(__name__)

class RAGService:
    """Service for retrieving relevant context using RAG."""
    
    def __init__(self):
        """Initialize RAG service with vector database connection."""
        self.embedding_function = OpenAIEmbeddings(
            api_key=config.openai.api_key,
            model=config.openai.embedding_model
        )
        
        try:
            self.vector_db = PGVector(
                collection_name=config.database.collection_name,
                connection_string=config.database.connection_string,
                embedding_function=self.embedding_function,
            )
            logger.info("RAG service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize RAG service: {e}")
            self.vector_db = None
    
    def get_relevant_context(self, question: Question, student_answer: StudentAnswer) -> Optional[str]:
        """
        Retrieve relevant context from course materials.
        
        Args:
            question: The question being answered
            student_answer: The student's answer
            
        Returns:
            Relevant context string or None if no relevant context found
        """
        if not self.vector_db:
            logger.warning("Vector database not available")
            return None
        
        try:
            # Create search query combining question and answer
            search_query = self._create_search_query(question.text, student_answer.answer_text)
            
            # Perform similarity search
            documents = self.vector_db.similarity_search(
                search_query,
                k=config.grading.max_context_chunks
            )
            
            if not documents:
                logger.info(f"No relevant documents found for question {question.id}")
                return None
            
            # Filter documents by relevance
            relevant_docs = self._filter_relevant_documents(
                documents, question.text, student_answer.answer_text
            )
            
            if not relevant_docs:
                logger.info(f"No sufficiently relevant documents for question {question.id}")
                return None
            
            # Synthesize context from relevant documents
            context = self._synthesize_context(
                relevant_docs, question.text, student_answer.answer_text
            )
            
            logger.info(f"Retrieved context for question {question.id}")
            return context
            
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            return None
    
    def _create_search_query(self, question_text: str, student_answer: str) -> str:
        """Create an effective search query for retrieving relevant documents."""
        # Combine key terms from question and answer
        combined_text = f"{question_text} {student_answer}"
        
        # Extract key terms (simple approach - can be enhanced)
        words = combined_text.lower().split()
        
        # Filter out common words and keep important terms
        stop_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'a', 'an'}
        
        key_terms = [word for word in words if len(word) > 3 and word not in stop_words]
        
        # Take top terms and create search query
        search_query = ' '.join(key_terms[:10])  # Limit to top 10 terms
        
        logger.debug(f"Created search query: {search_query}")
        return search_query
    
    def _filter_relevant_documents(self, documents: List[Document], question_text: str, student_answer: str) -> List[Document]:
        """Filter documents based on relevance to the specific question and answer."""
        from openai import OpenAI
        
        client = OpenAI(api_key=config.openai.api_key)
        relevant_docs = []
        
        for doc in documents:
            try:
                # Use LLM to evaluate document relevance
                prompt = RAGPrompts.DOCUMENT_RELEVANCE_SCORING.format(
                    question_text=question_text,
                    student_answer=student_answer,
                    document_content=doc.page_content[:1500]  # Limit content length
                )
                
                response = client.chat.completions.create(
                    model=config.openai.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=config.openai.temperature,
                    max_tokens=500
                )
                
                # Extract relevance score
                relevance_score = RAGUtilities.extract_relevance_score(response.choices[0].message.content)
                
                if relevance_score >= config.grading.context_relevance_threshold * 10:  # Convert to 0-10 scale
                    relevant_docs.append(doc)
                    logger.debug(f"Document relevance score: {relevance_score}")
                
            except Exception as e:
                logger.warning(f"Error evaluating document relevance: {e}")
                # Include document if evaluation fails (conservative approach)
                relevant_docs.append(doc)
        
        return relevant_docs
    
    def _synthesize_context(self, documents: List[Document], question_text: str, student_answer: str) -> str:
        """Synthesize relevant information from multiple documents."""
        from openai import OpenAI
        
        client = OpenAI(api_key=config.openai.api_key)
        
        try:
            # Format documents for synthesis
            context_chunks = [doc.page_content for doc in documents]
            formatted_chunks = RAGUtilities.format_context_chunks(context_chunks)
            
            # Use LLM to synthesize context
            prompt = RAGPrompts.CONTEXT_SYNTHESIS.format(
                question_text=question_text,
                student_answer=student_answer,
                context_chunks=formatted_chunks
            )
            
            response = client.chat.completions.create(
                model=config.openai.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=config.openai.temperature,
                max_tokens=1000
            )
            
            synthesized_context = response.choices[0].message.content
            logger.debug("Successfully synthesized context from multiple documents")
            return synthesized_context
            
        except Exception as e:
            logger.error(f"Error synthesizing context: {e}")
            # Fallback: concatenate document contents
            return "\n\n".join([doc.page_content[:500] for doc in documents[:3]])
    
    def check_hallucination(self, student_answer: str, context: str) -> dict:
        """Check if student answer contains information not supported by course materials."""
        from openai import OpenAI
        
        client = OpenAI(api_key=config.openai.api_key)
        
        try:
            prompt = RAGPrompts.HALLUCINATION_CHECK.format(
                context=context,
                student_answer=student_answer
            )
            
            response = client.chat.completions.create(
                model=config.openai.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=config.openai.temperature,
                max_tokens=800
            )
            
            return RAGUtilities.parse_hallucination_check(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Error checking hallucination: {e}")
            return {
                'assessment': 'UNKNOWN',
                'supported_points': [],
                'unsupported_points': [],
                'raw_response': f"Error: {str(e)}"
            }
    
    def identify_knowledge_gaps(self, model_answer: str, student_answer: str, context: str) -> dict:
        """Identify what key information the student missed."""
        from openai import OpenAI
        
        client = OpenAI(api_key=config.openai.api_key)
        
        try:
            prompt = RAGPrompts.KNOWLEDGE_GAP_IDENTIFICATION.format(
                model_answer=model_answer,
                student_answer=student_answer,
                context=context
            )
            
            response = client.chat.completions.create(
                model=config.openai.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=config.openai.temperature,
                max_tokens=800
            )
            
            return self._parse_knowledge_gaps(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Error identifying knowledge gaps: {e}")
            return {
                'missing_concepts': [],
                'missing_details': [],
                'understanding_gaps': [],
                'impact_on_grade': 'Unable to assess due to error'
            }
    
    def _parse_knowledge_gaps(self, response: str) -> dict:
        """Parse knowledge gap identification response."""
        import re
        
        # Extract missing concepts
        concepts_section = re.search(r'MISSING_KEY_CONCEPTS:(.*?)(?=MISSING_DETAILS:|UNDERSTANDING_GAPS:|$)', 
                                   response, re.IGNORECASE | re.DOTALL)
        missing_concepts = []
        if concepts_section:
            concepts = re.findall(r'-\s*(.*)', concepts_section.group(1))
            missing_concepts = [concept.strip() for concept in concepts]
        
        # Extract missing details
        details_section = re.search(r'MISSING_DETAILS:(.*?)(?=UNDERSTANDING_GAPS:|IMPACT_ON_GRADE:|$)', 
                                  response, re.IGNORECASE | re.DOTALL)
        missing_details = []
        if details_section:
            details = re.findall(r'-\s*(.*)', details_section.group(1))
            missing_details = [detail.strip() for detail in details]
        
        # Extract understanding gaps
        gaps_section = re.search(r'UNDERSTANDING_GAPS:(.*?)(?=IMPACT_ON_GRADE:|$)', 
                               response, re.IGNORECASE | re.DOTALL)
        understanding_gaps = []
        if gaps_section:
            gaps = re.findall(r'-\s*(.*)', gaps_section.group(1))
            understanding_gaps = [gap.strip() for gap in gaps]
        
        # Extract impact assessment
        impact_match = re.search(r'IMPACT_ON_GRADE:\s*(.*?)(?=\n|$)', response, re.IGNORECASE)
        impact = impact_match.group(1).strip() if impact_match else "Not specified"
        
        return {
            'missing_concepts': missing_concepts,
            'missing_details': missing_details,
            'understanding_gaps': understanding_gaps,
            'impact_on_grade': impact
        }
    
    def add_documents(self, documents: List[Document]) -> bool:
        """Add documents to the vector database."""
        if not self.vector_db:
            logger.error("Vector database not available")
            return False
        
        try:
            self.vector_db.add_documents(documents)
            logger.info(f"Added {len(documents)} documents to vector database")
            return True
        except Exception as e:
            logger.error(f"Error adding documents to vector database: {e}")
            return False
    
    def is_available(self) -> bool:
        """Check if RAG service is available."""
        return self.vector_db is not None