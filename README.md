# FinWise - AI Finance Assistant 🚀

![FinWise Dashboard](finance-logo.jpg)

**FinWise** is an advanced, AI-powered financial assistant application built to provide actionable insights, portfolio analysis, stock forecasting, and automated budget recommendations. It features a sleek, premium dark-mode interface with a robust Flask and Machine Learning backend.

## 🌟 Key Features

1. **Stock Analysis & Forecasting (Prophet ML)**
   - Predicts future stock prices using Meta's `Prophet` machine learning library.
   - Fetches real-time financial data using `yfinance` and `yahooquery`.
2. **Portfolio Analysis (Groq AI)**
   - Evaluates your current portfolio holding against global economic factors (e.g., recession rates).
   - Provides immediate risk analysis, short-term projections, and wealth management advice powered by advanced LLMs via Groq.
3. **AI Finance Chatbot (RAG + FAISS)**
   - Features a fully conversational AI finance assistant.
   - Uses local `sentence-transformers` for embedding financial documents into a `FAISS` vector database.
   - Answers complex financial queries utilizing Retrieval-Augmented Generation (RAG).
4. **Portfolio Diversification (Random Forest Classification)**
   - Analyzes a list of stock tickers to determine sector spread.
   - Uses a Scikit-Learn `RandomForestClassifier` to classify your portfolio as *High Risk*, *Neutral*, or *Well Diversified*.
5. **AI Budget Recommender**
   - Automatically generates a personalized budget breakdown based on your income, debt, and selected financial goals.
   - Beautifully visualizes the allocations using `Chart.js`.

## 🛠️ Architecture & Tech Stack

- **Frontend:** HTML5, Vanilla CSS (Glassmorphism & Neon Dark Mode), Vanilla JavaScript, Chart.js.
- **Backend:** Python, Flask, Flask-CORS.
- **AI & Machine Learning:**
  - `Groq` (LLM API)
  - `Prophet` (Time-series forecasting)
  - `Scikit-Learn` (Random Forest Classification)
  - `FAISS` & `sentence-transformers` (Vector DB & embeddings)
  - `LangChain` (RAG Pipeline)
- **Data Gathering:** `yfinance`, `yahooquery`

## 🚀 Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SmitShah-6502/FinWise-Finance-Assistant.git
   cd FinWise-Finance-Assistant
   ```

2. **Set up a Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

5. **Run the Application**
   ```bash
   python server.py
   ```
   The application will be live at `http://127.0.0.1:5000/`.

## ☁️ Deployment Instructions

### Frontend (Vercel)
You can deploy the HTML/CSS/JS frontend on Vercel easily.
1. Connect your GitHub repository to Vercel.
2. Vercel will automatically detect the static files in `templates/` and `static/`.

### Backend (Render / Railway / Heroku)
**Note on Vercel:** Vercel's serverless functions have a maximum size limit of **250MB**. Because this project uses heavy Machine Learning libraries (`torch`, `sentence-transformers`, `faiss-cpu`, `prophet`), it **cannot** be deployed on Vercel's backend. 

To deploy the backend:
1. Create a Web Service on Render or Railway.
2. Connect this GitHub repository.
3. Set the start command to: `gunicorn server:app`
4. Update the frontend `app.js` fetch requests to point to your new cloud backend URL instead of relative `/api/...` paths.

## 📄 License
This project is open-source and available under the MIT License.
