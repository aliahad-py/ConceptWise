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
   # Firebase config
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   # Gemini API Key (Google AI Studio or Google Cloud)
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. **Run the Development Server**
   ```bash
   npm run dev
   ```
5. **View in Your Browser**
Open your browser and visit:  
[http://localhost:3000](http://localhost:3000)

---

🧑‍🎓 Who This Is For
---------------------

* Students looking to break down tough subjects like chemistry, physics, or history  
* Visual learners who understand better with diagrams  
* Anyone who wants to generate structured study notes quickly with AI  

---

🧪 Tech Stack
-------------

* **Next.js 14** (App Router)  
* **TypeScript**  
* **Tailwind CSS**  
* **Firebase (Auth, Firestore)**  
* **OpenAI / GPT**  
* **shadcn/ui** components  

---

📦 Deployment
-------------

The app is deployed with **Vercel** and can be accessed here:  
🔗 [https://concept-wise.vercel.app/](https://concept-wise.vercel.app/)

---

📌 Coming Soon
--------------

* 📚 Subject-specific templates (Physics, Biology, etc.)  
* 👥 Collaborative concept mapping  
* 📱 Mobile-optimized UI  
* 🔄 Save and share diagrams with peers or teachers  

---

📄 License
----------

MIT License  
© 2025 [Ali Ahad](https://github.com/aliahad-py)

---

🤝 Contributing
---------------

Contributions, ideas, or feature requests are always welcome!  
Feel free to open issues or pull requests in the [GitHub repo](https://github.com/aliahad-py/ConceptWise).

   
