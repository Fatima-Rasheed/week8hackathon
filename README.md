# Smart PDF Intelligence Platform

A multi-agent AI system built with the OpenAI Agents SDK that analyzes PDF documents and answers questions using a 4-agent architecture with mandatory handoffs, real tools, and guardrails.

---

## Agent Architecture

```
User Input
    ↓
Router Agent          ← classifies intent, never answers
    ↓
Specialized Agent     ← Document Analysis | Summary | Q&A
    ↓
Tool Calls            ← PDF Extractor, Chunk Retriever, Section Locator, Token Counter
    ↓
Final Answer
```

### Agent Responsibilities

| Agent | Role | Tools | Can Answer User? |
|---|---|---|---|
| **Router Agent** | Classifies intent → routes to correct agent | None | ❌ Never |
| **Document Analysis Agent** | Identifies doc type, sections, themes, entities | PDF Extractor, Section Locator, Token Counter | ❌ No |
| **Summary Agent** | Generates executive summary + bullet highlights (style adapts to doc type) | PDF Extractor, Section Locator | ✅ Final output |
| **Q&A Agent** | Answers specific questions strictly from document | Chunk Retriever, Section Locator | ✅ Final output |

### Why Agents Are Separated

- **Router** must be isolated so it never leaks answers — it only classifies
- **Analysis** is a one-time deep read; merging it with Q&A would cause confusion between "understand the doc" and "answer a question"
- **Summary** needs different prompting per document type — merging with Q&A would dilute both
- **Q&A** must be strictly grounded — isolation makes hallucination easier to prevent and debug

### What Breaks If Merged Into One Agent

- A single agent would try to route, analyze, summarize, and answer simultaneously — leading to confused, mixed outputs
- Guardrails become impossible to apply selectively
- Tool usage becomes uncontrolled (e.g., Q&A calling analysis tools unnecessarily)
- Debugging failures becomes very hard

---

## Tools Used

| Tool | Used By | Why |
|---|---|---|
| `get_document_text` | Analysis Agent | Reads full PDF text for deep analysis |
| `retrieve_relevant_chunks` | Q&A Agent | Finds only relevant passages — avoids processing entire doc per question |
| `locate_section` | Analysis + Summary + Q&A | Pinpoints named sections (Abstract, Conclusion, etc.) |
| `count_tokens` | Analysis Agent | Understands document size before processing |

---

## Guardrails

Guardrails run **outside prompts** in `guardrails/document-grounded.guardrail.ts`:

1. **Input Guardrail** — Blocks prompt injection attempts and clearly off-topic queries before any agent runs
2. **Output Guardrail** — If Router classifies intent as `off_topic`, the response is blocked regardless of what the agent returned
3. **Q&A Agent instruction** — Explicitly instructed to return `"This information is not present in the document."` when the answer isn't found — no hallucination allowed

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + MUI + RTK Query
- **Backend**: NestJS + MongoDB (Mongoose)
- **AI Layer**: OpenAI Agents SDK (TypeScript)
- **Model**: GPT-4o-mini (configurable via `.env`)

---

## How to Run Locally

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)
- OpenAI API key

### Backend

```bash
cd backend
cp .env .env.local   # edit OPENAI_API_KEY
npm run start:dev
# Runs on http://localhost:4000
```

### Frontend

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### Environment Variables (backend/.env)

```
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
MONGODB_URI=mongodb://localhost:27017/pdf-intelligence
PORT=4000
```

---

## Production Improvements

1. **Vector embeddings** — Replace keyword chunk retrieval with semantic search (pgvector / Pinecone)
2. **Streaming responses** — Stream agent output to frontend for better UX
3. **Agent memory** — Store conversation history per document session
4. **Parallel agents** — Run Analysis + Summary agents in parallel on upload
5. **Confidence scoring** — Q&A agent returns a confidence score alongside answers
