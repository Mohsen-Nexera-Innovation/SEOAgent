# AI SEO Agent – Cursor Implementation Guide

## Objective

Build an **AI SEO Agent System** capable of automating SEO research and strategy.

The system must allow a user to:

1. Enter **dynamic keywords or topics**
2. Run automated **SEO research**
3. Perform **competitor analysis**
4. Generate **keyword clusters**
5. Create **SEO content plans**
6. Chat with the AI agent
7. Export results into **Excel files**

This project is designed as a **quick MVP SEO automation platform**.

---

# Core Principle

Keywords must **never be hardcoded**.

Keywords must always come dynamically from:

* UI input
* Chat interaction
* AI keyword discovery

The system must treat keywords as **runtime data**.

---

# System Architecture

```
Frontend (Next.js)
     |
     | REST API
     |
Backend (Node.js)
     |
AI Agent Layer
     |
Cursor Skills
     |
SEO Services
     |
External Data Sources
```

---

# Required Features

The system must include:

### UI

* Chat interface with AI agent
* Keyword/topic input
* Results dashboard
* Export results to Excel

### AI Agent

* Keyword discovery
* Competitor analysis
* Keyword clustering
* Content planning
* SEO article generation

### Backend

* API endpoints
* SEO services
* Excel export functionality

---

# Project Folder Structure

Create the following structure:

```
seo-agent/
│
├── frontend/
│   ├── app/
│   ├── components/
│   │   ├── ChatUI.tsx
│   │   ├── KeywordInput.tsx
│   │   ├── ResultsTable.tsx
│   │   └── ExportButton.tsx
│
├── backend/
│   ├── agent/
│   │   ├── masterAgent.ts
│   │   ├── keywordAgent.ts
│   │   ├── competitorAgent.ts
│   │   └── contentAgent.ts
│
│   ├── services/
│   │   ├── keywordService.ts
│   │   ├── competitorService.ts
│   │   └── serpService.ts
│
│   ├── utils/
│   │   └── excelExporter.ts
│
├── .cursor/
│   └── skills/
│       ├── keyword-research.md
│       ├── competitor-analysis.md
│       ├── content-planner.md
│       ├── seo-writer.md
│       └── onpage-seo.md
│
└── CURSOR_AI_SEO_AGENT_GUIDE.md
```

---

# AI Agent Design

Create a **Master SEO Agent** responsible for orchestrating tasks.

Agents include:

* Keyword Agent
* Competitor Agent
* Content Planner Agent
* SEO Writer Agent
* On-page SEO Agent

Workflow:

```
User Input
     |
Master Agent
     |
Keyword Research
     |
Competitor Analysis
     |
Keyword Clustering
     |
Content Planning
     |
SEO Content Generation
```

---

# Dynamic Keyword Pipeline

Keywords must follow this pipeline:

```
Seed Keywords
     |
Keyword Expansion
     |
SERP Analysis
     |
Keyword Clustering
     |
Search Intent Detection
```

Seed keywords can come from:

* User UI input
* Chat message
* AI keyword discovery

---

# Backend APIs

Implement the following endpoints:

```
POST /api/keyword-research
POST /api/competitor-analysis
POST /api/content-plan
POST /api/export
POST /api/chat
```

Example request:

```
POST /api/keyword-research

{
  "keywords": ["glucose monitoring device"]
}
```

Example response:

```
{
  "clusters": [
    {
      "topic": "Continuous Glucose Monitor",
      "keywords": [
        "continuous glucose monitor",
        "best CGM device",
        "CGM accuracy"
      ]
    }
  ]
}
```

---

# Chat Interface

Create a chat component:

```
components/ChatUI.tsx
```

Capabilities:

* user messages
* AI responses
* trigger SEO workflows

Example interaction:

User:

```
Analyze SEO opportunities for diabetes monitoring devices
```

AI:

```
Seed keywords detected
Keyword expansion completed
Competitor analysis generated
Content roadmap created
```

---

# Keyword Input UI

Create component:

```
components/KeywordInput.tsx
```

Features:

* dynamic keyword input
* multiple keywords
* add/remove keywords
* start analysis

Example UI:

```
Enter Keywords:

[ glucose monitor ]
[ CGM device ]

+ Add Keyword

[ Start SEO Analysis ]
```

When clicked:

Call:

```
POST /api/keyword-research
```

---

# Results Dashboard

Create component:

```
ResultsTable.tsx
```

Display:

| Keyword | Cluster | Search Intent | Competition |
| ------- | ------- | ------------- | ----------- |

Data should come dynamically from API results.

---

# Excel Export

Install:

```
npm install exceljs
```

Create utility:

```
backend/utils/excelExporter.ts
```

Example implementation:

```
import ExcelJS from "exceljs"

export async function exportKeywords(data){

 const workbook = new ExcelJS.Workbook()
 const sheet = workbook.addWorksheet("keywords")

 sheet.columns = [
  { header: "Keyword", key: "keyword" },
  { header: "Cluster", key: "cluster" },
  { header: "Intent", key: "intent" },
  { header: "Competition", key: "competition" }
 ]

 data.forEach(row => sheet.addRow(row))

 await workbook.xlsx.writeFile("seo-results.xlsx")
}
```

Export sheets:

Sheet 1: Keyword Clusters
Sheet 2: Competitor Analysis
Sheet 3: Content Plan

---

# Cursor Skills

Create directory:

```
.cursor/skills
```

---

# Skill: Keyword Research

File:

```
.cursor/skills/keyword-research.md
```

Content:

```
# Keyword Research Skill

Input:
Dynamic keywords from user or agent context.

Steps:

1 Expand keywords
2 Generate long-tail variations
3 Discover related questions
4 Cluster keywords by topic
5 Detect search intent

Output:

Cluster
Main Keyword
Related Keywords
Search Intent
Competition Estimate
```

---

# Skill: Competitor Analysis

File:

```
.cursor/skills/competitor-analysis.md
```

Content:

```
# Competitor Analysis Skill

Steps:

1 Identify top 10 Google results
2 Extract page title
3 Extract headings
4 Identify keywords used
5 Estimate content length
6 Detect schema markup

Output:

Competitor
URL
Keywords
Content Structure
SEO Opportunities
```

---

# Skill: Content Planner

File:

```
.cursor/skills/content-planner.md
```

Content:

```
# SEO Content Planner

Create topical authority strategy.

Steps:

1 Build pillar pages
2 Create supporting articles
3 Assign keywords
4 Define internal linking

Output:

Content Roadmap
Pillar Page
Supporting Articles
Target Keywords
```

---

# Skill: SEO Writer

File:

```
.cursor/skills/seo-writer.md
```

Content:

```
# SEO Article Writer

Generate SEO optimized article.

Requirements:

Use H1 H2 H3
Include keywords naturally
Add FAQ section
Add schema markup
Optimize for featured snippet

Output:

Title
Meta Description
Outline
Full Article
FAQ
Schema JSON
```

---

# Skill: On Page SEO Analyzer

File:

```
.cursor/skills/onpage-seo.md
```

Content:

```
# On Page SEO Analyzer

Analyze page SEO quality.

Check:

Title length
Meta description
Heading structure
Keyword density
Internal links
Schema markup

Output:

SEO Score
Issues
Fix Recommendations
```

---

# Recommended Tech Stack

Frontend

Next.js
React
TailwindCSS

Backend

Node.js
Express

AI

OpenAI API or Claude API

SEO Data

Google Suggest API
SERP scraping tools

---

# Expected User Workflow

1 User enters keywords or topic
2 AI expands keyword list
3 AI analyzes competitors
4 AI clusters keywords
5 AI generates content roadmap
6 User exports results to Excel

---

# Cursor Instructions

When implementing this project:

1. Scaffold the folder structure
2. Implement backend APIs
3. Create the Cursor skills
4. Build the frontend UI
5. Connect chat agent to skills
6. Ensure keywords remain dynamic
7. Implement Excel export
8. Ensure modular architecture

The system must be easy to extend with additional SEO agents.
