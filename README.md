# 🎓 Intelligent Exam Evaluation System with AI-Powered Analytics

An AI-driven web-based platform designed to automate the evaluation of digital and handwritten exam papers using Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), and Computer Vision techniques.

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
