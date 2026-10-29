"""Curated Fallback Catalogue for LaunchLoop AI Project Magnet.

Contains at least 15 comprehensive, high-quality engineering project blueprints
calibrated specifically for students attending 'Build Your First AI Project in 60 Minutes'.
Guarantees responsive zero-downtime service even when external LLM APIs are offline.
"""

from typing import List, Dict
from app.schemas.magnet import ProjectRecommendation, SkillLevel

# 15+ Verified, realistic, curriculum-tested engineering AI projects
FALLBACK_PROJECTS: List[Dict] = [
    {
        "id": "cv_posture_detector",
        "domains": ["computer vision", "healthcare", "iot"],
        "keywords": ["python", "opencv", "mediapipe", "webcam"],
        "skill_level": "beginner",
        "data": {
            "project_title": "ErgoVision: Real-Time Desk Posture Corrector",
            "problem_statement": "Prolonged desk work causes ergonomic strain and repetitive spine injuries among students and developers.",
            "project_description": "A lightweight Computer Vision prototype that uses webcam video feeds to detect spinal alignment in real time and triggers subtle desktop alerts when slouching is detected.",
            "fit_explanation": "Directly applies Computer Vision to personal health ergonomics. It lets you write immediate visual Python code without requiring expensive GPUs or massive datasets.",
            "recommended_tech_stack": ["Python 3.11", "OpenCV", "MediaPipe Pose", "Streamlit"],
            "difficulty_level": "Beginner-Friendly",
            "estimated_scope": "Build working landmark detection during the 60-min workshop; expand alert sound logic and angle calibration over the weekend.",
            "first_three_steps": [
                "Install MediaPipe and capture live webcam feed frames in a local Python script.",
                "Extract 33 3D skeletal landmarks and compute the shoulder-to-ear slouch angle.",
                "Display visual bounding boxes on screen with a color-coded posture status banner."
            ],
            "workshop_learning_outcome": "Understand real-time facial/skeletal landmark detection and run your first working Computer Vision inference loop in Python."
        }
    },
    {
        "id": "nlp_resume_ats_analyzer",
        "domains": ["natural language processing", "generative ai", "edtech"],
        "keywords": ["python", "fastapi", "hugging face", "transformers", "text"],
        "skill_level": "beginner",
        "data": {
            "project_title": "ResumeMatch AI: Campus Placement ATS Score Analyzer",
            "problem_statement": "Engineering students submit generic resumes that are filtered out by automated campus recruitment screening systems.",
            "project_description": "An NLP similarity analyzer that compares a student's resume text against target software job descriptions, highlighting keyword gaps and generating relevance scores.",
            "fit_explanation": "Directly serves your campus placement ambitions while introducing sentence embeddings, cosine similarity, and text preprocessing fundamentals.",
            "recommended_tech_stack": ["Python", "FastAPI", "Sentence-Transformers", "Scikit-Learn"],
            "difficulty_level": "Beginner",
            "estimated_scope": "Build the core text embedding and similarity calculation within 60 minutes; add PDF parsing and UI styling over a weekend.",
            "first_three_steps": [
                "Load a pre-trained sentence-transformer model (all-MiniLM-L6-v2) using Python.",
                "Compute dense vector embeddings for sample resume bullet points and job descriptions.",
                "Calculate cosine similarity scores and extract top missing technical keywords."
            ],
            "workshop_learning_outcome": "Understand semantic text embeddings, vector similarity, and how modern ATS algorithms filter technical resumes."
        }
    },
    {
        "id": "genai_doc_qa_rag",
        "domains": ["generative ai", "natural language processing", "fullstack ai"],
        "keywords": ["python", "langchain", "chromadb", "gemini", "fastapi"],
        "skill_level": "intermediate",
        "data": {
            "project_title": "SyllabusBot: Engineering Textbook QA with RAG",
            "problem_statement": "Students spend hours flipping through 800-page engineering PDF textbooks trying to locate specific exam formula explanations.",
            "project_description": "A Retrieval-Augmented Generation (RAG) assistant that indexes technical PDF textbooks and answers student questions citing exact chapters and page references.",
            "fit_explanation": "Teaches the most in-demand enterprise AI skill (RAG architecture) using your existing Python and backend foundations.",
            "recommended_tech_stack": ["Python", "ChromaDB", "LangChain Core", "Google Gemini API"],
            "difficulty_level": "Intermediate",
            "estimated_scope": "Index one textbook chapter and test query retrieval in the 60-min workshop; expand to full textbook PDF uploads later.",
            "first_three_steps": [
                "Chunk textbook markdown text into 500-token semantic passages with 50-token overlap.",
                "Store passage vectors into an in-memory ChromaDB vector store.",
                "Construct a prompt combining retrieved context passages with user query for LLM completion."
            ],
            "workshop_learning_outcome": "Master vector databases, semantic search retrieval, and grounding LLM answers against proprietary documents."
        }
    },
    {
        "id": "cv_plant_disease_scanner",
        "domains": ["computer vision", "healthcare", "data science"],
        "keywords": ["python", "pytorch", "torchvision", "opencv", "fastapi"],
        "skill_level": "beginner",
        "data": {
            "project_title": "AgriScan: Mobile Plant Foliage Disease Classifier",
            "problem_statement": "Smallholder farmers suffer severe crop loss due to delayed identification of common fungal and bacterial leaf blights.",
            "project_description": "An image classification service using a pre-trained convolutional neural network (MobileNetV2) to identify crop disease from smartphone photos.",
            "fit_explanation": "Delivers a socially meaningful engineering project with high placement interview appeal while teaching transfer learning and image classification.",
            "recommended_tech_stack": ["Python", "PyTorch", "Torchvision", "FastAPI", "Pillow"],
            "difficulty_level": "Beginner-Friendly",
            "estimated_scope": "Load pre-trained model and classify sample diseased leaf images in 60 minutes; fine-tune on custom dataset in 2 days.",
            "first_three_steps": [
                "Download 100 sample images from the PlantVillage public benchmark dataset.",
                "Implement an image transform pipeline to resize and normalize input photographs.",
                "Run inference through pre-trained MobileNetV2 and display top-3 predicted diseases."
            ],
            "workshop_learning_outcome": "Understand transfer learning, convolutional neural network inference, and image preprocessing pipelines."
        }
    },
    {
        "id": "fintech_sentiment_crypto",
        "domains": ["fintech", "data science", "natural language processing"],
        "keywords": ["python", "pandas", "nltk", "vader", "fastapi", "matplotlib"],
        "skill_level": "beginner",
        "data": {
            "project_title": "MarketPulse: Financial News Sentiment Tracker",
            "problem_statement": "Retail investors struggle to gauge market sentiment across hundreds of breaking financial news headlines every morning.",
            "project_description": "An automated sentiment analysis pipeline that ingests financial headlines via public RSS feeds, calculates polarity scores, and visualizes sentiment trends.",
            "fit_explanation": "Combines data science, API integration, and NLP into a tangible FinTech portfolio project demonstrating quantitative analysis skills.",
            "recommended_tech_stack": ["Python", "Pandas", "VADER Sentiment", "Feedparser", "FastAPI"],
            "difficulty_level": "Beginner",
            "estimated_scope": "Ingest live headlines and compute composite sentiment score in 60 minutes; add automated alerts and historical tracking later.",
            "first_three_steps": [
                "Parse top 25 financial news headlines from Google News RSS using Python feedparser.",
                "Score each headline using VADER sentiment analysis for compound positive/negative weights.",
                "Aggregate scores into an hourly market sentiment index and display summary distribution."
            ],
            "workshop_learning_outcome": "Learn rule-based NLP sentiment scoring, financial data pipelining, and data visualization."
        }
    },
    {
        "id": "cyber_phishing_detector",
        "domains": ["cybersecurity", "natural language processing", "web"],
        "keywords": ["python", "scikit-learn", "fastapi", "html", "javascript"],
        "skill_level": "intermediate",
        "data": {
            "project_title": "PhishShield: Intelligent URL & Email Fraud Detector",
            "problem_statement": "Sophisticated phishing URLs and fraudulent emails bypass traditional static keyword filters, tricking unsuspecting internet users.",
            "project_description": "A machine learning classification service that inspects lexical URL structure and email body semantics to predict phishing probability in real time.",
            "fit_explanation": "Bridges cybersecurity and machine learning, demonstrating practical security engineering highly valued by cloud and enterprise hiring teams.",
            "recommended_tech_stack": ["Python", "Scikit-Learn", "FastAPI", "Joblib", "JavaScript"],
            "difficulty_level": "Intermediate",
            "estimated_scope": "Extract 10 lexical URL features and classify test links in 60 minutes; build a browser extension UI as follow-up.",
            "first_three_steps": [
                "Extract feature vectors from URLs (domain length, special characters, entropy, IP presence).",
                "Train a lightweight Random Forest classifier on 2,000 verified legitimate and phishing URLs.",
                "Wrap the model in a FastAPI endpoint that returns a risk percentage and safety badge."
            ],
            "workshop_learning_outcome": "Understand feature engineering for unstructured text/URLs and deploy an ML model behind a clean REST API."
        }
    },
    {
        "id": "edtech_code_explainer",
        "domains": ["generative ai", "edtech", "web & fullstack ai"],
        "keywords": ["python", "fastapi", "react", "javascript", "gemini"],
        "skill_level": "beginner",
        "data": {
            "project_title": "CodeSense: Plain-English Code Logic & Complexity Explainer",
            "problem_statement": "Beginner programming students struggle to trace complex nested algorithms and time complexity when debugging code.",
            "project_description": "An interactive web assistant that accepts code snippets in any language, breaks down logic step-by-step in plain English, and calculates Big-O time complexity.",
            "fit_explanation": "Capitalizes on your interest in web development and AI, building an educational utility you and your college classmates can use immediately.",
            "recommended_tech_stack": ["Python", "FastAPI", "React", "Tailwind CSS", "Google Gemini API"],
            "difficulty_level": "Beginner-Friendly",
            "estimated_scope": "Build backend prompt orchestrator and test on sample Python functions in 60 mins; build the frontend code editor interface in 2-3 days.",
            "first_three_steps": [
                "Design a system prompt that decomposes code blocks into algorithmic steps and Big-O notation.",
                "Create a FastAPI endpoint that receives code strings and streams structured explanatory JSON.",
                "Connect a simple web form to submit Python/JavaScript code and render the explanation cards."
            ],
            "workshop_learning_outcome": "Learn prompt engineering for structured code analysis and connect modern frontend interfaces to AI APIs."
        }
    },
    {
        "id": "iot_smart_waste_sorter",
        "domains": ["iot & embedded ai", "computer vision", "data science"],
        "keywords": ["python", "opencv", "tflite", "raspberry pi", "embedded"],
        "skill_level": "intermediate",
        "data": {
            "project_title": "SortAI: Edge Camera Automated Recyclables Sorter",
            "problem_statement": "Municipal recycling facilities struggle with manual sorting errors, leading to contaminated recyclable waste streams.",
            "project_description": "A compact edge AI vision prototype that classifies waste items (plastic, organic, metal, paper) from real-time camera frames for automated bin sorting.",
            "fit_explanation": "Connects embedded electronics and computer vision, making it an outstanding final-year capstone project for ECE/EEE/CSE students.",
            "recommended_tech_stack": ["Python", "TensorFlow Lite", "OpenCV", "NumPy"],
            "difficulty_level": "Intermediate",
            "estimated_scope": "Run pre-quantized MobileNet classifier on web camera frames in 60 minutes; interface with servo motors on hardware later.",
            "first_three_steps": [
                "Download a quantized TensorFlow Lite model trained on the TrashNet benchmark dataset.",
                "Set up an OpenCV frame-capture loop that crops the central inspection region.",
                "Run edge inference in under 50ms and print the predicted waste category and confidence."
            ],
            "workshop_learning_outcome": "Understand edge AI model quantization (TFLite) and low-latency computer vision inference on constrained devices."
        }
    },
    {
        "id": "web_ai_smart_search",
        "domains": ["web & fullstack ai", "natural language processing", "generative ai"],
        "keywords": ["javascript", "react", "fastapi", "python", "embeddings"],
        "skill_level": "beginner",
        "data": {
            "project_title": "SemanticFind: Neural E-Commerce Product Search",
            "problem_statement": "Traditional keyword search fails when shoppers search by intent (e.g., 'lightweight summer outfit') rather than exact brand names.",
            "project_description": "A vector-powered product search engine that understands natural language queries and matches them semantically to a catalog of 500 items.",
            "fit_explanation": "Merges fullstack web development with vector search, showing interviewers you understand modern AI-first search architectures.",
            "recommended_tech_stack": ["Python", "FastAPI", "React", "Sentence-Transformers", "Tailwind CSS"],
            "difficulty_level": "Beginner-Friendly",
            "estimated_scope": "Vectorize a sample 50-item product CSV and perform cosine search in 60 mins; build the React search UI over the weekend.",
            "first_three_steps": [
                "Generate vector embeddings for a mock product catalog JSON file using all-MiniLM-L6-v2.",
                "Build a search endpoint that embeds the user's query and performs top-5 nearest neighbor ranking.",
                "Render product cards sorted by semantic match score with highlight badges."
            ],
            "workshop_learning_outcome": "Understand vector similarity ranking, semantic search mechanics, and embedding indexing for web apps."
        }
    },
    {
        "id": "health_xray_analyzer",
        "domains": ["healthcare ai", "computer vision", "data science"],
        "keywords": ["python", "pytorch", "opencv", "medical", "fastapi"],
        "skill_level": "intermediate",
        "data": {
            "project_title": "MediScan: Automated Chest X-Ray Screening Assistant",
            "problem_statement": "Rural diagnostic clinics face delays of 48-72 hours awaiting remote specialist radiologist reviews for urgent chest scans.",
            "project_description": "A medical computer vision prototype that evaluates digital chest radiographs, screening for signs of pneumonia and opacity with graduated confidence scores.",
            "fit_explanation": "A high-impact healthcare engineering project that demonstrates responsible AI design, precision metrics, and ethical scope framing.",
            "recommended_tech_stack": ["Python", "PyTorch", "Torchvision", "OpenCV", "FastAPI"],
            "difficulty_level": "Intermediate",
            "estimated_scope": "Run inference on 10 sample X-rays using a pre-trained ResNet model in 60 mins; add Grad-CAM heatmap visualization over 3-4 days.",
            "first_three_steps": [
                "Load open-source NIH Chest X-ray benchmark sample radiographs.",
                "Implement CLAHE contrast enhancement and normalization in OpenCV.",
                "Pass enhanced scans through a pre-trained ResNet-18 classifier and output confidence scores."
            ],
            "workshop_learning_outcome": "Learn medical image preprocessing, contrast enhancement, and binary classification evaluation metrics (Recall/Sensitivity)."
        }
    },
    {
        "id": "nlp_customer_ticket_router",
        "domains": ["natural language processing", "generative ai", "web & fullstack ai"],
        "keywords": ["python", "fastapi", "scikit-learn", "nltk", "react"],
        "skill_level": "beginner",
        "data": {
            "project_title": "AutoRoute: Intelligent Support Ticket Triage System",
            "problem_statement": "Engineering teams lose hours manually reading and routing incoming bug reports and customer tickets to appropriate developers.",
            "project_description": "An NLP multi-class classifier that automatically tags customer support requests (Billing, Bug, Feature Request, Security) and assigns priority levels.",
            "fit_explanation": "Shows direct business utility and software automation capability, highly regarded in SaaS and enterprise engineering roles.",
            "recommended_tech_stack": ["Python", "FastAPI", "Scikit-Learn", "TF-IDF", "Pandas"],
            "difficulty_level": "Beginner",
            "estimated_scope": "Train a TF-IDF Naive Bayes classifier on 500 sample tickets in 60 minutes; build an interactive triage dashboard in 2 days.",
            "first_three_steps": [
                "Clean ticket text: lowercase, remove punctuation, and tokenize words.",
                "Convert text tokens into numerical vectors using TF-IDF vectorization.",
                "Train a Multinomial Naive Bayes model and evaluate accuracy on test support requests."
            ],
            "workshop_learning_outcome": "Understand classic NLP feature representation (TF-IDF), text classification pipelines, and model evaluation."
        }
    },
    {
        "id": "data_student_grade_predictor",
        "domains": ["data science & business intelligence", "edtech"],
        "keywords": ["python", "pandas", "scikit-learn", "seaborn", "matplotlib"],
        "skill_level": "beginner",
        "data": {
            "project_title": "EduInsight: Early Warning Academic Risk Predictor",
            "problem_statement": "Colleges identify struggling students only after end-of-semester final exam failures, missing early intervention windows.",
            "project_description": "A predictive analytics system that analyzes early attendance, mid-term test scores, and lab submission rates to identify students at academic risk.",
            "fit_explanation": "Perfect for beginners wanting to master Pandas data manipulation, exploratory data analysis, and regression modeling without deep neural networks.",
            "recommended_tech_stack": ["Python", "Pandas", "Scikit-Learn", "Matplotlib", "Seaborn"],
            "difficulty_level": "Beginner",
            "estimated_scope": "Clean sample academic data and train a logistic regression risk model in 60 minutes; generate visual cohort reports later.",
            "first_three_steps": [
                "Load academic cohort CSV dataset and handle missing attendance records using Pandas.",
                "Compute correlation matrix between early attendance and final semester grades.",
                "Train a Logistic Regression model to output an 'At-Risk' probability indicator."
            ],
            "workshop_learning_outcome": "Master data cleaning, exploratory data analysis (EDA), and tabular classification modeling in Python."
        }
    },
    {
        "id": "cv_smart_attendance",
        "domains": ["computer vision", "web & fullstack ai"],
        "keywords": ["python", "opencv", "face recognition", "fastapi", "sqlite"],
        "skill_level": "intermediate",
        "data": {
            "project_title": "FaceLog: Automated Classroom Attendance Verification",
            "problem_statement": "Manual roll-call in 100-student lecture halls consumes 15 minutes of valuable classroom instruction every single day.",
            "project_description": "A facial recognition prototype that matches student faces from classroom camera snapshots against an enrolled student database to log attendance.",
            "fit_explanation": "A practical campus automation project that demonstrates facial encoding, 128-dimensional Euclidean distance matching, and SQLite integration.",
            "recommended_tech_stack": ["Python", "OpenCV", "Face-Recognition library", "FastAPI", "SQLite"],
            "difficulty_level": "Intermediate",
            "estimated_scope": "Encode 5 reference student faces and test single-image matching in 60 mins; add batch video processing and web export later.",
            "first_three_steps": [
                "Generate 128-d face encodings for reference student ID photos using dlib.",
                "Capture group test snapshot and locate all bounding boxes for faces in the frame.",
                "Compare test face encodings to database with 0.6 distance threshold and write timestamp."
            ],
            "workshop_learning_outcome": "Understand facial landmark encodings, metric learning, and building automated campus attendance systems."
        }
    },
    {
        "id": "genai_voice_meeting_notes",
        "domains": ["generative ai", "natural language processing"],
        "keywords": ["python", "whisper", "gemini", "fastapi", "audio"],
        "skill_level": "intermediate",
        "data": {
            "project_title": "Briefly: Audio Meeting Summarizer & Action Item Extractor",
            "problem_statement": "Engineering team members waste hours re-listening to meeting recordings to extract action items, deadlines, and decisions.",
            "project_description": "An end-to-end audio transcription and summarization assistant that transcribes voice memos and generates structured executive bullet points with assigned tasks.",
            "fit_explanation": "Combines speech-to-text with LLM synthesis, building an everyday productivity tool you can use across group engineering project meetings.",
            "recommended_tech_stack": ["Python", "OpenAI Whisper (Local)", "Google Gemini API", "FastAPI"],
            "difficulty_level": "Intermediate",
            "estimated_scope": "Transcribe a 1-minute sample audio WAV and extract action items in 60 mins; add web audio recording interface over a weekend.",
            "first_three_steps": [
                "Load lightweight Whisper 'tiny' model and transcribe a 30-second audio voice note.",
                "Construct a structured prompt passing transcript text to extract Decisions and Action Items.",
                "Format the output into a markdown checklist with detected deadlines and assignee tags."
            ],
            "workshop_learning_outcome": "Learn audio speech-to-text transcription pipelines and multi-step prompt chaining with LLMs."
        }
    },
    {
        "id": "cyber_log_anomaly_detector",
        "domains": ["cybersecurity ai", "data science"],
        "keywords": ["python", "scikit-learn", "isolation forest", "fastapi", "pandas"],
        "skill_level": "intermediate",
        "data": {
            "project_title": "LogSentry: Server Access Log Anomaly Detector",
            "problem_statement": "System administrators are overwhelmed by millions of server log entries, allowing unauthorized intrusion attempts to go unnoticed.",
            "project_description": "An unsupervised machine learning detector that parses Apache/Nginx web server access logs and flags anomalous IP traffic spikes or brute-force patterns.",
            "fit_explanation": "Demonstrates unsupervised anomaly detection (Isolation Forests), an essential skill for cloud security and DevOps engineering roles.",
            "recommended_tech_stack": ["Python", "Pandas", "Scikit-Learn (Isolation Forest)", "FastAPI"],
            "difficulty_level": "Intermediate",
            "estimated_scope": "Parse 1,000 log lines and train Isolation Forest in 60 minutes; build real-time log tailing and Slack alerts over the weekend.",
            "first_three_steps": [
                "Parse Apache combined access logs with regex into timestamp, IP, status code, and bytes.",
                "Aggregate requests per minute per IP to create numerical traffic behavior vectors.",
                "Fit an Isolation Forest model to flag top 1% outlier scores as suspicious intrusion attempts."
            ],
            "workshop_learning_outcome": "Understand unsupervised machine learning, anomaly detection mathematics, and security log analysis."
        }
    }
]


def get_curated_fallback(
    interests: List[str],
    skill_level: SkillLevel,
    technologies_known: List[str]
) -> ProjectRecommendation:
    """Intelligently matches the most appropriate fallback project from the catalogue
    based on the student's declared interests, skill level, and known technologies.
    """
    user_tokens = set(
        [i.lower() for i in interests] +
        [t.lower() for t in technologies_known] +
        [skill_level.value.lower()]
    )

    best_score = -1
    best_project = FALLBACK_PROJECTS[0]["data"]

    for item in FALLBACK_PROJECTS:
        score = 0
        # Match domains
        for domain in item["domains"]:
            for interest in interests:
                if domain in interest.lower() or interest.lower() in domain:
                    score += 5

        # Match technologies
        for kw in item["keywords"]:
            for tech in technologies_known:
                if kw in tech.lower() or tech.lower() in kw:
                    score += 3

        # Match skill level
        if item["skill_level"] == skill_level.value.lower():
            score += 2

        if score > best_score:
            best_score = score
            best_project = item["data"]

    return ProjectRecommendation(**best_project)
