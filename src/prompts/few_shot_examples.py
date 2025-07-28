# src/prompts/few_shot_examples.py

class FewShotExamples:
    """
    Centralized collection of few-shot examples for different domains and question types
    """
    
    # Machine Learning / AI Examples
    ML_EXAMPLES = [
        {
            "question": "Define machine learning and explain supervised learning.",
            "model_answer": "Machine learning is a subset of AI that enables computers to learn from data without explicit programming. Supervised learning uses labeled training data to learn a mapping function from inputs to outputs.",
            "guideline": "Must mention: data-driven learning (2 marks), no explicit programming (1 mark), supervised learning definition (2 marks)",
            "student_answer": "Machine learning is when computers learn from data. Supervised learning uses labeled data to predict outcomes.",
            "rag_context": "From lecture: ML algorithms improve performance through experience with data...",
            "llm_generated_answer": "Machine learning is a subset of artificial intelligence that enables computers to automatically learn patterns and make predictions from data without being explicitly programmed. Supervised learning uses labeled training data containing input-output pairs to learn a mapping function that can predict outputs for new inputs.",
            "expected_score": 4.0,
            "expected_reason": "Student covered key concepts but missed some technical details about mapping functions from LLM answer."
        },
        {
            "question": "Explain overfitting in machine learning and methods to prevent it.",
            "model_answer": "Overfitting occurs when a model learns training data too well, including noise, leading to poor generalization on new data.",
            "guideline": "Must include: definition (2 marks), cause - learning noise (2 marks), prevention methods (1 mark)",
            "student_answer": "Overfitting is when the model performs well on training data but poorly on test data. Can be prevented using regularization and cross-validation.",
            "rag_context": "Lecture notes: Overfitting is a common problem in ML where models memorize rather than generalize...",
            "llm_generated_answer": "Overfitting occurs when a model learns the training data too well, including noise and outliers, resulting in poor generalization to new data. Signs include high training accuracy but low validation accuracy. Prevention methods include regularization (L1/L2), cross-validation, early stopping, dropout, and using more training data.",
            "expected_score": 4.5,
            "expected_reason": "Excellent understanding demonstrated, covered definition, problem identification, and multiple prevention methods matching both model and LLM answers."
        }
    ]
    
    # Computer Science / Programming Examples  
    CS_EXAMPLES = [
        {
            "question": "What is recursion? Provide an example.",
            "model_answer": "Recursion is when a function calls itself. Example: factorial calculation.",
            "guideline": "Definition (2 marks), example (2 marks), base case mention (1 mark)",
            "student_answer": "Recursion is when a function calls itself to solve smaller subproblems. Example: calculating factorial where factorial(n) = n * factorial(n-1).",
            "rag_context": "From textbook: Recursive functions must have a base case to prevent infinite recursion...",
            "llm_generated_answer": "Recursion is a programming technique where a function calls itself to solve a problem by breaking it down into smaller subproblems. Every recursive function needs a base case to stop the recursion. Example: factorial(n) = n * factorial(n-1) with base case factorial(0) = 1.",
            "expected_score": 4.0,
            "expected_reason": "Good understanding with correct definition and example, but missed explicit mention of base case covered in LLM answer."
        }
    ]
    
    # Electrical Engineering Examples
    EE_EXAMPLES = [
        {
            "question": "Explain Ohm's Law and provide the formula.",
            "model_answer": "Ohm's Law states that current through a conductor is directly proportional to voltage and inversely proportional to resistance. V = IR.",
            "guideline": "Law statement (2 marks), formula (2 marks), relationship explanation (1 mark)",
            "student_answer": "Ohm's Law says V = IR where V is voltage, I is current, R is resistance.",
            "rag_context": "Circuit analysis fundamentals: Ohm's Law is fundamental to understanding electrical circuits...",
            "llm_generated_answer": "Ohm's Law is a fundamental principle in electrical engineering stating that the current flowing through a conductor between two points is directly proportional to the voltage across the two points and inversely proportional to the resistance. The formula is V = IR, where V is voltage (volts), I is current (amperes), and R is resistance (ohms).",
            "expected_score": 3.5,
            "expected_reason": "Formula correct but missing detailed explanation of proportional relationships covered in model and LLM answers."
        }
    ]
    
    # Generic Examples for any domain
    GENERIC_EXAMPLES = [
        {
            "question": "Define [concept] and explain its importance.",
            "model_answer": "[Basic definition and importance]",
            "guideline": "Definition (X marks), importance/applications (Y marks)",
            "student_answer": "[Student's attempt at definition and importance]",
            "rag_context": "Course material context about the concept...",
            "llm_generated_answer": "[Comprehensive definition with detailed explanation]",
            "expected_score": 0.0,
            "expected_reason": "Template example for reference."
        }
    ]
    
    @staticmethod
    def get_examples_by_domain(domain: str, count: int = 2):
        """
        Get few-shot examples for a specific domain
        
        Args:
            domain: 'ML', 'CS', 'EE', or 'GENERIC'
            count: Number of examples to return
            
        Returns:
            List of example dictionaries
        """
        domain_map = {
            'ML': FewShotExamples.ML_EXAMPLES,
            'CS': FewShotExamples.CS_EXAMPLES,
            'EE': FewShotExamples.EE_EXAMPLES,
            'GENERIC': FewShotExamples.GENERIC_EXAMPLES
        }
        
        examples = domain_map.get(domain.upper(), FewShotExamples.GENERIC_EXAMPLES)
        return examples[:count]
    
    @staticmethod
    def format_grading_examples(domain: str = 'ML', count: int = 2) -> str:
        """
        Format examples for inclusion in grading prompts
        
        Args:
            domain: Domain to get examples from
            count: Number of examples to format
            
        Returns:
            Formatted string for prompt inclusion
        """
        examples = FewShotExamples.get_examples_by_domain(domain, count)
        formatted_text = "\n**FEW-SHOT GRADING EXAMPLES:**\n"
        
        for i, example in enumerate(examples, 1):
            formatted_text += f"""
**Example {i}:**
QUESTION: {example['question']}
MODEL ANSWER: {example['model_answer']}
LLM-GENERATED ANSWER: {example['llm_generated_answer']}
STUDENT ANSWER: {example['student_answer']}
EXPECTED OUTPUT:
{{
  "score": {example['expected_score']},
  "reason": "{example['expected_reason']}"
}}
"""
        return formatted_text
    
    @staticmethod
    def format_generation_examples(domain: str = 'ML', count: int = 2) -> str:
        """
        Format examples for LLM answer generation prompts
        """
        examples = FewShotExamples.get_examples_by_domain(domain, count)
        formatted_text = ""
        
        for i, example in enumerate(examples, 1):
            formatted_text += f"""
**EXAMPLE {i}:**
QUESTION: {example['question']}
COURSE MATERIAL CONTEXT: {example['rag_context']}
EXPECTED QUALITY ANSWER: {example['llm_generated_answer']}

---
"""
        return formatted_text.strip()
    
    @staticmethod
    def add_custom_example(domain: str, example: dict):
        """
        Add a custom example to a domain (for runtime customization)
        
        Args:
            domain: Target domain
            example: Example dictionary with required fields
        """
        required_fields = ['question', 'model_answer', 'student_answer', 
                          'llm_generated_answer', 'expected_score', 'expected_reason']
        
        if not all(field in example for field in required_fields):
            raise ValueError(f"Example missing required fields: {required_fields}")
        
        domain_map = {
            'ML': FewShotExamples.ML_EXAMPLES,
            'CS': FewShotExamples.CS_EXAMPLES, 
            'EE': FewShotExamples.EE_EXAMPLES,
            'GENERIC': FewShotExamples.GENERIC_EXAMPLES
        }
        
        if domain.upper() in domain_map:
            domain_map[domain.upper()].append(example)
        else:
            raise ValueError(f"Unknown domain: {domain}")
    
    @staticmethod
    def get_domain_statistics():
        """
        Get statistics about available examples per domain
        """
        return {
            'ML': len(FewShotExamples.ML_EXAMPLES),
            'CS': len(FewShotExamples.CS_EXAMPLES),
            'EE': len(FewShotExamples.EE_EXAMPLES),
            'GENERIC': len(FewShotExamples.GENERIC_EXAMPLES),
            'total': (len(FewShotExamples.ML_EXAMPLES) + 
                     len(FewShotExamples.CS_EXAMPLES) + 
                     len(FewShotExamples.EE_EXAMPLES) + 
                     len(FewShotExamples.GENERIC_EXAMPLES))
        }