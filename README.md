# 🎓 Intelligent Exam Evaluation System with AI-Powered Analytics

An AI-driven web-based platform designed to automate the evaluation of digital and handwritten exam papers using Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), and Computer Vision techniques.

------------------------------------------------------------------------

# 📌 Overview

Manual exam grading is time-consuming, inconsistent, and prone to bias. This project introduces a unified, scalable, and AI-powered automated grading framework capable of evaluating:

* Short Answers
* List-type Answers
* Essay-type Answers
* Mathematical Equations
* Tables
* Diagrams
* Graphs
* Handwritten Scripts
* Multiple Choice Questions (MCQs)

The system ensures fairness, consistency, efficiency, and analytical insights while reducing examiner workload.

------------------------------------------------------------------------

# 🚀 Key Features

## ✅ Multi-Format Exam Evaluation
* Supports PDF, Word, Excel, and handwritten documents
* Automatic evaluation of both digital and scanned scripts

## ✅ Handwritten Text Recognition
* Uses Transformer-based Optical Character Recognition (TrOCR)
* Converts handwritten answers into digital text for grading

## ✅ LLM-Based Grading Engine
Integrated and benchmarked with:
* OpenAI GPT models
* Google Gemini
* Anthropic Claude
* DeepSeek (including fine-tuned model)

Few-shot prompting at temperature 0.0 provides stable and consistent grading.

## ✅ Retrieval-Augmented Generation (RAG)
* Contextual grounding using:
   * Lecture materials
   * Model answers
   * Rubrics
* Stored in a PostgreSQL Vector Database (PgVector)

## ✅ Embedding-Based Semantic Matching
* Student answers
* Model answers
* Lecture materials

Converted into embeddings for semantic comparison.

## ✅ Bubble Sheet Recognition
* Automatic MCQ bubble detection
* Image preprocessing and answer extraction

## ✅ Educator Dashboard
* Question-wise analysis
* Performance trends
* Student-level analytics
* Manual review & grade adjustment option

## ✅ Admin Panel
* User management
* Model configuration
* Pricing plan management
* Grading model customization

------------------------------------------------------------------------

# 🏗️ System Architecture

The system consists of:

1. **Frontend (Web Application)**
   * Role-based access control
   * Educator, Student, Admin dashboards

2. **Backend**
   * REST APIs
   * JWT Authentication
   * ORM integration

3. **AI Pipeline**
   * Document preprocessing
   * OCR (TrOCR)
   * Embedding generation
   * Vector search (PgVector)
   * RAG-enhanced LLM grading
   * Result aggregation & analytics

------------------------------------------------------------------------

# 🧠 Core Technologies

## 🔹 Artificial Intelligence
* Large Language Models (LLMs)
* Retrieval-Augmented Generation (RAG)
* Few-shot Prompt Engineering
* Fine-Tuning (DeepSeek)

## 🔹 NLP & Embeddings
* OpenAI Embeddings
* Semantic similarity matching
* Contextual grading

## 🔹 Computer Vision
* TrOCR (Transformer-based OCR)
* Image preprocessing (CLAHE, filtering)
* Bubble sheet detection

## 🔹 Database
* PostgreSQL
* PgVector Extension
* Relational + Vector storage

## 🔹 Security
* JWT Authentication
* Role-Based Access Control
* TLS support

------------------------------------------------------------------------

# 📊 Experimental Results

The system was benchmarked under controlled temperature settings (0.0 and 0.2).

## 🔹 Text-Based Evaluation
* Short Answers – 72% accuracy (Gemini)
* List-type Answers – 80% accuracy (OpenAI)
* Essays – 60% accuracy (Claude)

## 🔹 Equation Evaluation
* Best accuracy: 63.43% (OpenAI)

## 🔹 Diagram Evaluation
* Highest correlation: r = 0.784 (Claude)

## 🔹 Graph Evaluation
* Highest correlation: r = 0.787 (Gemini)

## 🔹 Multi-Format Script Evaluation
* ±10% tolerance accuracy: 67.67% (Gemini)

## 🔹 Real Paper Evaluation (Database Domain)
* Highest correlation: 0.763 (Claude)

------------------------------------------------------------------------

# 📈 Fairness & Reliability

* Temperature sensitivity analysis performed
* Few-shot prompting improves grading stability
* Tolerance-based evaluation increases robustness
* Fairness analysis conducted to reduce bias
