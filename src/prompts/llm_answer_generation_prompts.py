# src/prompts/llm_answer_generation_prompts.py

class LLMAnswerGenerationPrompts:
    """
    Prompts for training LLM to generate high-quality answers using few-shot examples
    """
    
    # Few-shot examples for answer generation
    ANSWER_GENERATION_EXAMPLES = [
        {
            "question": "Define machine learning and explain supervised learning with an example.",
            "rag_context": """
            From lecture notes: Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task. Supervised learning uses labeled training data where both input and correct output are provided.
            From textbook: Common supervised learning algorithms include linear regression, decision trees, and neural networks.
            """,
            "expected_answer": """
            Machine learning is a subset of artificial intelligence that enables computers to automatically learn patterns and make predictions from data without being explicitly programmed for each specific task. The key principle is that the system improves its performance through experience with data.

            Supervised learning is a type of machine learning where the algorithm learns from labeled training data - datasets that contain both input features and the correct output (target variable). The goal is to learn a mapping function that can predict outputs for new, unseen inputs.

            Example: Email spam detection is a classic supervised learning problem. The training data consists of emails labeled as 'spam' or 'not spam'. The algorithm learns to identify patterns in email content, sender information, and other features that distinguish spam from legitimate emails. Once trained, it can classify new emails automatically.

            The main advantage of supervised learning is its ability to make accurate predictions when sufficient quality training data is available. However, it requires labeled data which can be expensive to obtain.
            """
        },
        {
            "question": "Explain overfitting in machine learning and suggest methods to prevent it.",
            "rag_context": """
            From lecture: Overfitting occurs when a model performs well on training data but poorly on test data. This happens when the model learns the noise in training data rather than the underlying pattern.
            From research paper: Regularization techniques like L1, L2, dropout, and early stopping can help prevent overfitting.
            """,
            "expected_answer": """
            Overfitting is a critical problem in machine learning where a model learns the training data too well, including its noise and outliers, rather than learning the underlying generalizable patterns. This results in excellent performance on training data but poor performance on new, unseen data.

            Signs of overfitting include:
            - High accuracy on training set but low accuracy on validation/test set
            - Large gap between training and validation error
            - Model complexity that seems disproportionate to the problem

            Prevention methods:
            1. **Regularization**: Add penalties (L1/L2) to prevent complex models
            2. **Cross-validation**: Use k-fold validation to better assess model performance
            3. **Early stopping**: Stop training when validation error starts increasing
            4. **Dropout**: Randomly disable neurons during training (for neural networks)
            5. **More training data**: Larger datasets help models generalize better
            6. **Feature selection**: Remove irrelevant features that might cause noise
            7. **Ensemble methods**: Combine multiple models to reduce overfitting risk

            The key is finding the right balance between model complexity and generalization ability.
            """
        },
        {
            "question": "What is the difference between classification and regression in machine learning?",
            "rag_context": """
            Course material: Classification predicts discrete categories or classes, while regression predicts continuous numerical values.
            Examples from lab: Email spam detection (classification), house price prediction (regression).
            """,
            "expected_answer": """
            Classification and regression are two fundamental types of supervised learning problems, distinguished by the nature of their output variables.

            **Classification:**
            - Predicts discrete categories, classes, or labels
            - Output is categorical (finite set of possibilities)
            - Examples: Email spam detection (spam/not spam), image recognition (cat/dog/bird), medical diagnosis (disease/no disease)
            - Evaluation metrics: Accuracy, precision, recall, F1-score, confusion matrix
            - Common algorithms: Logistic regression, decision trees, SVM, naive Bayes

            **Regression:**
            - Predicts continuous numerical values
            - Output is a real number within a range
            - Examples: House price prediction, stock price forecasting, temperature prediction
            - Evaluation metrics: Mean Squared Error (MSE), Mean Absolute Error (MAE), R-squared
            - Common algorithms: Linear regression, polynomial regression, random forest regression

            **Key Differences:**
            1. **Output type**: Discrete vs continuous
            2. **Decision boundary**: Classification creates boundaries between classes; regression fits a curve/line through data points
            3. **Evaluation**: Different metrics for measuring success
            4. **Applications**: Classification for categorization tasks, regression for quantity prediction

            Some algorithms can be adapted for both tasks (e.g., decision trees can do both classification and regression).
            """
        }
    ]

    # Main prompt template for LLM answer generation
    ANSWER_GENERATION_PROMPT = """
You are an expert academic assistant. Your task is to generate comprehensive, accurate answers to exam questions using both the provided course material context and your knowledge.

**LEARNING FROM EXAMPLES:**

{few_shot_examples}

**YOUR TASK:**
Now generate a comprehensive answer for the following question using the same quality and structure as shown in the examples above.

**QUESTION:**
{question_text}

**COURSE MATERIAL CONTEXT:**
{rag_context}

**INSTRUCTIONS:**
1. Combine information from the course material context with your knowledge
2. Provide a comprehensive, well-structured answer
3. Include relevant examples and explanations
4. Maintain academic quality and accuracy
5. Structure your answer logically with clear explanations
6. Aim for the same depth and quality as the examples shown above

**GENERATED ANSWER:**
"""

    # Updated grading prompt that uses three-way comparison
    THREE_WAY_GRADING_PROMPT = """
You are a strict but fair examiner. Grade the student answer by comparing it against THREE sources with few-shot learning examples:

**FEW-SHOT GRADING EXAMPLES:**

**Example 1:**
QUESTION: Define supervised learning and give an example.
MODEL ANSWER: Supervised learning uses labeled data to train algorithms. Example: Email spam classification.
LLM-GENERATED ANSWER: Supervised learning is a machine learning approach where algorithms learn from labeled training data containing input-output pairs. The goal is to learn a mapping function that can predict outputs for new inputs. Example: Email spam detection where emails are labeled as 'spam' or 'not spam' during training.
STUDENT ANSWER: Supervised learning uses labeled data. Example is email spam detection.
EXPECTED OUTPUT:
{{
  "score": 3.5,
  "reason": "Student covered basic definition and correct example but lacked detail about mapping function and prediction aspect covered in LLM answer.",
  "model_coverage": "Covered definition and example from model answer",
  "llm_coverage": "Missing technical details about mapping function and input-output pairs"
}}

**Example 2:**
QUESTION: Explain overfitting in machine learning.
MODEL ANSWER: Overfitting occurs when model learns training data too well, including noise, leading to poor generalization.
LLM-GENERATED ANSWER: Overfitting is a common problem where a model learns the training data extremely well, including noise and outliers, but fails to generalize to new, unseen data. This results in high training accuracy but poor test performance. It can be prevented through regularization, cross-validation, and early stopping.
STUDENT ANSWER: Overfitting happens when the model memorizes training data and can't work on new data. We can use regularization to fix it.
EXPECTED OUTPUT:
{{
  "score": 4.0,
  "reason": "Student demonstrated good understanding with correct definition and prevention method, matching key concepts from both model and LLM answers.",
  "model_coverage": "Fully covered core concept of poor generalization",
  "llm_coverage": "Covered generalization issue and mentioned one prevention method"
}}

---

**NOW GRADE THIS ANSWER:**

**QUESTION:**
{question_text}

**MODEL ANSWER (Lecturer's Reference):**
{model_answer}

**LLM-GENERATED ANSWER (Comprehensive Reference):**
{llm_generated_answer}

**COURSE CONTEXT:**
{rag_context}

**STUDENT ANSWER:**
{student_answer}

**MAXIMUM MARKS:** {max_marks}

**GRADING INSTRUCTIONS:**
1. Compare student answer against ALL THREE references (Model + LLM + Context)
2. Award marks based on coverage of key concepts from any reference
3. Give partial credit for concepts mentioned in model or LLM answers
4. Consider completeness shown in LLM-generated answer
5. Use course context only for clarification

**OUTPUT FORMAT (JSON only):**
{{
  "score": <float>,
  "reason": "<explanation comparing against all three sources>",
  "model_coverage": "<how well student covered model answer points>",
  "llm_coverage": "<how well student covered LLM answer points>"
}}
"""

    @staticmethod
    def format_few_shot_examples(examples_count=2):
        """Format examples for the answer generation prompt"""
        examples_text = ""
        
        for i, example in enumerate(LLMAnswerGenerationPrompts.ANSWER_GENERATION_EXAMPLES[:examples_count], 1):
            examples_text += f"""
**EXAMPLE {i}:**

QUESTION: {example['question']}

COURSE MATERIAL CONTEXT:
{example['rag_context']}

EXPECTED QUALITY ANSWER:
{example['expected_answer']}

---
"""
        return examples_text.strip()