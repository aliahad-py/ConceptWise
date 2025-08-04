# 📘 Concept Wise

Concept Wise is an AI-powered educational tool designed to help students visualize and understand complex academic concepts through interactive diagrams and smart note generation. Built with Next.js and Firebase, it uses Large Language Models (LLMs) to transform learning material into structured, expandable diagrams.

🚀 **Live App:** [https://concept-wise.vercel.app/](https://concept-wise.vercel.app/)

---

## ✨ Key Features

- 🧠 **AI-Powered Diagram Notes**  
  Convert textbooks, paragraphs, or chapters into interactive concept maps using LLMs.

- 🔗 **Interlinked Concept Nodes**  
  Each node in the diagram is expandable and connected, helping you see how ideas relate.

- 🎨 **Custom Themes & Diagram Styles**  
  Switch between diagram layouts and personalize the style for your preferred learning flow.

- 🏫 **Student-Centric Design**  
  Specifically built for school and college learners to simplify tough subjects.

- 📄 **Smart Summaries & Contextual Notes**  
  AI extracts meaningful summaries from provided input, linking them to visual nodes.

---

## 🛠️ Tech Stack

- **Next.js 14 (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **Firebase (Auth, Firestore, Hosting)**
- **OpenAI API / LLMs**
- **shadcn/ui for components**

---

## 📦 How to Run Locally

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/concept-wise.git
   cd concept-wise
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up environment variables**
   Create a .env.local file and add your Firebase + OpenAI keys:
   ```ini
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   OPENAI_API_KEY=your_openai_key
   ```
