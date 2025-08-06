

# EXTRACT_MODEL_ANSWERS_PROMPT = """
# You will receive the full text of an *official model-answer or marking guide*.

# -----------------------------
# **Your Tasks:**

# 1. Extract global metadata once:
#    - "module_code": e.g., "EE6250"
#    - "exam_year": e.g., 2025
#    - "exam_month": e.g., "June"

# 2. Extract all answers using the **exact question hierarchy** from the document.
#    Example structure: Q1 → Q1.i → Q1.i.a

# 3. For each lowest-level question node, extract:
#    - "question": The actual question text (if available, else use "")
#    - "answer": The model answer content
#    - "guideline": Bullet points or marking instructions (or empty string if not present)
#    - "marks": Maximum marks (as an integer, or null if not available)

# -----------------------------
# **Output Format (JSON only)**

# Your response **must** be a single valid JSON object with this structure:

# {
#   "metadata": {
#     "module_code": "EE6250",
#     "exam_year": 2025,
#     "exam_month": "June"
#   },
#   "answers": {
#     "Q1": {
#       "i": {
#         "a": {
#           "question": "Define supervised learning.",
#           "answer": "Supervised learning is ...",
#           "guideline": "Include mention of labeled data and prediction tasks.",
#           "marks": 5
#         }
#       },
#       "ii": {
#         "question": "Explain overfitting in ML.",
#         "answer": "Overfitting happens when ...",
#         "guideline": "",
#         "marks": 3
#       }
#     },
#     "Q2": { ... }
#   }
# }

# -----------------------------
# **Strict Rules:**

# *  Return only valid JSON. No markdown, no triple backticks.
# *  Do NOT use flat keys like "Q1_i_answer". Use nested objects only.
# *  Every answer leaf must include **all 4 fields**: question, answer, guideline, marks.
# *  Return empty strings ("") or null for missing fields.
# *  Clean up spacing and ensure well-formatted output.
# """


EXTRACT_MODEL_ANSWERS_PROMPT = """
You will receive the full text of an official model-answer or marking guide.

-----------------------------
*Your Tasks:*

1. Extract global metadata once:
   - "module_code": e.g., "EE6250"
   - "exam_year": e.g., 2025
   - "exam_month": e.g., "June"

2. Extract all answers using the *exact question hierarchy* from the document.
   Example structure: Q1 → Q1.i → Q1.i.a

3. For each lowest-level question node, extract:
   - "question": The actual question text (if available, else use "")
   - "answer": The model answer content
   - "guideline": Bullet points or marking instructions (or empty string if not present)
   - "marks": Maximum marks (as a decimal, or null if not available)

-----------------------------

### COMPREHENSIVE EXAMPLES:

*Example 1: Short Answer Questions with Clear Guidelines*

Input Text:

Module: EE6250
Examination: June 2025

MARKING SCHEME

Q1) i) Define supervised learning. [3 marks]
Model Answer: Supervised learning is a machine learning approach where algorithms learn from labeled training data to make predictions on new, unseen data.
Marking Guideline: 
- Must mention labeled data (1 mark)
- Must mention learning/training aspect (1 mark)  
- Must mention prediction on new data (1 mark)

Q1) ii) What is overfitting? [2 marks]
Model Answer: Overfitting occurs when a model learns training data too specifically, including noise, resulting in poor generalization to new data.
Marking Guideline:
- Definition of overfitting (1 mark)
- Mention of poor generalization (1 mark)


Output:
json
{
  "metadata": {
    "module_code": "EE6250",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": {
        "question": "Define supervised learning.",
        "answer": "Supervised learning is a machine learning approach where algorithms learn from labeled training data to make predictions on new, unseen data.",
        "guideline": "- Must mention labeled data (1 mark)\n- Must mention learning/training aspect (1 mark)\n- Must mention prediction on new data (1 mark)",
        "marks": 3
      },
      "ii": {
        "question": "What is overfitting?",
        "answer": "Overfitting occurs when a model learns training data too specifically, including noise, resulting in poor generalization to new data.",
        "guideline": "- Definition of overfitting (1 mark)\n- Mention of poor generalization (1 mark)",
        "marks": 2
      }
    }
  }
}


*Example 2: List-Type Questions with Detailed Guidelines*

Input Text:

Module Code: CS5050
June 2025 Examination

Q1) i) List four advantages of cloud computing. [8 marks - 2 marks each]

Model Answer:
1. Scalability - ability to scale resources up or down based on demand
2. Cost-effectiveness - pay-as-you-use model reduces upfront costs
3. Accessibility - access from anywhere with internet connection
4. Automatic updates - software updates handled by provider

Marking Guidelines:
- Each advantage clearly stated: 1 mark each
- Brief explanation for each: 1 mark each
- Accept equivalent terms (e.g., "flexibility" for "scalability")
- Deduct marks for vague or incorrect explanations

Q1) ii) a) What is SaaS? [3 marks]
Model Answer: Software as a Service (SaaS) is a cloud computing delivery model where software applications are hosted by a service provider and made available to customers over the internet.

Guidelines:
- Definition of SaaS (1 mark)
- Mention of cloud/internet delivery (1 mark)  
- Reference to service provider hosting (1 mark)


Output:
json
{
  "metadata": {
    "module_code": "CS5050",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": {
        "question": "List four advantages of cloud computing.",
        "answer": "1. Scalability - ability to scale resources up or down based on demand\n2. Cost-effectiveness - pay-as-you-use model reduces upfront costs\n3. Accessibility - access from anywhere with internet connection\n4. Automatic updates - software updates handled by provider",
        "guideline": "- Each advantage clearly stated: 1 mark each\n- Brief explanation for each: 1 mark each\n- Accept equivalent terms (e.g., \"flexibility\" for \"scalability\")\n- Deduct marks for vague or incorrect explanations",
        "marks": 8
      },
      "ii": {
        "a": {
          "question": "What is SaaS?",
          "answer": "Software as a Service (SaaS) is a cloud computing delivery model where software applications are hosted by a service provider and made available to customers over the internet.",
          "guideline": "- Definition of SaaS (1 mark)\n- Mention of cloud/internet delivery (1 mark)\n- Reference to service provider hosting (1 mark)",
          "marks": 3
        }
      }
    }
  }
}


*Example 3: Essay Questions with Comprehensive Marking*

Input Text:

Module: EE6250  
Examination: June 2025

Q1) i) Discuss the importance of data preprocessing in machine learning. Explain at least three key aspects. [15 marks]

Model Answer:
Data preprocessing is a critical step in machine learning that significantly impacts model performance and reliability. 

Key aspects include:

1. Data Cleaning (5 marks): Raw data often contains errors, missing values, duplicates, and inconsistencies. Cleaning involves identifying and correcting these issues to ensure data quality.

2. Feature Engineering (5 marks): This involves selecting, transforming, or creating new features that better represent the underlying patterns in the data for the learning algorithm.

3. Data Normalization/Scaling (5 marks): Different features may have different scales and units. Normalization ensures all features contribute equally to the learning process and prevents bias toward features with larger numerical values.

Additional aspects that may be discussed: handling outliers, data integration, dimensionality reduction.

Marking Guidelines:
- Clear introduction to data preprocessing: 2 marks
- Each key aspect properly explained: 5 marks each (max 3 aspects for full marks)
- Use of examples or practical applications: bonus 1-2 marks
- Logical flow and conclusion: 1 mark
- Accept alternative valid aspects like outlier handling, feature selection, etc.
- Partial marks for incomplete explanations


Output:
json
{
  "metadata": {
    "module_code": "EE6250",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": {
        "question": "Discuss the importance of data preprocessing in machine learning. Explain at least three key aspects.",
        "answer": "Data preprocessing is a critical step in machine learning that significantly impacts model performance and reliability.\n\nKey aspects include:\n\n1. Data Cleaning (5 marks): Raw data often contains errors, missing values, duplicates, and inconsistencies. Cleaning involves identifying and correcting these issues to ensure data quality.\n\n2. Feature Engineering (5 marks): This involves selecting, transforming, or creating new features that better represent the underlying patterns in the data for the learning algorithm.\n\n3. Data Normalization/Scaling (5 marks): Different features may have different scales and units. Normalization ensures all features contribute equally to the learning process and prevents bias toward features with larger numerical values.\n\nAdditional aspects that may be discussed: handling outliers, data integration, dimensionality reduction.",
        "guideline": "- Clear introduction to data preprocessing: 2 marks\n- Each key aspect properly explained: 5 marks each (max 3 aspects for full marks)\n- Use of examples or practical applications: bonus 1-2 marks\n- Logical flow and conclusion: 1 mark\n- Accept alternative valid aspects like outlier handling, feature selection, etc.\n- Partial marks for incomplete explanations",
        "marks": 15
      }
    }
  }
}


*Example 4: Mixed Question Types with Complex Hierarchy*

Input Text:

CS3050 - Operating Systems
June 2025 Final Exam - Model Answers

Q2) Operating System Functions

Q2) iv) List the main functions of an operating system: [6 marks]

Model Answer:
- Process management
- Memory management  
- File system management
- I/O device management
- Security and access control
- User interface provision

Marking Guideline: 1 mark for each correct function (maximum 6). Accept equivalent terminology.

Q3) Network Types [4 marks total]

Q3) What are the main types of computer networks based on geographical coverage?

Model Answer:
- LAN (Local Area Network) - covers small geographical areas like buildings
- WAN (Wide Area Network) - covers large geographical areas like countries  
- MAN (Metropolitan Area Network) - covers city-sized areas
- PAN (Personal Area Network) - covers very small areas around individual users

Guidelines: 1 mark for each network type with correct expansion/description.


Output:
json
{
  "metadata": {
    "module_code": "CS3050",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q2": {
      "iv": {
        "question": "List the main functions of an operating system:",
        "answer": "- Process management\n- Memory management\n- File system management\n- I/O device management\n- Security and access control\n- User interface provision",
        "guideline": "1 mark for each correct function (maximum 6). Accept equivalent terminology.",
        "marks": 6
      }
    },
    "Q3": {
      "question": "What are the main types of computer networks based on geographical coverage?",
      "answer": "- LAN (Local Area Network) - covers small geographical areas like buildings\n- WAN (Wide Area Network) - covers large geographical areas like countries\n- MAN (Metropolitan Area Network) - covers city-sized areas\n- PAN (Personal Area Network) - covers very small areas around individual users",
      "guideline": "1 mark for each network type with correct expansion/description.",
      "marks": 4
    }
  }
}


*Example 5: Mathematical Questions with Calculations*

Input Text:

Module: EE5500
June 2025 Examination - Answer Key

Q1) i) a) State Ohm's Law. [2 marks]
Question: State Ohm's Law and write its mathematical expression.
Model Answer: Ohm's Law states that the current through a conductor is directly proportional to the voltage across it and inversely proportional to its resistance. V = I × R
Marking: 
- Statement of the law: 1 mark
- Mathematical expression: 1 mark

Q1) i) b) Calculate the current when V=24V and R=8Ω. [3 marks]
Model Answer: Given: V = 24V, R = 8Ω
Using Ohm's Law: I = V/R
I = 24/8 = 3A
Marking Guidelines:
- Correct formula identification: 1 mark
- Correct substitution: 1 mark  
- Correct final answer with units: 1 mark

Q1) ii) Power calculation [5 marks]
Question: Derive the formula for electrical power and calculate power when V=12V and I=2A.
Model Answer: 
Power is the rate of energy consumption: P = W/t
Since W = V × I × t, therefore P = V × I
Given: V = 12V, I = 2A
P = V × I = 12 × 2 = 24W

Guidelines:
- Derivation of P = VI: 2 marks
- Correct substitution: 1 mark
- Calculation: 1 mark
- Units: 1 mark


Output:
json
{
  "metadata": {
    "module_code": "EE5500",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": {
        "a": {
          "question": "State Ohm's Law and write its mathematical expression.",
          "answer": "Ohm's Law states that the current through a conductor is directly proportional to the voltage across it and inversely proportional to its resistance. V = I × R",
          "guideline": "- Statement of the law: 1 mark\n- Mathematical expression: 1 mark",
          "marks": 2
        },
        "b": {
          "question": "Calculate the current when V=24V and R=8Ω.",
          "answer": "Given: V = 24V, R = 8Ω\nUsing Ohm's Law: I = V/R\nI = 24/8 = 3A",
          "guideline": "- Correct formula identification: 1 mark\n- Correct substitution: 1 mark\n- Correct final answer with units: 1 mark",
          "marks": 3
        }
      },
      "ii": {
        "question": "Derive the formula for electrical power and calculate power when V=12V and I=2A.",
        "answer": "Power is the rate of energy consumption: P = W/t\nSince W = V × I × t, therefore P = V × I\nGiven: V = 12V, I = 2A\nP = V × I = 12 × 2 = 24W",
        "guideline": "- Derivation of P = VI: 2 marks\n- Correct substitution: 1 mark\n- Calculation: 1 mark\n- Units: 1 mark",
        "marks": 5
      }
    }
  }
}


*Example 6: Programming Questions with Code*

Input Text:

Module: CS4100
June 2025 Programming Exam - Solutions

Q1) i) Write a Python function to calculate factorial. [8 marks]

Question: Write a recursive Python function to calculate the factorial of a number.

Model Answer:
def factorial(n):
    if n == 0 or n == 1:
        return 1
    else:
        return n * factorial(n-1)

Marking Scheme:
- Correct function definition: 2 marks
- Base case handling (n=0 or n=1): 2 marks  
- Recursive call structure: 2 marks
- Correct logic and syntax: 2 marks
- Deduct 1 mark for syntax errors
- Deduct 1 mark for incorrect base case

Q1) ii) Algorithm complexity [4 marks]

Question: What is the time complexity of the factorial function above?

Model Answer: The time complexity is O(n) because the function makes n recursive calls, each doing constant work.

Marking:
- Correct identification of O(n): 2 marks
- Proper explanation of reasoning: 2 marks
- Accept alternative valid explanations


Output:
json
{
  "metadata": {
    "module_code": "CS4100",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": {
        "question": "Write a recursive Python function to calculate the factorial of a number.",
        "answer": "def factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    else:\n        return n * factorial(n-1)",
        "guideline": "- Correct function definition: 2 marks\n- Base case handling (n=0 or n=1): 2 marks\n- Recursive call structure: 2 marks\n- Correct logic and syntax: 2 marks\n- Deduct 1 mark for syntax errors\n- Deduct 1 mark for incorrect base case",
        "marks": 8
      },
      "ii": {
        "question": "What is the time complexity of the factorial function above?",
        "answer": "The time complexity is O(n) because the function makes n recursive calls, each doing constant work.",
        "guideline": "- Correct identification of O(n): 2 marks\n- Proper explanation of reasoning: 2 marks\n- Accept alternative valid explanations",
        "marks": 4
      }
    }
  }
}


*Example 7: Questions Without Explicit Guidelines*

Input Text:

Module Code: EE6100
Digital Signal Processing - June 2025

Q1) i) Define sampling theorem. [4 marks]

The sampling theorem states that a continuous signal can be perfectly reconstructed from its samples if the sampling frequency is at least twice the highest frequency component of the signal (Nyquist rate).

Q1) ii) What is aliasing? [3 marks]

Aliasing occurs when the sampling frequency is insufficient, causing high-frequency components to appear as lower frequencies in the sampled signal.

Q2) FFT Applications [6 marks]

List and briefly explain three applications of Fast Fourier Transform.

Model Solutions:
1. Spectrum analysis - analyzing frequency content of signals
2. Digital filtering - implementing filters in frequency domain  
3. Image processing - operations like convolution in frequency domain


Output:
json
{
  "metadata": {
    "module_code": "EE6100",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": {
        "question": "Define sampling theorem.",
        "answer": "The sampling theorem states that a continuous signal can be perfectly reconstructed from its samples if the sampling frequency is at least twice the highest frequency component of the signal (Nyquist rate).",
        "guideline": "",
        "marks": 4
      },
      "ii": {
        "question": "What is aliasing?",
        "answer": "Aliasing occurs when the sampling frequency is insufficient, causing high-frequency components to appear as lower frequencies in the sampled signal.",
        "guideline": "",
        "marks": 3
      }
    },
    "Q2": {
      "question": "List and briefly explain three applications of Fast Fourier Transform.",
      "answer": "1. Spectrum analysis - analyzing frequency content of signals\n2. Digital filtering - implementing filters in frequency domain\n3. Image processing - operations like convolution in frequency domain",
      "guideline": "",
      "marks": 6
    }
  }
}


*Example 8: Partial Guidelines and Mixed Mark Allocations*

Input Text:

CS5500 - Database Systems
Final Examination June 2025

Q1) Database Normalization

Q1) i) a) What is 1NF (First Normal Form)? [2 marks]
A relation is in 1NF if all attributes contain only atomic (indivisible) values and each attribute contains values of single type.

Q1) i) b) Convert the following table to 1NF: [4 marks]
Student | Courses
John    | Math, Physics
Mary    | Chemistry, Biology

Solution:
Student | Course
John    | Math
John    | Physics  
Mary    | Chemistry
Mary    | Biology

Marking: 
- Recognition of non-atomic values: 1 mark
- Correct decomposition approach: 2 marks
- Final correct table: 1 mark

Q1) ii) Benefits of normalization [3 marks]

Main benefits include:
- Reduces data redundancy
- Improves data integrity
- Easier maintenance and updates

Q2) SQL Queries [Total: 10 marks]

Q2) i) Write SELECT statement to find students with GPA > 3.5 [3 marks]
SELECT * FROM students WHERE gpa > 3.5;

Q2) ii) Explain INNER JOIN vs LEFT JOIN [4 marks]  
INNER JOIN returns only rows where there's a match in both tables.
LEFT JOIN returns all rows from left table and matching rows from right table, with NULL for non-matching right table columns.

Basic explanation: 2 marks each join type
Detailed explanation with examples: 4 marks total

Q2) iii) Write a query using GROUP BY [3 marks]
SELECT department, COUNT(*) as student_count FROM students GROUP BY department;


Output:
json
{
  "metadata": {
    "module_code": "CS5500",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": {
        "a": {
          "question": "What is 1NF (First Normal Form)?",
          "answer": "A relation is in 1NF if all attributes contain only atomic (indivisible) values and each attribute contains values of single type.",
          "guideline": "",
          "marks": 2
        },
        "b": {
          "question": "Convert the following table to 1NF:",
          "answer": "Student | Course\nJohn    | Math\nJohn    | Physics\nMary    | Chemistry\nMary    | Biology",
          "guideline": "- Recognition of non-atomic values: 1 mark\n- Correct decomposition approach: 2 marks\n- Final correct table: 1 mark",
          "marks": 4
        }
      },
      "ii": {
        "question": "Benefits of normalization",
        "answer": "Main benefits include:\n- Reduces data redundancy\n- Improves data integrity\n- Easier maintenance and updates",
        "guideline": "",
        "marks": 3
      }
    },
    "Q2": {
      "i": {
        "question": "Write SELECT statement to find students with GPA > 3.5",
        "answer": "SELECT * FROM students WHERE gpa > 3.5;",
        "guideline": "",
        "marks": 3
      },
      "ii": {
        "question": "Explain INNER JOIN vs LEFT JOIN",
        "answer": "INNER JOIN returns only rows where there's a match in both tables.\nLEFT JOIN returns all rows from left table and matching rows from right table, with NULL for non-matching right table columns.",
        "guideline": "Basic explanation: 2 marks each join type\nDetailed explanation with examples: 4 marks total",
        "marks": 4
      },
      "iii": {
        "question": "Write a query using GROUP BY",
        "answer": "SELECT department, COUNT(*) as student_count FROM students GROUP BY department;",
        "guideline": "",
        "marks": 3
      }
    }
  }
}


*Example 9: No Questions Listed - Only Answers*

Input Text:

Module: EE4500
Control Systems - June 2025 Solutions

Q1) i) [5 marks]
A control system is a system that manages and regulates the behavior of other systems using feedback loops to achieve desired outputs.

Q1) ii) [3 marks]  
Open loop: No feedback, output doesn't affect input
Closed loop: Uses feedback, output influences input for error correction

Q2) [8 marks]
Transfer function represents the relationship between input and output of a linear time-invariant system in the frequency domain, expressed as H(s) = Y(s)/X(s) where s is the complex frequency variable.

For the given system: H(s) = 5/(s² + 3s + 2)
Poles are at s = -1 and s = -2 (roots of denominator)
System is stable since all poles have negative real parts.


Output:
json
{
  "metadata": {
    "module_code": "EE4500",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": {
        "question": "",
        "answer": "A control system is a system that manages and regulates the behavior of other systems using feedback loops to achieve desired outputs.",
        "guideline": "",
        "marks": 5
      },
      "ii": {
        "question": "",
        "answer": "Open loop: No feedback, output doesn't affect input\nClosed loop: Uses feedback, output influences input for error correction",
        "guideline": "",
        "marks": 3
      }
    },
    "Q2": {
      "question": "",
      "answer": "Transfer function represents the relationship between input and output of a linear time-invariant system in the frequency domain, expressed as H(s) = Y(s)/X(s) where s is the complex frequency variable.\n\nFor the given system: H(s) = 5/(s² + 3s + 2)\nPoles are at s = -1 and s = -2 (roots of denominator)\nSystem is stable since all poles have negative real parts.",
      "guideline": "",
      "marks": 8
    }
  }
}


*Example 10: Complex Guidelines with Alternative Answers*

Input Text:

Module: CS6200
Machine Learning - June 2025 Marking Guide

Q1) i) Compare supervised vs unsupervised learning [6 marks]

Model Answer:
Supervised learning uses labeled training data where input-output pairs are known. The goal is to learn a mapping function to predict outputs for new inputs. Examples include classification and regression.

Unsupervised learning works with unlabeled data to discover hidden patterns or structures. No target outputs are provided. Examples include clustering and dimensionality reduction.

Detailed Marking Guidelines:
- Definition of supervised learning: 2 marks
  * Must mention labeled data/input-output pairs: 1 mark
  * Must mention prediction goal: 1 mark
- Definition of unsupervised learning: 2 marks  
  * Must mention unlabeled data: 1 mark
  * Must mention pattern discovery: 1 mark
- Examples for each type: 1 mark each (2 marks total)
- Accept alternative valid examples: classification, regression, clustering, PCA, etc.
- Partial credit for incomplete but correct explanations
- No marks for vague or incorrect statements

Q1) ii) What is cross-validation and why is it used? [4 marks]

Cross-validation is a technique to assess model performance by partitioning data into training and validation sets multiple times. It helps estimate how well a model generalizes to unseen data and reduces overfitting.

Marking:
- Basic definition of cross-validation: 1 mark
- Mention of data partitioning/multiple splits: 1 mark  
- Purpose - assessing generalization: 1 mark
- Mention of overfitting prevention: 1 mark
- Accept k-fold, leave-one-out variations
- Credit for mentioning specific techniques like k-fold CV


Output:
json
{
  "metadata": {
    "module_code": "CS6200",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": {
        "question": "Compare supervised vs unsupervised learning",
        "answer": "Supervised learning uses labeled training data where input-output pairs are known. The goal is to learn a mapping function to predict outputs for new inputs. Examples include classification and regression.\n\nUnsupervised learning works with unlabeled data to discover hidden patterns or structures. No target outputs are provided. Examples include clustering and dimensionality reduction.",
        "guideline": "- Definition of supervised learning: 2 marks\n  * Must mention labeled data/input-output pairs: 1 mark\n  * Must mention prediction goal: 1 mark\n- Definition of unsupervised learning: 2 marks\n  * Must mention unlabeled data: 1 mark\n  * Must mention pattern discovery: 1 mark\n- Examples for each type: 1 mark each (2 marks total)\n- Accept alternative valid examples: classification, regression, clustering, PCA, etc.\n- Partial credit for incomplete but correct explanations\n- No marks for vague or incorrect statements",
        "marks": 6
      },
      "ii": {
        "question": "What is cross-validation and why is it used?",
        "answer": "Cross-validation is a technique to assess model performance by partitioning data into training and validation sets multiple times. It helps estimate how well a model generalizes to unseen data and reduces overfitting.",
        "guideline": "- Basic definition of cross-validation: 1 mark\n- Mention of data partitioning/multiple splits: 1 mark\n- Purpose - assessing generalization: 1 mark\n- Mention of overfitting prevention: 1 mark\n- Accept k-fold, leave-one-out variations\n- Credit for mentioning specific techniques like k-fold CV",
        "marks": 4
      }
    }
  }
}


-----------------------------
*Output Format (JSON only)*

Your response *must* be a single valid JSON object following the structure shown in the examples above.

-----------------------------
*Strict Rules:*

- *Return only valid JSON*. No markdown, no triple backticks, no explanations.
- *DO NOT use flat keys* like "Q1_i_answer". Use nested objects only.
- *Every answer leaf must include all 4 fields*: question, answer, guideline, marks.
- *Return empty strings ("")* for missing question text or guidelines.
- *Return null* for missing marks information.
- *Clean up spacing* and ensure well-formatted output.
- *Preserve the structure* of multi-paragraph answers and guidelines using \\n for line breaks and \\n\\n for paragraph breaks.
- *Group related marking criteria* within the guideline field using newlines.
- *Extract marks as integers* (convert "5 marks" to 5, "[3 marks]" to 3).
- *Maintain the exact question hierarchy* as shown in the document.
- *Handle mathematical expressions* and code snippets by preserving exact formatting.
- *Process alternative answers* and complex guidelines as single strings with proper line breaks.

-----------------------------
*Common Mistakes to Avoid:*

1. ❌ *Flattening nested question structure* into flat keys
2. ❌ *Missing any of the 4 required fields* (question, answer, guideline, marks)
3. ❌ *Adding markdown formatting* or code blocks to JSON
4. ❌ *Splitting related guideline points* across different fields
5. ❌ *Incorrect mark extraction* (strings instead of integers)
6. ❌ *Breaking mathematical/code content* across multiple lines incorrectly
7. ❌ *Inconsistent empty field handling* (use "" for missing text, null for missing marks)
8. ❌ *Losing hierarchy structure* when questions have complex nesting

### ✅ *Correct Approach:*
- *Follow the exact structure* shown in examples above
- *Preserve all content formatting* within JSON strings using escape characters
- *Group complete marking schemes* in single guideline fields
- *Extract marks consistently* as integers from various formats
- *Handle missing information* uniformly with empty strings or null values
- *Maintain question hierarchy* exactly as presented in the source document
"""