

# # # # EXTRACT_STUDENT_ANSWERS_PROMPT = """
# # # # You will receive the full text content of a student's typed or handwritten exam script.

# # # # ---

# # # # ### Your Tasks:

# # # # 1. Extract Exam Metadata (ONLY ONCE)

# # # # From the top section of the document, extract:

# # # # - "student_index" (e.g., "EG/2020/4247")
# # # # - "module_code" (e.g., "EE6250")
# # # # - "exam_year" (e.g., 2025)
# # # # - "exam_month" (e.g., "June")

# # # # Return these inside a "metadata" field.

# # # # ---

# # # # 2. Extract Answers with Correct Question Hierarchy

# # # # Extract all answers **exactly following the hierarchical structure** used in the answer script:

# # # # - Q1) i) a)
# # # # - Q1) ii)
# # # # - Q2) i) b)
# # # # - Q2) ii)
# # # # - etc.

# # # # Make sure to preserve:
# # # # - Main questions: Q1, Q2, Q3, ...
# # # # - Sub-questions: i, ii, iii, ...
# # # # - Sub-sub-questions: a, b, c, ...
# # # # - Sub-sub-sub-questions: 1), 2), ...

# # # # Treat each change in question number as a new section, even if the formatting is inconsistent or spacing is irregular.

# # # # ---

# # # # ### Output Format (Strict JSON Only)

# # # # Return the result using **only valid JSON**, as shown below:

# # # # {
# # # #   "metadata": {
# # # #     "student_index": "EG/2020/4247",
# # # #     "module_code": "EE6250",
# # # #     "exam_year": 2025,
# # # #     "exam_month": "June"
# # # #   },
# # # #   "answers": {
# # # #     "Q1": {
# # # #       "i": {
# # # #         "a": "Answer for Q1 i a",
# # # #         "b": "Answer for Q1 i b"
# # # #       },
# # # #       "ii": "Answer for Q1 ii"
# # # #     },
# # # #     "Q2": {
# # # #       "i": "Answer for Q2 i",
# # # #       "ii": "Answer for Q2 ii"
# # # #     }
# # # #   }
# # # # }

# # # # ---

# # # # ### Important Rules:

# # # # - Do NOT return markdown or explanation — only the JSON object.
# # # # - Use nested structure to match question numbers.
# # # # - If a question has no sub-parts, use a string.
# # # # - Trim any unnecessary whitespace from answers.
# # # # - Begin output with `{` and end with `}`.
# # # # """

# # # EXTRACT_STUDENT_ANSWERS_PROMPT = """
# # # You will receive the full text content of a student's typed or handwritten exam script.

# # # ---

# # # ### Your Tasks:

# # # 1. Extract Exam Metadata (ONLY ONCE)

# # # From the top section of the document, extract:

# # # - "student_index" (e.g., "EG/2020/4247")
# # # - "module_code" (e.g., "EE6250")
# # # - "exam_year" (e.g., 2025)
# # # - "exam_month" (e.g., "June")

# # # Return these inside a "metadata" field.

# # # ---

# # # 2. Extract Answers with Correct Question Hierarchy (Avoid Over-Splitting)

# # # Extract all answers **exactly following the hierarchical structure** used in the answer script:

# # # - Q1) i) a)
# # # - Q1) ii)
# # # - Q2) i) b)
# # # - Q2) ii)
# # # - etc.

# # # Make sure to preserve:
# # # - Main questions: Q1, Q2, Q3, ...
# # # - Sub-questions: i, ii, iii, ...
# # # - Sub-sub-questions: a, b, c, ...
# # # - Sub-sub-sub-questions: 1), 2), ...

# # # Treat each change in question number as a new section, even if the formatting is inconsistent or spacing is irregular.

# # # ---

# # # ### Output Format (Strict JSON Only)

# # # Return the result using **only valid JSON**, as shown below:

# # # {
# # #   "metadata": {
# # #     "student_index": "EG/2020/4247",
# # #     "module_code": "EE6250",
# # #     "exam_year": 2025,
# # #     "exam_month": "June"
# # #   },
# # #   "answers": {
# # #     "Q1": {
# # #       "i": {
# # #         "a": "Answer for Q1 i a",
# # #         "b": "Answer for Q1 i b"
# # #       },
# # #       "ii": "Answer for Q1 ii"
# # #     },
# # #     "Q2": {
# # #       "i": "Answer for Q2 i",
# # #       "ii": "Answer for Q2 ii",
# # #       "iv": "Load\nExit\nOpen\nClose"
# # #     }
# # #   }
# # # }

# # # ---

# # # ### Important Rules:

# # # - DO NOT split bullet points or list items (e.g., "Load", "Exit", "Open", "Close") into sub-questions unless they are clearly labeled (a), b), 1), 2), etc).
# # # - If multiple lines appear under the same sub-question (e.g., Q2.iv), group all list-style lines as a single string with newline characters (`\\n`).
# # # - Treat bullet points or indentation as part of the same answer unless new numbering appears.
# # # - Do NOT return markdown or explanation — only the JSON object.
# # # - Use nested structure to match question numbers.
# # # - If a question has no sub-parts, use a string.
# # # - Trim any unnecessary whitespace from answers.
# # # - Begin output with `{` and end with `}`.
# # # """

# # EXTRACT_STUDENT_ANSWERS_PROMPT = """
# # You will receive the full text content of a student's typed or handwritten exam script.

# # ---

# # ### Your Tasks:

# # 1. Extract Exam Metadata (ONLY ONCE)

# # From the top section of the document, extract:
# # - "student_index" (e.g., "EG/2020/4247")
# # - "module_code" (e.g., "EE6250")
# # - "exam_year" (e.g., 2025)
# # - "exam_month" (e.g., "June")

# # Return these inside a "metadata" field.

# # ---

# # 2. Extract Answers with Correct Question Hierarchy (Avoid Over-Splitting)

# # Extract all answers *exactly following the hierarchical structure* used in the answer script:
# # - Q1) i) a)
# # - Q1) ii)
# # - Q2) i) b)
# # - Q2) ii)
# # - etc.

# # Make sure to preserve:
# # - Main questions: Q1, Q2, Q3, ...
# # - Sub-questions: i, ii, iii, ...
# # - Sub-sub-questions: a, b, c, ...
# # - Sub-sub-sub-questions: 1), 2), ...

# # Treat each change in question number as a new section, even if the formatting is inconsistent or spacing is irregular.

# # ---

# # ### COMPREHENSIVE EXAMPLES:

# # *Example 1: Short Answers with Clear Structure*

# # Input Text:

# # Student Index: EG/2020/4247
# # Module: EE6250
# # Year: 2025, June

# # Q1) i) Define machine learning.
# # Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.

# # Q1) ii) What is overfitting?
# # Overfitting occurs when a model learns the training data too well, including noise and outliers, leading to poor performance on new data.

# # Q2) List three types of machine learning.
# # Supervised learning
# # Unsupervised learning
# # Reinforcement learning


# # Output:
# # json
# # {
# #   "metadata": {
# #     "student_index": "EG/2020/4247",
# #     "module_code": "EE6250",
# #     "exam_year": 2025,
# #     "exam_month": "June"
# #   },
# #   "answers": {
# #     "Q1": {
# #       "i": "Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.",
# #       "ii": "Overfitting occurs when a model learns the training data too well, including noise and outliers, leading to poor performance on new data."
# #     },
# #     "Q2": "Supervised learning\nUnsupervised learning\nReinforcement learning"
# #   }
# # }


# # *Example 2: List-Type Questions with Mixed Formatting*

# # Input Text:

# # Student: EG/2021/3456
# # Module Code: CS5050
# # Exam: 2025 June

# # Q1) i) List the advantages of cloud computing:
# # - Scalability
# # - Cost-effectiveness  
# # - Accessibility
# # - Automatic updates

# # Q1) ii) a) What is SaaS?
# # Software as a Service (SaaS) is a cloud computing model where software applications are provided over the internet.

# # Q1) ii) b) Give two examples of SaaS.
# # Gmail
# # Salesforce

# # Q2) Explain the OSI model layers:
# # Physical layer - handles physical transmission
# # Data link layer - manages node-to-node delivery
# # Network layer - handles routing
# # Transport layer - ensures reliable delivery


# # Output:
# # json
# # {
# #   "metadata": {
# #     "student_index": "EG/2021/3456",
# #     "module_code": "CS5050",
# #     "exam_year": 2025,
# #     "exam_month": "June"
# #   },
# #   "answers": {
# #     "Q1": {
# #       "i": "- Scalability\n- Cost-effectiveness\n- Accessibility\n- Automatic updates",
# #       "ii": {
# #         "a": "Software as a Service (SaaS) is a cloud computing model where software applications are provided over the internet.",
# #         "b": "Gmail\nSalesforce"
# #       }
# #     },
# #     "Q2": "Physical layer - handles physical transmission\nData link layer - manages node-to-node delivery\nNetwork layer - handles routing\nTransport layer - ensures reliable delivery"
# #   }
# # }


# # *Example 3: Essay Response with Sub-Questions*

# # Input Text:

# # Index: EG/2022/7890
# # Module: EE6250
# # 2025 June Examination

# # Q1) i) Discuss the importance of data preprocessing in machine learning. (10 marks)

# # Data preprocessing is a crucial step in machine learning that involves cleaning, transforming, and organizing raw data before feeding it to machine learning algorithms. 

# # The importance of data preprocessing can be understood through several key aspects:

# # 1. Data Quality: Raw data often contains errors, missing values, and inconsistencies that can significantly impact model performance.

# # 2. Feature Engineering: Preprocessing allows us to create new features or transform existing ones to better represent the underlying patterns.

# # 3. Normalization: Different features may have different scales, and preprocessing helps normalize these to prevent bias toward features with larger values.

# # Without proper preprocessing, even the most sophisticated algorithms may fail to produce accurate results.

# # Q1) ii) What is cross-validation?
# # Cross-validation is a technique used to assess how well a machine learning model will generalize to unseen data by partitioning the dataset into subsets.

# # Q2) i) Compare supervised and unsupervised learning.
# # Supervised learning uses labeled data to train models for prediction tasks, while unsupervised learning finds patterns in unlabeled data without predefined outcomes.


# # Output:
# # json
# # {
# #   "metadata": {
# #     "student_index": "EG/2022/7890",
# #     "module_code": "EE6250",
# #     "exam_year": 2025,
# #     "exam_month": "June"
# #   },
# #   "answers": {
# #     "Q1": {
# #       "i": "Data preprocessing is a crucial step in machine learning that involves cleaning, transforming, and organizing raw data before feeding it to machine learning algorithms.\n\nThe importance of data preprocessing can be understood through several key aspects:\n\n1. Data Quality: Raw data often contains errors, missing values, and inconsistencies that can significantly impact model performance.\n\n2. Feature Engineering: Preprocessing allows us to create new features or transform existing ones to better represent the underlying patterns.\n\n3. Normalization: Different features may have different scales, and preprocessing helps normalize these to prevent bias toward features with larger values.\n\nWithout proper preprocessing, even the most sophisticated algorithms may fail to produce accurate results.",
# #       "ii": "Cross-validation is a technique used to assess how well a machine learning model will generalize to unseen data by partitioning the dataset into subsets."
# #     },
# #     "Q2": {
# #       "i": "Supervised learning uses labeled data to train models for prediction tasks, while unsupervised learning finds patterns in unlabeled data without predefined outcomes."
# #     }
# #   }
# # }


# # *Example 4: Common Error Cases (DO NOT split these)*

# # Input Text:

# # Student Index: EG/2020/1234
# # Module: CS3050
# # Year: 2025, June

# # Q2) iv) List the main functions of an operating system:
# # Load programs into memory
# # Exit applications safely
# # Open files and directories
# # Close network connections
# # Manage system resources
# # Schedule processes

# # Q3) What are the types of networks?
# # LAN - Local Area Network
# # WAN - Wide Area Network  
# # MAN - Metropolitan Area Network
# # PAN - Personal Area Network


# # Output:
# # json
# # {
# #   "metadata": {
# #     "student_index": "EG/2020/1234",
# #     "module_code": "CS3050",
# #     "exam_year": 2025,
# #     "exam_month": "June"
# #   },
# #   "answers": {
# #     "Q2": {
# #       "iv": "Load programs into memory\nExit applications safely\nOpen files and directories\nClose network connections\nManage system resources\nSchedule processes"
# #     },
# #     "Q3": "LAN - Local Area Network\nWAN - Wide Area Network\nMAN - Metropolitan Area Network\nPAN - Personal Area Network"
# #   }
# # }


# # *Example 5: Complex Hierarchy with Multiple Levels*

# # Input Text:

# # Student ID: EG/2023/5678
# # Module: CS4050
# # June 2025 Final Exam

# # Q1) Database Design

# # Q1) i) a) What is database normalization?
# # Database normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.

# # Q1) i) b) List the first three normal forms:
# # 1NF - First Normal Form
# # 2NF - Second Normal Form  
# # 3NF - Third Normal Form

# # Q1) ii) Entity-Relationship Modeling

# # Q1) ii) a) Define an entity.
# # An entity is a distinguishable object or concept that can be uniquely identified and about which information is stored.

# # Q1) ii) b) What is a relationship?
# # A relationship represents an association between two or more entities in a database model.

# # Q2) SQL Queries

# # Q2) i) Write a SELECT statement to find all customers from London.
# # SELECT * FROM customers WHERE city = 'London';

# # Q2) ii) Explain the difference between INNER JOIN and LEFT JOIN.
# # INNER JOIN returns only matching records from both tables, while LEFT JOIN returns all records from the left table and matching records from the right table.


# # Output:
# # json
# # {
# #   "metadata": {
# #     "student_index": "EG/2023/5678",
# #     "module_code": "CS4050",
# #     "exam_year": 2025,
# #     "exam_month": "June"
# #   },
# #   "answers": {
# #     "Q1": {
# #       "i": {
# #         "a": "Database normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.",
# #         "b": "1NF - First Normal Form\n2NF - Second Normal Form\n3NF - Third Normal Form"
# #       },
# #       "ii": {
# #         "a": "An entity is a distinguishable object or concept that can be uniquely identified and about which information is stored.",
# #         "b": "A relationship represents an association between two or more entities in a database model."
# #       }
# #     },
# #     "Q2": {
# #       "i": "SELECT * FROM customers WHERE city = 'London';",
# #       "ii": "INNER JOIN returns only matching records from both tables, while LEFT JOIN returns all records from the left table and matching records from the right table."
# #     }
# #   }
# # }


# # *Example 6: Inconsistent Formatting - Handle Gracefully*

# # Input Text:

# # Student: EG/2024/9012
# # Module: EE5050  
# # Exam Period: June 2025

# # Q1)i)Define artificial intelligence
# # AI is the simulation of human intelligence in machines that are programmed to think and learn like humans.

# # Q1) ii )List 3 AI applications
# # 1. Speech recognition
# # 2. Image processing  
# # 3. Expert systems

# # Q2)What is machine learning?
# # Machine learning is a subset of AI that provides systems the ability to learn from data without being explicitly programmed.

# # Q3) i) Neural networks
# # Q3) i) a) Basic structure
# # Neural networks consist of input layer, hidden layers, and output layer with interconnected nodes.

# # Q3)i)b)Activation functions
# # Common activation functions include sigmoid, ReLU, and tanh which introduce non-linearity.


# # Output:
# # json
# # {
# #   "metadata": {
# #     "student_index": "EG/2024/9012",
# #     "module_code": "EE5050",
# #     "exam_year": 2025,
# #     "exam_month": "June"
# #   },
# #   "answers": {
# #     "Q1": {
# #       "i": "AI is the simulation of human intelligence in machines that are programmed to think and learn like humans.",
# #       "ii": "1. Speech recognition\n2. Image processing\n3. Expert systems"
# #     },
# #     "Q2": "Machine learning is a subset of AI that provides systems the ability to learn from data without being explicitly programmed.",
# #     "Q3": {
# #       "i": {
# #         "a": "Neural networks consist of input layer, hidden layers, and output layer with interconnected nodes.",
# #         "b": "Common activation functions include sigmoid, ReLU, and tanh which introduce non-linearity."
# #       }
# #     }
# #   }
# # }


# # *Example 7: Empty and Partial Answers*

# # Input Text:

# # Student Index: EG/2025/3456
# # Module Code: CS6050
# # 2025 June Exam

# # Q1) i) What is cloud computing?
# # Cloud computing is the delivery of computing services over the internet including storage, processing, and software.

# # Q1) ii) List benefits of cloud computing.

# # Q2) i) Define big data.

# # Q2) ii) What are the 4 Vs of big data?
# # Volume, Velocity, Variety, Veracity

# # Q3) Explain data mining.
# # Data mining is the process of discovering patterns and knowledge from large datasets.


# # Output:
# # json
# # {
# #   "metadata": {
# #     "student_index": "EG/2025/3456",
# #     "module_code": "CS6050",
# #     "exam_year": 2025,
# #     "exam_month": "June"
# #   },
# #   "answers": {
# #     "Q1": {
# #       "i": "Cloud computing is the delivery of computing services over the internet including storage, processing, and software.",
# #       "ii": ""
# #     },
# #     "Q2": {
# #       "i": "",
# #       "ii": "Volume, Velocity, Variety, Veracity"
# #     },
# #     "Q3": "Data mining is the process of discovering patterns and knowledge from large datasets."
# #   }
# # }


# # *Example 8: Mathematical and Technical Content*

# # Input Text:

# # Student: EG/2025/7890
# # Module: EE6500
# # June 2025 Examination

# # Q1) i) State Ohm's Law.
# # V = I × R, where V is voltage, I is current, and R is resistance.

# # Q1) ii) Calculate current when V=12V and R=4Ω.
# # I = V/R = 12/4 = 3A

# # Q2) i) a) What is a transistor?
# # A transistor is a semiconductor device used to amplify or switch electronic signals.

# # Q2) i) b) Types of transistors:
# # 1) BJT (Bipolar Junction Transistor)
# # 2) FET (Field Effect Transistor) 

# # Q2) ii) Draw the symbol for NPN transistor.
# # [Student drew a circuit symbol - represented as text]
# # NPN transistor symbol with collector, base, and emitter terminals.


# # Output:
# # json
# # {
# #   "metadata": {
# #     "student_index": "EG/2025/7890",
# #     "module_code": "EE6500",
# #     "exam_year": 2025,
# #     "exam_month": "June"
# #   },
# #   "answers": {
# #     "Q1": {
# #       "i": "V = I × R, where V is voltage, I is current, and R is resistance.",
# #       "ii": "I = V/R = 12/4 = 3A"
# #     },
# #     "Q2": {
# #       "i": {
# #         "a": "A transistor is a semiconductor device used to amplify or switch electronic signals.",
# #         "b": "1) BJT (Bipolar Junction Transistor)\n2) FET (Field Effect Transistor)"
# #       },
# #       "ii": "NPN transistor symbol with collector, base, and emitter terminals."
# #     }
# #   }
# # }


# # ---

# # ### Output Format (Strict JSON Only)

# # Return the result using *only valid JSON*, following the structure shown in the examples above.

# # ---

# # ### Important Rules:

# # - *DO NOT split bullet points or list items* (e.g., "Load", "Exit", "Open", "Close") into sub-questions unless they are clearly labeled with (a), b), 1), 2), etc.
# # - *If multiple lines appear under the same sub-question*, group all content as a single string with newline characters (\\n).
# # - *Treat bullet points, dashes, or simple lists as part of the same answer* unless new question numbering appears.
# # - *For essay-type responses*, preserve paragraph structure using \\n\\n for paragraph breaks.
# # - *Handle inconsistent formatting gracefully* - focus on question numbers rather than spacing.
# # - *Empty answers should be represented as empty strings* "".
# # - *Mathematical expressions and formulas* should be preserved exactly as written.
# # - *DO NOT return markdown or explanation* — only the JSON object.
# # - *Use nested structure to match question hierarchy exactly*.
# # - *If a question has no sub-parts, use a string directly*.
# # - *Trim unnecessary whitespace* but preserve meaningful line breaks.
# # - **Begin output with { and end with }**.
# # - *Preserve the original content structure* - don't artificially split content that belongs together.

# # ---

# # ### Common Mistakes to Avoid:

# # 1. ❌ *Over-splitting*: Turning "Load\\nExit\\nOpen\\nClose" into separate sub-questions when they're just list items
# # 2. ❌ *Creating artificial hierarchy* where none exists in the original
# # 3. ❌ *Losing paragraph structure* in essay answers
# # 4. ❌ *Adding extra nesting levels* not present in the original question structure
# # 5. ❌ *Treating every new line as a new sub-question* instead of preserving content flow
# # 6. ❌ *Inconsistent empty answer handling* - always use empty strings ""
# # 7. ❌ *Breaking mathematical expressions* across multiple fields
# # 8. ❌ *Ignoring question hierarchy* when formatting is inconsistent

# # ### ✅ *Correct Approach:*
# # - *Keep related content together* as demonstrated in the examples
# # - *Follow the question numbering system* exactly as written
# # - *Preserve meaningful structure* while avoiding artificial splits
# # - *Handle formatting inconsistencies* by focusing on content and numbering
# # - *Maintain empty answers* as empty strings within the proper hierarchy
# # - *Group list items* under single answers unless explicitly sub-labeled
# # """

# EXTRACT_STUDENT_ANSWERS_PROMPT = """
# You will receive the full text content of a student's typed or handwritten exam script.

# ---

# ### Your Tasks:

# 1. Extract Exam Metadata (ONLY ONCE)

# From the top section of the document, extract:
# - "student_index" (e.g., "EG/2020/4247")
# - "module_code" (e.g., "EE6250")
# - "exam_year" (e.g., 2025)
# - "exam_month" (e.g., "June")

# Return these inside a "metadata" field.

# ---

# 2. Extract Answers with Correct Question Hierarchy (Avoid Over-Splitting)

# Extract all answers *exactly following the hierarchical structure* used in the answer script. The system supports TWO numbering methods:

# **Method 1 (Original):**
# - Main questions: Q1, Q2, Q3, ...
# - Sub-questions: i, ii, iii, ...
# - Sub-sub-questions: a, b, c, ...
# - Sub-sub-sub-questions: 1), 2), 3), ...

# **Method 2 (New):**
# - Main questions: Q1, Q2, Q3, ...
# - Sub-questions: a, b, c, ...
# - Sub-sub-questions: i, ii, iii, ...
# - Sub-sub-sub-questions: 1), 2), 3), ...

# Make sure to preserve:
# - Main questions: Q1, Q2, Q3, ...
# - Sub-questions: i, ii, iii, ... OR a, b, c, ...
# - Sub-sub-questions: a, b, c, ... OR i, ii, iii, ...
# - Sub-sub-sub-questions: 1), 2), 3), ...

# Treat each change in question number as a new section, even if the formatting is inconsistent or spacing is irregular.

# ---

# ### COMPREHENSIVE EXAMPLES:

# *Example 1: Short Answers with Clear Structure (Method 1)*

# Input Text:

# Student Index: EG/2020/4247
# Module: EE6250
# Year: 2025, June

# Q1) i) Define machine learning.
# Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.

# Q1) ii) What is overfitting?
# Overfitting occurs when a model learns the training data too well, including noise and outliers, leading to poor performance on new data.

# Q2) List three types of machine learning.
# Supervised learning
# Unsupervised learning
# Reinforcement learning


# Output:
# json
# {
#   "metadata": {
#     "student_index": "EG/2020/4247",
#     "module_code": "EE6250",
#     "exam_year": 2025,
#     "exam_month": "June"
#   },
#   "answers": {
#     "Q1": {
#       "i": "Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.",
#       "ii": "Overfitting occurs when a model learns the training data too well, including noise and outliers, leading to poor performance on new data."
#     },
#     "Q2": "Supervised learning\nUnsupervised learning\nReinforcement learning"
#   }
# }


# *Example 2: Method 2 Numbering System*

# Input Text:

# Student Index: EG/2023/1234
# Module: CS4050
# Year: 2025, June

# Q1) a) What is object-oriented programming?
# Object-oriented programming is a programming paradigm based on the concept of objects, which contain data and code.

# Q1) b) i) Define encapsulation.
# Encapsulation is the bundling of data and methods that operate on that data within a single unit or object.

# Q1) b) ii) Give an example of encapsulation.
# A class with private variables and public methods to access them, like a BankAccount class with private balance and public deposit/withdraw methods.

# Q2) a) List the four pillars of OOP.
# Encapsulation
# Inheritance
# Polymorphism
# Abstraction

# Q2) b) Explain inheritance.
# Inheritance allows a class to inherit properties and methods from another class, promoting code reusability.


# Output:
# json
# {
#   "metadata": {
#     "student_index": "EG/2023/1234",
#     "module_code": "CS4050",
#     "exam_year": 2025,
#     "exam_month": "June"
#   },
#   "answers": {
#     "Q1": {
#       "a": "Object-oriented programming is a programming paradigm based on the concept of objects, which contain data and code.",
#       "b": {
#         "i": "Encapsulation is the bundling of data and methods that operate on that data within a single unit or object.",
#         "ii": "A class with private variables and public methods to access them, like a BankAccount class with private balance and public deposit/withdraw methods."
#       }
#     },
#     "Q2": {
#       "a": "Encapsulation\nInheritance\nPolymorphism\nAbstraction",
#       "b": "Inheritance allows a class to inherit properties and methods from another class, promoting code reusability."
#     }
#   }
# }


# *Example 3: List-Type Questions with Mixed Formatting (Method 1)*

# Input Text:

# Student: EG/2021/3456
# Module Code: CS5050
# Exam: 2025 June

# Q1) i) List the advantages of cloud computing:
# - Scalability
# - Cost-effectiveness  
# - Accessibility
# - Automatic updates

# Q1) ii) a) What is SaaS?
# Software as a Service (SaaS) is a cloud computing model where software applications are provided over the internet.

# Q1) ii) b) Give two examples of SaaS.
# Gmail
# Salesforce

# Q2) Explain the OSI model layers:
# Physical layer - handles physical transmission
# Data link layer - manages node-to-node delivery
# Network layer - handles routing
# Transport layer - ensures reliable delivery


# Output:
# json
# {
#   "metadata": {
#     "student_index": "EG/2021/3456",
#     "module_code": "CS5050",
#     "exam_year": 2025,
#     "exam_month": "June"
#   },
#   "answers": {
#     "Q1": {
#       "i": "- Scalability\n- Cost-effectiveness\n- Accessibility\n- Automatic updates",
#       "ii": {
#         "a": "Software as a Service (SaaS) is a cloud computing model where software applications are provided over the internet.",
#         "b": "Gmail\nSalesforce"
#       }
#     },
#     "Q2": "Physical layer - handles physical transmission\nData link layer - manages node-to-node delivery\nNetwork layer - handles routing\nTransport layer - ensures reliable delivery"
#   }
# }


# *Example 4: Mixed Numbering Systems in Same Document*

# Input Text:

# Student: EG/2024/5678
# Module: EE5500
# June 2025 Final

# Q1) a) What is digital signal processing?
# Digital signal processing is the use of digital processing to perform operations on signals.

# Q1) b) i) Define sampling rate.
# Sampling rate is the number of samples taken per second from a continuous signal.

# Q1) b) ii) What is the Nyquist theorem?
# The Nyquist theorem states that the sampling rate must be at least twice the highest frequency component.

# Q2) i) List types of filters:
# Low-pass filter
# High-pass filter
# Band-pass filter
# Band-stop filter

# Q2) ii) a) What is impulse response?
# Impulse response is the output of a system when presented with a unit impulse input.

# Q2) ii) b) Define frequency response.
# Frequency response describes how a system responds to sinusoidal inputs at different frequencies.


# Output:
# json
# {
#   "metadata": {
#     "student_index": "EG/2024/5678",
#     "module_code": "EE5500",
#     "exam_year": 2025,
#     "exam_month": "June"
#   },
#   "answers": {
#     "Q1": {
#       "a": "Digital signal processing is the use of digital processing to perform operations on signals.",
#       "b": {
#         "i": "Sampling rate is the number of samples taken per second from a continuous signal.",
#         "ii": "The Nyquist theorem states that the sampling rate must be at least twice the highest frequency component."
#       }
#     },
#     "Q2": {
#       "i": "Low-pass filter\nHigh-pass filter\nBand-pass filter\nBand-stop filter",
#       "ii": {
#         "a": "Impulse response is the output of a system when presented with a unit impulse input.",
#         "b": "Frequency response describes how a system responds to sinusoidal inputs at different frequencies."
#       }
#     }
#   }
# }


# *Example 5: Essay Response with Sub-Questions (Method 1)*

# Input Text:

# Index: EG/2022/7890
# Module: EE6250
# 2025 June Examination

# Q1) i) Discuss the importance of data preprocessing in machine learning. (10 marks)

# Data preprocessing is a crucial step in machine learning that involves cleaning, transforming, and organizing raw data before feeding it to machine learning algorithms. 

# The importance of data preprocessing can be understood through several key aspects:

# 1. Data Quality: Raw data often contains errors, missing values, and inconsistencies that can significantly impact model performance.

# 2. Feature Engineering: Preprocessing allows us to create new features or transform existing ones to better represent the underlying patterns.

# 3. Normalization: Different features may have different scales, and preprocessing helps normalize these to prevent bias toward features with larger values.

# Without proper preprocessing, even the most sophisticated algorithms may fail to produce accurate results.

# Q1) ii) What is cross-validation?
# Cross-validation is a technique used to assess how well a machine learning model will generalize to unseen data by partitioning the dataset into subsets.

# Q2) i) Compare supervised and unsupervised learning.
# Supervised learning uses labeled data to train models for prediction tasks, while unsupervised learning finds patterns in unlabeled data without predefined outcomes.


# Output:
# json
# {
#   "metadata": {
#     "student_index": "EG/2022/7890",
#     "module_code": "EE6250",
#     "exam_year": 2025,
#     "exam_month": "June"
#   },
#   "answers": {
#     "Q1": {
#       "i": "Data preprocessing is a crucial step in machine learning that involves cleaning, transforming, and organizing raw data before feeding it to machine learning algorithms.\n\nThe importance of data preprocessing can be understood through several key aspects:\n\n1. Data Quality: Raw data often contains errors, missing values, and inconsistencies that can significantly impact model performance.\n\n2. Feature Engineering: Preprocessing allows us to create new features or transform existing ones to better represent the underlying patterns.\n\n3. Normalization: Different features may have different scales, and preprocessing helps normalize these to prevent bias toward features with larger values.\n\nWithout proper preprocessing, even the most sophisticated algorithms may fail to produce accurate results.",
#       "ii": "Cross-validation is a technique used to assess how well a machine learning model will generalize to unseen data by partitioning the dataset into subsets."
#     },
#     "Q2": {
#       "i": "Supervised learning uses labeled data to train models for prediction tasks, while unsupervised learning finds patterns in unlabeled data without predefined outcomes."
#     }
#   }
# }


# *Example 6: Common Error Cases (DO NOT split these)*

# Input Text:

# Student Index: EG/2020/1234
# Module: CS3050
# Year: 2025, June

# Q2) iv) List the main functions of an operating system:
# Load programs into memory
# Exit applications safely
# Open files and directories
# Close network connections
# Manage system resources
# Schedule processes

# Q3) What are the types of networks?
# LAN - Local Area Network
# WAN - Wide Area Network  
# MAN - Metropolitan Area Network
# PAN - Personal Area Network


# Output:
# json
# {
#   "metadata": {
#     "student_index": "EG/2020/1234",
#     "module_code": "CS3050",
#     "exam_year": 2025,
#     "exam_month": "June"
#   },
#   "answers": {
#     "Q2": {
#       "iv": "Load programs into memory\nExit applications safely\nOpen files and directories\nClose network connections\nManage system resources\nSchedule processes"
#     },
#     "Q3": "LAN - Local Area Network\nWAN - Wide Area Network\nMAN - Metropolitan Area Network\nPAN - Personal Area Network"
#   }
# }


# *Example 7: Complex Hierarchy with Multiple Levels (Method 1)*

# Input Text:

# Student ID: EG/2023/5678
# Module: CS4050
# June 2025 Final Exam

# Q1) Database Design

# Q1) i) a) What is database normalization?
# Database normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.

# Q1) i) b) List the first three normal forms:
# 1NF - First Normal Form
# 2NF - Second Normal Form  
# 3NF - Third Normal Form

# Q1) ii) Entity-Relationship Modeling

# Q1) ii) a) Define an entity.
# An entity is a distinguishable object or concept that can be uniquely identified and about which information is stored.

# Q1) ii) b) What is a relationship?
# A relationship represents an association between two or more entities in a database model.

# Q2) SQL Queries

# Q2) i) Write a SELECT statement to find all customers from London.
# SELECT * FROM customers WHERE city = 'London';

# Q2) ii) Explain the difference between INNER JOIN and LEFT JOIN.
# INNER JOIN returns only matching records from both tables, while LEFT JOIN returns all records from the left table and matching records from the right table.


# Output:
# json
# {
#   "metadata": {
#     "student_index": "EG/2023/5678",
#     "module_code": "CS4050",
#     "exam_year": 2025,
#     "exam_month": "June"
#   },
#   "answers": {
#     "Q1": {
#       "i": {
#         "a": "Database normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.",
#         "b": "1NF - First Normal Form\n2NF - Second Normal Form\n3NF - Third Normal Form"
#       },
#       "ii": {
#         "a": "An entity is a distinguishable object or concept that can be uniquely identified and about which information is stored.",
#         "b": "A relationship represents an association between two or more entities in a database model."
#       }
#     },
#     "Q2": {
#       "i": "SELECT * FROM customers WHERE city = 'London';",
#       "ii": "INNER JOIN returns only matching records from both tables, while LEFT JOIN returns all records from the left table and matching records from the right table."
#     }
#   }
# }


# *Example 8: Complex Hierarchy with Method 2 Numbering*

# Input Text:

# Student: EG/2025/9999
# Module: EE7050
# June 2025 Exam

# Q1) Control Systems

# Q1) a) i) What is a control system?
# A control system manages and regulates the behavior of other devices or systems using control loops.

# Q1) a) ii) Types of control systems:
# 1) Open-loop control system
# 2) Closed-loop control system

# Q1) b) i) Define feedback.
# Feedback is the process of taking a portion of the output and feeding it back to the input.

# Q1) b) ii) What is stability in control systems?
# Stability refers to the ability of a control system to produce a bounded output for a bounded input.

# Q2) a) Transfer functions
# A transfer function is the ratio of the output to input of a system in the Laplace domain.

# Q2) b) i) What is the characteristic equation?
# The characteristic equation is obtained by setting the denominator of the transfer function equal to zero.

# Q2) b) ii) How do you determine system stability?
# System stability is determined by analyzing the roots of the characteristic equation or using stability criteria like Routh-Hurwitz.


# Output:
# json
# {
#   "metadata": {
#     "student_index": "EG/2025/9999",
#     "module_code": "EE7050",
#     "exam_year": 2025,
#     "exam_month": "June"
#   },
#   "answers": {
#     "Q1": {
#       "a": {
#         "i": "A control system manages and regulates the behavior of other devices or systems using control loops.",
#         "ii": "1) Open-loop control system\n2) Closed-loop control system"
#       },
#       "b": {
#         "i": "Feedback is the process of taking a portion of the output and feeding it back to the input.",
#         "ii": "Stability refers to the ability of a control system to produce a bounded output for a bounded input."
#       }
#     },
#     "Q2": {
#       "a": "A transfer function is the ratio of the output to input of a system in the Laplace domain.",
#       "b": {
#         "i": "The characteristic equation is obtained by setting the denominator of the transfer function equal to zero.",
#         "ii": "System stability is determined by analyzing the roots of the characteristic equation or using stability criteria like Routh-Hurwitz."
#       }
#     }
#   }
# }


# *Example 9: Inconsistent Formatting - Handle Gracefully*

# Input Text:

# Student: EG/2024/9012
# Module: EE5050  
# Exam Period: June 2025

# Q1)i)Define artificial intelligence
# AI is the simulation of human intelligence in machines that are programmed to think and learn like humans.

# Q1) ii )List 3 AI applications
# 1. Speech recognition
# 2. Image processing  
# 3. Expert systems

# Q2)What is machine learning?
# Machine learning is a subset of AI that provides systems the ability to learn from data without being explicitly programmed.

# Q3) i) Neural networks
# Q3) i) a) Basic structure
# Neural networks consist of input layer, hidden layers, and output layer with interconnected nodes.

# Q3)i)b)Activation functions
# Common activation functions include sigmoid, ReLU, and tanh which introduce non-linearity.


# Output:
# json
# {
#   "metadata": {
#     "student_index": "EG/2024/9012",
#     "module_code": "EE5050",
#     "exam_year": 2025,
#     "exam_month": "June"
#   },
#   "answers": {
#     "Q1": {
#       "i": "AI is the simulation of human intelligence in machines that are programmed to think and learn like humans.",
#       "ii": "1. Speech recognition\n2. Image processing\n3. Expert systems"
#     },
#     "Q2": "Machine learning is a subset of AI that provides systems the ability to learn from data without being explicitly programmed.",
#     "Q3": {
#       "i": {
#         "a": "Neural networks consist of input layer, hidden layers, and output layer with interconnected nodes.",
#         "b": "Common activation functions include sigmoid, ReLU, and tanh which introduce non-linearity."
#       }
#     }
#   }
# }


# *Example 10: Empty and Partial Answers*

# Input Text:

# Student Index: EG/2025/3456
# Module Code: CS6050
# 2025 June Exam

# Q1) i) What is cloud computing?
# Cloud computing is the delivery of computing services over the internet including storage, processing, and software.

# Q1) ii) List benefits of cloud computing.

# Q2) i) Define big data.

# Q2) ii) What are the 4 Vs of big data?
# Volume, Velocity, Variety, Veracity

# Q3) Explain data mining.
# Data mining is the process of discovering patterns and knowledge from large datasets.


# Output:
# json
# {
#   "metadata": {
#     "student_index": "EG/2025/3456",
#     "module_code": "CS6050",
#     "exam_year": 2025,
#     "exam_month": "June"
#   },
#   "answers": {
#     "Q1": {
#       "i": "Cloud computing is the delivery of computing services over the internet including storage, processing, and software.",
#       "ii": ""
#     },
#     "Q2": {
#       "i": "",
#       "ii": "Volume, Velocity, Variety, Veracity"
#     },
#     "Q3": "Data mining is the process of discovering patterns and knowledge from large datasets."
#   }
# }


# *Example 11: Mathematical and Technical Content*

# Input Text:

# Student: EG/2025/7890
# Module: EE6500
# June 2025 Examination

# Q1) i) State Ohm's Law.
# V = I × R, where V is voltage, I is current, and R is resistance.

# Q1) ii) Calculate current when V=12V and R=4Ω.
# I = V/R = 12/4 = 3A

# Q2) i) a) What is a transistor?
# A transistor is a semiconductor device used to amplify or switch electronic signals.

# Q2) i) b) Types of transistors:
# 1) BJT (Bipolar Junction Transistor)
# 2) FET (Field Effect Transistor) 

# Q2) ii) Draw the symbol for NPN transistor.
# [Student drew a circuit symbol - represented as text]
# NPN transistor symbol with collector, base, and emitter terminals.


# Output:
# json
# {
#   "metadata": {
#     "student_index": "EG/2025/7890",
#     "module_code": "EE6500",
#     "exam_year": 2025,
#     "exam_month": "June"
#   },
#   "answers": {
#     "Q1": {
#       "i": "V = I × R, where V is voltage, I is current, and R is resistance.",
#       "ii": "I = V/R = 12/4 = 3A"
#     },
#     "Q2": {
#       "i": {
#         "a": "A transistor is a semiconductor device used to amplify or switch electronic signals.",
#         "b": "1) BJT (Bipolar Junction Transistor)\n2) FET (Field Effect Transistor)"
#       },
#       "ii": "NPN transistor symbol with collector, base, and emitter terminals."
#     }
#   }
# }


# ---

# ### Output Format (Strict JSON Only)

# Return the result using *only valid JSON*, following the structure shown in the examples above.

# ---

# ### Important Rules:

# - *SUPPORT BOTH NUMBERING METHODS* flexibly - the system should automatically detect which method is being used
# - *DO NOT split bullet points or list items* (e.g., "Load", "Exit", "Open", "Close") into sub-questions unless they are clearly labeled with (a), b), 1), 2), etc.
# - *If multiple lines appear under the same sub-question*, group all content as a single string with newline characters (\\n).
# - *Treat bullet points, dashes, or simple lists as part of the same answer* unless new question numbering appears.
# - *For essay-type responses*, preserve paragraph structure using \\n\\n for paragraph breaks.
# - *Handle inconsistent formatting gracefully* - focus on question numbers rather than spacing.
# - *Empty answers should be represented as empty strings* "".
# - *Mathematical expressions and formulas* should be preserved exactly as written.
# - *DO NOT return markdown or explanation* — only the JSON object.
# - *Use nested structure to match question hierarchy exactly*.
# - *If a question has no sub-parts, use a string directly*.
# - *Trim unnecessary whitespace* but preserve meaningful line breaks.
# - **Begin output with { and end with }**.
# - *Preserve the original content structure* - don't artificially split content that belongs together.
# - *Automatically detect and adapt to the numbering method used* in the exam script.

# ---

# ### Numbering Method Detection:

# The system should automatically detect which numbering method is being used:

# - **Method 1**: Q1 → i, ii, iii → a, b, c → 1), 2), 3)
# - **Method 2**: Q1 → a, b, c → i, ii, iii → 1), 2), 3)

# Look for patterns in the document to determine which method is being used, and structure the JSON accordingly.

# ---

# ### Common Mistakes to Avoid:

# 1. ❌ *Over-splitting*: Turning "Load\\nExit\\nOpen\\nClose" into separate sub-questions when they're just list items
# 2. ❌ *Creating artificial hierarchy* where none exists in the original
# 3. ❌ *Losing paragraph structure* in essay answers
# 4. ❌ *Adding extra nesting levels* not present in the original question structure
# 5. ❌ *Treating every new line as a new sub-question* instead of preserving content flow
# 6. ❌ *Inconsistent empty answer handling* - always use empty strings ""
# 7. ❌ *Breaking mathematical expressions* across multiple fields
# 8. ❌ *Ignoring question hierarchy* when formatting is inconsistent
# 9. ❌ *Not recognizing different numbering methods* and forcing a single format

# ### ✅ *Correct Approach:*
# - *Keep related content together* as demonstrated in the examples
# - *Follow the question numbering system* exactly as written
# - *Preserve meaningful structure* while avoiding artificial splits
# - *Handle formatting inconsistencies* by focusing on content and numbering
# - *Maintain empty answers* as empty strings within the proper hierarchy
# - *Group list items* under single answers unless explicitly sub-labeled
# - *Automatically detect and adapt* to the numbering method used in the document
# - *Support both Method 1 (Q→i,ii→a,b→1,2) and Method 2 (Q→a,b→i,ii→1,2)* numbering systems
# """

EXTRACT_STUDENT_ANSWERS_PROMPT = """
You will receive the full text content of a student's typed or handwritten exam script.

---

### Your Tasks:

1. Extract Exam Metadata (ONLY ONCE)

From the top section of the document, extract:
- "student_index" (e.g., "EG/2020/4247")
- "module_code" (e.g., "EE6250")
- "exam_year" (e.g., 2025)
- "exam_month" (e.g., "June")

Return these inside a "metadata" field.

---

2. Extract Answers with Correct Question Hierarchy (Avoid Over-Splitting)

Extract all answers exactly following the hierarchical structure used in the answer script. The system supports TWO numbering methods:

*Method 1 (Original):*
- Main questions: Q1, Q2, Q3, ...
- Sub-questions: i, ii, iii, ...
- Sub-sub-questions: a, b, c, ...
- Sub-sub-sub-questions: 1), 2), 3), ...

*Method 2 (New):*
- Main questions: Q1, Q2, Q3, ...
- Sub-questions: a, b, c, ...
- Sub-sub-questions: i, ii, iii, ...
- Sub-sub-sub-questions: 1), 2), 3), ...

Make sure to preserve:
- Main questions: Q1, Q2, Q3, ...
- Sub-questions: i, ii, iii, ... OR a, b, c, ...
- Sub-sub-questions: a, b, c, ... OR i, ii, iii, ...
- Sub-sub-sub-questions: 1), 2), 3), ...

Treat each change in question number as a new section, even if the formatting is inconsistent or spacing is irregular.

⚠️ **Important Update: Question Number Recognition (covers the missing cases)**

- Recognize **both inline and standalone numbering**:
  - Inline example: `Q1) i) Define AI. AI is the simulation...`
  - Standalone example:
    ```
    Q1) i) Define AI.
    AI is the simulation...
    ```
- Support **Word-style numbering formats** in addition to Q-based numbering:
  - Main Questions: `Q1`, `1.`, `1)`, `(1)`
  - Sub-questions: `a)`, `a.`, `(a)`, `i)`, `i.`, `(i)`
  - Sub-sub-questions: `1)`, `1.`, `(1)`
- Accept numbering with/without spaces and with inconsistent punctuation (e.g., `Q1)i)`, `Q1)  i)`, `1 .`, `a )`).
- If question number and answer text appear on the same line, the parser must still identify the label and capture the remaining text as the answer for that label.
- Treat any change in numbering format (e.g., from `Q1` to `1.` or from `i)` to `a.`) as a new question/sub-question boundary.

---

### COMPREHENSIVE EXAMPLES:

(Examples preserved exactly as reference cases — the extractor should reproduce outputs in the same structure shown below.)

Example 1: Short Answers with Clear Structure (Method 1)

Input Text:

Student Index: EG/2020/4247
Module: EE6250
Year: 2025, June

Q1) i) Define machine learning.
Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.

Q1) ii) What is overfitting?
Overfitting occurs when a model learns the training data too well, including noise and outliers, leading to poor performance on new data.

Q2) List three types of machine learning.
Supervised learning
Unsupervised learning
Reinforcement learning


Output:
json
{
  "metadata": {
    "student_index": "EG/2020/4247",
    "module_code": "EE6250",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": "Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.",
      "ii": "Overfitting occurs when a model learns the training data too well, including noise and outliers, leading to poor performance on new data."
    },
    "Q2": "Supervised learning\nUnsupervised learning\nReinforcement learning"
  }
}


Example 2: Method 2 Numbering System

Input Text:

Student Index: EG/2023/1234
Module: CS4050
Year: 2025, June

Q1) a) What is object-oriented programming?
Object-oriented programming is a programming paradigm based on the concept of objects, which contain data and code.

Q1) b) i) Define encapsulation.
Encapsulation is the bundling of data and methods that operate on that data within a single unit or object.

Q1) b) ii) Give an example of encapsulation.
A class with private variables and public methods to access them, like a BankAccount class with private balance and public deposit/withdraw methods.

Q2) a) List the four pillars of OOP.
Encapsulation
Inheritance
Polymorphism
Abstraction

Q2) b) Explain inheritance.
Inheritance allows a class to inherit properties and methods from another class, promoting code reusability.


Output:
json
{
  "metadata": {
    "student_index": "EG/2023/1234",
    "module_code": "CS4050",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "a": "Object-oriented programming is a programming paradigm based on the concept of objects, which contain data and code.",
      "b": {
        "i": "Encapsulation is the bundling of data and methods that operate on that data within a single unit or object.",
        "ii": "A class with private variables and public methods to access them, like a BankAccount class with private balance and public deposit/withdraw methods."
      }
    },
    "Q2": {
      "a": "Encapsulation\nInheritance\nPolymorphism\nAbstraction",
      "b": "Inheritance allows a class to inherit properties and methods from another class, promoting code reusability."
    }
  }
}


Example 3: List-Type Questions with Mixed Formatting (Method 1)

Input Text:

Student: EG/2021/3456
Module Code: CS5050
Exam: 2025 June

Q1) i) List the advantages of cloud computing:
- Scalability
- Cost-effectiveness  
- Accessibility
- Automatic updates

Q1) ii) a) What is SaaS?
Software as a Service (SaaS) is a cloud computing model where software applications are provided over the internet.

Q1) ii) b) Give two examples of SaaS.
Gmail
Salesforce

Q2) Explain the OSI model layers:
Physical layer - handles physical transmission
Data link layer - manages node-to-node delivery
Network layer - handles routing
Transport layer - ensures reliable delivery


Output:
json
{
  "metadata": {
    "student_index": "EG/2021/3456",
    "module_code": "CS5050",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": "- Scalability\n- Cost-effectiveness\n- Accessibility\n- Automatic updates",
      "ii": {
        "a": "Software as a Service (SaaS) is a cloud computing model where software applications are provided over the internet.",
        "b": "Gmail\nSalesforce"
      }
    },
    "Q2": "Physical layer - handles physical transmission\nData link layer - manages node-to-node delivery\nNetwork layer - handles routing\nTransport layer - ensures reliable delivery"
  }
}


Example 4: Mixed Numbering Systems in Same Document

Input Text:

Student: EG/2024/5678
Module: EE5500
June 2025 Final

Q1) a) What is digital signal processing?
Digital signal processing is the use of digital processing to perform operations on signals.

Q1) b) i) Define sampling rate.
Sampling rate is the number of samples taken per second from a continuous signal.

Q1) b) ii) What is the Nyquist theorem?
The Nyquist theorem states that the sampling rate must be at least twice the highest frequency component.

Q2) i) List types of filters:
Low-pass filter
High-pass filter
Band-pass filter
Band-stop filter

Q2) ii) a) What is impulse response?
Impulse response is the output of a system when presented with a unit impulse input.

Q2) ii) b) Define frequency response.
Frequency response describes how a system responds to sinusoidal inputs at different frequencies.


Output:
json
{
  "metadata": {
    "student_index": "EG/2024/5678",
    "module_code": "EE5500",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "a": "Digital signal processing is the use of digital processing to perform operations on signals.",
      "b": {
        "i": "Sampling rate is the number of samples taken per second from a continuous signal.",
        "ii": "The Nyquist theorem states that the sampling rate must be at least twice the highest frequency component."
      }
    },
    "Q2": {
      "i": "Low-pass filter\nHigh-pass filter\nBand-pass filter\nBand-stop filter",
      "ii": {
        "a": "Impulse response is the output of a system when presented with a unit impulse input.",
        "b": "Frequency response describes how a system responds to sinusoidal inputs at different frequencies."
      }
    }
  }
}


Example 5: Essay Response with Sub-Questions (Method 1)

Input Text:

Index: EG/2022/7890
Module: EE6250
2025 June Examination

Q1) i) Discuss the importance of data preprocessing in machine learning. (10 marks)

Data preprocessing is a crucial step in machine learning that involves cleaning, transforming, and organizing raw data before feeding it to machine learning algorithms. 

The importance of data preprocessing can be understood through several key aspects:

1. Data Quality: Raw data often contains errors, missing values, and inconsistencies that can significantly impact model performance.

2. Feature Engineering: Preprocessing allows us to create new features or transform existing ones to better represent the underlying patterns.

3. Normalization: Different features may have different scales, and preprocessing helps normalize these to prevent bias toward features with larger values.

Without proper preprocessing, even the most sophisticated algorithms may fail to produce accurate results.

Q1) ii) What is cross-validation?
Cross-validation is a technique used to assess how well a machine learning model will generalize to unseen data by partitioning the dataset into subsets.

Q2) i) Compare supervised and unsupervised learning.
Supervised learning uses labeled data to train models for prediction tasks, while unsupervised learning finds patterns in unlabeled data without predefined outcomes.


Output:
json
{
  "metadata": {
    "student_index": "EG/2022/7890",
    "module_code": "EE6250",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": "Data preprocessing is a crucial step in machine learning that involves cleaning, transforming, and organizing raw data before feeding it to machine learning algorithms.\n\nThe importance of data preprocessing can be understood through several key aspects:\n\n1. Data Quality: Raw data often contains errors, missing values, and inconsistencies that can significantly impact model performance.\n\n2. Feature Engineering: Preprocessing allows us to create new features or transform existing ones to better represent the underlying patterns.\n\n3. Normalization: Different features may have different scales, and preprocessing helps normalize these to prevent bias toward features with larger values.\n\nWithout proper preprocessing, even the most sophisticated algorithms may fail to produce accurate results.",
      "ii": "Cross-validation is a technique used to assess how well a machine learning model will generalize to unseen data by partitioning the dataset into subsets."
    },
    "Q2": {
      "i": "Supervised learning uses labeled data to train models for prediction tasks, while unsupervised learning finds patterns in unlabeled data without predefined outcomes."
    }
  }
}


Example 6: Common Error Cases (DO NOT split these)

Input Text:

Student Index: EG/2020/1234
Module: CS3050
Year: 2025, June

Q2) iv) List the main functions of an operating system:
Load programs into memory
Exit applications safely
Open files and directories
Close network connections
Manage system resources
Schedule processes

Q3) What are the types of networks?
LAN - Local Area Network
WAN - Wide Area Network  
MAN - Metropolitan Area Network
PAN - Personal Area Network


Output:
json
{
  "metadata": {
    "student_index": "EG/2020/1234",
    "module_code": "CS3050",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q2": {
      "iv": "Load programs into memory\nExit applications safely\nOpen files and directories\nClose network connections\nManage system resources\nSchedule processes"
    },
    "Q3": "LAN - Local Area Network\nWAN - Wide Area Network\nMAN - Metropolitan Area Network\nPAN - Personal Area Network"
  }
}


Example 7: Complex Hierarchy with Multiple Levels (Method 1)

Input Text:

Student ID: EG/2023/5678
Module: CS4050
June 2025 Final Exam

Q1) Database Design

Q1) i) a) What is database normalization?
Database normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.

Q1) i) b) List the first three normal forms:
1NF - First Normal Form
2NF - Second Normal Form  
3NF - Third Normal Form

Q1) ii) Entity-Relationship Modeling

Q1) ii) a) Define an entity.
An entity is a distinguishable object or concept that can be uniquely identified and about which information is stored.

Q1) ii) b) What is a relationship?
A relationship represents an association between two or more entities in a database model.

Q2) SQL Queries

Q2) i) Write a SELECT statement to find all customers from London.
SELECT * FROM customers WHERE city = 'London';

Q2) ii) Explain the difference between INNER JOIN and LEFT JOIN.
INNER JOIN returns only matching records from both tables, while LEFT JOIN returns all records from the left table and matching records from the right table.


Output:
json
{
  "metadata": {
    "student_index": "EG/2023/5678",
    "module_code": "CS4050",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": {
        "a": "Database normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.",
        "b": "1NF - First Normal Form\n2NF - Second Normal Form\n3NF - Third Normal Form"
      },
      "ii": {
        "a": "An entity is a distinguishable object or concept that can be uniquely identified and about which information is stored.",
        "b": "A relationship represents an association between two or more entities in a database model."
      }
    },
    "Q2": {
      "i": "SELECT * FROM customers WHERE city = 'London';",
      "ii": "INNER JOIN returns only matching records from both tables, while LEFT JOIN returns all records from the left table and matching records from the right table."
    }
  }
}


Example 8: Complex Hierarchy with Method 2 Numbering

Input Text:

Student: EG/2025/9999
Module: EE7050
June 2025 Exam

Q1) Control Systems

Q1) a) i) What is a control system?
A control system manages and regulates the behavior of other devices or systems using control loops.

Q1) a) ii) Types of control systems:
1) Open-loop control system
2) Closed-loop control system

Q1) b) i) Define feedback.
Feedback is the process of taking a portion of the output and feeding it back to the input.

Q1) b) ii) What is stability in control systems?
Stability refers to the ability of a control system to produce a bounded output for a bounded input.

Q2) a) Transfer functions
A transfer function is the ratio of the output to input of a system in the Laplace domain.

Q2) b) i) What is the characteristic equation?
The characteristic equation is obtained by setting the denominator of the transfer function equal to zero.

Q2) b) ii) How do you determine system stability?
System stability is determined by analyzing the roots of the characteristic equation or using stability criteria like Routh-Hurwitz.


Output:
json
{
  "metadata": {
    "student_index": "EG/2025/9999",
    "module_code": "EE7050",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "a": {
        "i": "A control system manages and regulates the behavior of other devices or systems using control loops.",
        "ii": "1) Open-loop control system\n2) Closed-loop control system"
      },
      "b": {
        "i": "Feedback is the process of taking a portion of the output and feeding it back to the input.",
        "ii": "Stability refers to the ability of a control system to produce a bounded output for a bounded input."
      }
    },
    "Q2": {
      "a": "A transfer function is the ratio of the output to input of a system in the Laplace domain.",
      "b": {
        "i": "The characteristic equation is obtained by setting the denominator of the transfer function equal to zero.",
        "ii": "System stability is determined by analyzing the roots of the characteristic equation or using stability criteria like Routh-Hurwitz."
      }
    }
  }
}


Example 9: Inconsistent Formatting - Handle Gracefully

Input Text:

Student: EG/2024/9012
Module: EE5050  
Exam Period: June 2025

Q1)i)Define artificial intelligence
AI is the simulation of human intelligence in machines that are programmed to think and learn like humans.

Q1) ii )List 3 AI applications
1. Speech recognition
2. Image processing  
3. Expert systems

Q2)What is machine learning?
Machine learning is a subset of AI that provides systems the ability to learn from data without being explicitly programmed.

Q3) i) Neural networks
Q3) i) a) Basic structure
Neural networks consist of input layer, hidden layers, and output layer with interconnected nodes.

Q3)i)b)Activation functions
Common activation functions include sigmoid, ReLU, and tanh which introduce non-linearity.


Output:
json
{
  "metadata": {
    "student_index": "EG/2024/9012",
    "module_code": "EE5050",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": "AI is the simulation of human intelligence in machines that are programmed to think and learn like humans.",
      "ii": "1. Speech recognition\n2. Image processing\n3. Expert systems"
    },
    "Q2": "Machine learning is a subset of AI that provides systems the ability to learn from data without being explicitly programmed.",
    "Q3": {
      "i": {
        "a": "Neural networks consist of input layer, hidden layers, and output layer with interconnected nodes.",
        "b": "Common activation functions include sigmoid, ReLU, and tanh which introduce non-linearity."
      }
    }
  }
}


Example 10: Empty and Partial Answers

Input Text:

Student Index: EG/2025/3456
Module Code: CS6050
2025 June Exam

Q1) i) What is cloud computing?
Cloud computing is the delivery of computing services over the internet including storage, processing, and software.

Q1) ii) List benefits of cloud computing.

Q2) i) Define big data.

Q2) ii) What are the 4 Vs of big data?
Volume, Velocity, Variety, Veracity

Q3) Explain data mining.
Data mining is the process of discovering patterns and knowledge from large datasets.


Output:
json
{
  "metadata": {
    "student_index": "EG/2025/3456",
    "module_code": "CS6050",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": "Cloud computing is the delivery of computing services over the internet including storage, processing, and software.",
      "ii": ""
    },
    "Q2": {
      "i": "",
      "ii": "Volume, Velocity, Variety, Veracity"
    },
    "Q3": "Data mining is the process of discovering patterns and knowledge from large datasets."
  }
}


Example 11: Mathematical and Technical Content

Input Text:

Student: EG/2025/7890
Module: EE6500
June 2025 Examination

Q1) i) State Ohm's Law.
V = I × R, where V is voltage, I is current, and R is resistance.

Q1) ii) Calculate current when V=12V and R=4Ω.
I = V/R = 12/4 = 3A

Q2) i) a) What is a transistor?
A transistor is a semiconductor device used to amplify or switch electronic signals.

Q2) i) b) Types of transistors:
1) BJT (Bipolar Junction Transistor)
2) FET (Field Effect Transistor) 

Q2) ii) Draw the symbol for NPN transistor.
[Student drew a circuit symbol - represented as text]
NPN transistor symbol with collector, base, and emitter terminals.


Output:
json
{
  "metadata": {
    "student_index": "EG/2025/7890",
    "module_code": "EE6500",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": "V = I × R, where V is voltage, I is current, and R is resistance.",
      "ii": "I = V/R = 12/4 = 3A"
    },
    "Q2": {
      "i": {
        "a": "A transistor is a semiconductor device used to amplify or switch electronic signals.",
        "b": "1) BJT (Bipolar Junction Transistor)\n2) FET (Field Effect Transistor)"
      },
      "ii": "NPN transistor symbol with collector, base, and emitter terminals."
    }
  }
}

---

### Output Format (Strict JSON Only)

Return the result using only valid JSON, following the structure shown in the examples above.

---

### Important Rules:

- SUPPORT BOTH NUMBERING METHODS flexibly - the system should automatically detect which method is being used
- DO NOT split bullet points or list items (e.g., "Load", "Exit", "Open", "Close") into sub-questions unless they are clearly labeled with (a), b), 1), 2), etc.
- If multiple lines appear under the same sub-question, group all content as a single string with newline characters (\\n).
- Treat bullet points, dashes, or simple lists as part of the same answer unless new question numbering appears.
- For essay-type responses, preserve paragraph structure using \\n\\n for paragraph breaks.
- Handle inconsistent formatting gracefully - focus on question numbers rather than spacing.
- Empty answers should be represented as empty strings "".
- Mathematical expressions and formulas should be preserved exactly as written.
- DO NOT return markdown or explanation — only the JSON object.
- Use nested structure to match question hierarchy exactly.
- If a question has no sub-parts, use a string directly.
- Trim unnecessary whitespace but preserve meaningful line breaks.
- *Begin output with { and end with }*.
- Preserve the original content structure - don't artificially split content that belongs together.
- Automatically detect and adapt to the numbering method used in the exam script.
- Accept Word-style numbering and inline question+answer cases as described above.

---

### Numbering Method Detection:

The system should automatically detect which numbering method is being used:

- *Method 1*: Q1 → i, ii, iii → a, b, c → 1), 2), 3)
- *Method 2*: Q1 → a, b, c → i, ii, iii → 1), 2), 3)

Additionally, accept **Word-style equivalents**:
- Main: `1.`, `1)`, `(1)`
- Sub: `a.`, `a)`, `(a)`, `i.`, `i)`, `(i)`
- Sub-sub: `1.`, `1)`, `(1)`

Look for patterns (with or without parentheses/dots/brackets) and choose the structure that best matches the majority of labeled items in the document. If inline labels (label + answer text on the same line) appear, parse them the same as if they were on separate lines.

---

### Common Mistakes to Avoid:

1. ❌ Over-splitting: Turning "Load\\nExit\\nOpen\\nClose" into separate sub-questions when they're just list items
2. ❌ Creating artificial hierarchy where none exists in the original
3. ❌ Losing paragraph structure in essay answers
4. ❌ Adding extra nesting levels not present in the original question structure
5. ❌ Treating every new line as a new sub-question instead of preserving content flow
6. ❌ Inconsistent empty answer handling - always use empty strings ""
7. ❌ Breaking mathematical expressions across multiple fields
8. ❌ Ignoring question hierarchy when formatting is inconsistent
9. ❌ Not recognizing different numbering methods and forcing a single format
10. ❌ Missing Word-style numbering formats such as `1.`, `(i)`, `a.` or inline label+answer lines

### ✅ Correct Approach:
- Keep related content together as demonstrated in the examples
- Follow the question numbering system exactly as written
- Preserve meaningful structure while avoiding artificial splits
- Handle formatting inconsistencies by focusing on content and numbering
- Maintain empty answers as empty strings within the proper hierarchy
- Group list items under single answers unless explicitly sub-labeled
- Automatically detect and adapt to the numbering method used in the exam script
- Support both Method 1 (Q→i,ii→a,b→1,2) and Method 2 (Q→a,b→i,ii→1,2) numbering systems
- Recognize Word-style numbering and inline question+answer lines

"""
