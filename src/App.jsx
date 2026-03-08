import { useState, useRef, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, LabelList,
} from "recharts";

const DOMAINS = [
  {
    id: 1,
    title: "U.S. Privacy Environment",
    color: "#22c55e",
    topics: [
      "Structure of U.S. Privacy Law",
      "The Role of the FTC (Section 5)",
      "Constitutional Foundations of Privacy",
      "Federal vs. State Privacy Authority",
      "History of U.S. Privacy Regulation",
      "Fair Information Practice Principles (FIPPs)",
      "Self-Regulatory Frameworks",
      "Privacy Torts",
      "Information Management Concepts",
      "The Role of the States in Privacy Enforcement",
      "International Privacy Frameworks vs. U.S. Approach",
    ],
  },
  {
    id: 2,
    title: "Limits on Private-Sector Collection",
    color: "#7c4ff7",
    topics: [
      "HIPAA: Covered Entities and PHI",
      "HIPAA: Minimum Necessary and Patient Rights",
      "HITECH Act and Breach Notification",
      "Gramm-Leach-Bliley Act (GLBA)",
      "GLBA Safeguards Rule",
      "Fair Credit Reporting Act (FCRA)",
      "FCRA: Adverse Action and Consumer Rights",
      "COPPA: Children's Online Privacy",
      "Family Educational Rights and Privacy Act (FERPA)",
      "CAN-SPAM Act",
      "TCPA and Telemarketing Rules",
      "Genetic Information Nondiscrimination Act (GINA)",
      "Video Privacy Protection Act (VPPA)",
      "Driver's Privacy Protection Act (DPPA)",
      "Cable Communications Policy Act",
      "Financial Privacy Notices (Regulation P)",
    ],
  },
  {
    id: 3,
    title: "Government & Court Access",
    color: "#f74f8e",
    topics: [
      "Fourth Amendment Protections",
      "Third-Party Doctrine",
      "Stored Communications Act (SCA)",
      "Electronic Communications Privacy Act (ECPA)",
      "Wiretap Act (Title III)",
      "Pen Register and Trap and Trace",
      "USA PATRIOT Act",
      "USA FREEDOM Act",
      "Foreign Intelligence Surveillance Act (FISA)",
      "National Security Letters (NSLs)",
      "Computer Fraud and Abuse Act (CFAA)",
      "Freedom of Information Act (FOIA)",
      "Privacy Act of 1974",
      "Grand Jury Subpoenas",
      "Civil Discovery and Subpoenas",
    ],
  },
  {
    id: 4,
    title: "Workplace Privacy",
    color: "#f7a24f",
    topics: [
      "Employee Monitoring: Email and Internet",
      "Employee Monitoring: Phone and Video",
      "BYOD and Personal Device Policies",
      "Drug and Alcohol Testing",
      "Background Checks and FCRA in Employment",
      "Social Media Screening and Monitoring",
      "NLRA and Employee Rights",
      "ADA and Medical Information in Employment",
      "HIPAA in Workplace Wellness Programs",
      "Employee Records Retention",
      "Onboarding and Offboarding Data Practices",
      "Whistleblower Protections",
      "Workers Compensation and Privacy",
    ],
  },
  {
    id: 5,
    title: "State Privacy Law",
    color: "#4fc9a4",
    topics: [
      "California Consumer Privacy Act (CCPA)",
      "CPRA Amendments and the CPPA",
      "California Shine the Light Law",
      "California Age-Appropriate Design Code",
      "Illinois Biometric Information Privacy Act (BIPA)",
      "State Breach Notification Laws",
      "State Data Disposal and Destruction Laws",
      "State Wiretapping and Eavesdropping Laws",
      "Virginia Consumer Data Protection Act (CDPA)",
      "Colorado Privacy Act (CPA)",
      "Connecticut Data Privacy Act (CTDPA)",
      "Texas Data Privacy and Security Act",
      "State Social Security Number Restrictions",
      "State-Level FTC Analogs (mini-FTC acts)",
    ],
  },
];

const MODES = {
  HOME: "home",
  STUDY: "study",
  QUIZ: "quiz",
  RESULTS: "results",
  FLASHCARDS: "flashcards",
};

const callClaude = async (systemPrompt, userMessage, maxTokens = 1500) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "";
};

const callClaudeJSON = async (systemPrompt, userMessage, maxTokens = 1500) => {
  const text = await callClaude(systemPrompt, userMessage, maxTokens);
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
};

// Progress ring component
const ProgressRing = ({ pct, size = 44, stroke = 4, color }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
};

const CHART_COLORS = ["#4f8ef7","#22c55e","#a78bfa","#f59e0b","#06b6d4","#f97316","#ec4899"];

const ChartBlock = ({ chart }) => {
  const color = chart.color || "#4f8ef7";
  return (
    <div style={{
      background: "#f8fafc", border: "1px solid #e2e8f0",
      borderRadius: 10, padding: "16px 20px", marginBottom: 16,
    }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 2 }}>{chart.title}</div>
        {chart.subtitle && <div style={{ fontSize: 11, color: "#64748b" }}>{chart.subtitle}</div>}
      </div>

      {chart.type === "bar" && (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chart.data} margin={{ top: 4, right: 8, left: -10, bottom: 40 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e2e8f0" }} />
            <Bar dataKey="value" radius={[4,4,0,0]}>
              {chart.data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.85} />)}
              <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: "#475569", fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {chart.type === "horizontal_bar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          {(() => {
            const max = Math.max(...chart.data.map(d => d.value));
            return chart.data.map((d, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: "#334155", fontWeight: 500 }}>{d.name}</span>
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{d.value.toLocaleString()}</span>
                </div>
                <div style={{ background: "#e2e8f0", borderRadius: 4, height: 10, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4,
                    background: CHART_COLORS[i % CHART_COLORS.length],
                    width: `${Math.round((d.value / max) * 100)}%`,
                    transition: "width 0.8s ease",
                    opacity: 0.85,
                  }} />
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {chart.type === "pie" && (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={chart.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} paddingAngle={3}>
              {chart.data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.85} />)}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e2e8f0" }} />
            <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11, color: "#475569" }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default function App() {
  const [mode, setMode] = useState(MODES.HOME);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [studyContent, setStudyContent] = useState("");
  const [studyCharts, setStudyCharts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [scores, setScores] = useState({}); // topic -> {correct, total}
  const [quizCount, setQuizCount] = useState(3);
  const [randomFlashCount, setRandomFlashCount] = useState(5);
  const [flashcards, setFlashcards] = useState([]);
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashFlipped, setFlashFlipped] = useState(false);
  const chatEndRef = useRef(null);

  const domainScore = (domain) => {
    let c = 0, t = 0;
    domain.topics.forEach(tp => {
      const s = scores[tp];
      if (s) { c += s.correct; t += s.total; }
    });
    return t > 0 ? Math.round((c / t) * 100) : null;
  };

  const totalScore = () => {
    let c = 0, t = 0;
    Object.values(scores).forEach(s => { c += s.correct; t += s.total; });
    return t > 0 ? Math.round((c / t) * 100) : null;
  };

  const studyTopic = async (domain, topic) => {
    setSelectedDomain(domain);
    setSelectedTopic(topic);
    setMode(MODES.STUDY);
    setStudyContent("");
    setStudyCharts([]);
    setLoading(true);

    const [content, chartData] = await Promise.all([
      callClaude(
        `You are an expert CIPP/US exam instructor. Explain topics clearly with:
- A 1-sentence "TLDR" summary at the top labeled **TLDR:**
- Key statutory/regulatory details (names, dates, thresholds)
- Who enforces it and what the penalties are
- Common exam traps or nuances
- A real-world example
Use markdown formatting. Be thorough but scannable. Focus on what appears on the CIPP/US exam.`,
        `Explain "${topic}" from the CIPP/US domain "${domain.title}". This is for exam preparation.`
      ),
      callClaudeJSON(
        `You are a data visualization expert for legal education. Return ONLY valid JSON — no markdown, no preamble.`,
        `For the CIPP/US topic "${topic}" (domain: "${domain.title}"), generate 2-3 charts that make key concepts visually clear.

Each chart should teach something genuinely useful — penalty tiers, timelines, enforcement breakdowns, comparative thresholds, key actors, etc.

Return a JSON array of chart objects. Each object must have:
{
  "type": "bar" | "pie" | "horizontal_bar",
  "title": "Short descriptive title",
  "subtitle": "One sentence explaining what this shows",
  "color": "#hex — pick a color that fits the mood (use blues, greens, purples, ambers — avoid red/pink unless it represents penalties/violations)",
  "data": [ { "name": "Label", "value": number } ]
}

Rules:
- Bar charts: 3-7 items, numeric values with clear meaning (dollars, days, years, percentages)
- Horizontal bar: best for comparing named entities (agencies, laws, states) with different values
- Pie charts: 2-5 slices, use when parts-of-a-whole is the insight (e.g. enforcement share, data type breakdown)
- All values must be real numbers from actual law/regulation — no made-up data
- Labels must be short (under 20 chars)`
      ),
    ]);

    setStudyContent(content);
    setStudyCharts(Array.isArray(chartData) ? chartData : []);
    setLoading(false);
  };

  const startQuiz = async (domain, topic) => {
    setSelectedDomain(domain);
    setSelectedTopic(topic);
    setMode(MODES.QUIZ);
    setQuestions([]);
    setCurrentQ(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setLoading(true);
    const data = await callClaudeJSON(
      `You are a CIPP/US exam question writer. Return ONLY valid JSON — no markdown, no preamble.`,
      `Generate ${quizCount} multiple-choice CIPP/US exam questions about "${topic}" in domain "${domain.title}".
Return a JSON array of objects, each with:
{
  "question": "...",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correct": 0,
  "explanation": "Why this answer is correct and why others are wrong."
}
"correct" is the 0-based index of the correct option. Make questions exam-realistic and challenging.`
    );
    setQuestions(data || []);
    setLoading(false);
  };

  const startRandomQuiz = async () => {
    // Flatten all topics across all domains, shuffle, pick 4 to sample from
    const allTopics = DOMAINS.flatMap(d => d.topics.map(t => ({ domain: d, topic: t })));
    const shuffled = allTopics.sort(() => Math.random() - 0.5);
    const sampled = shuffled.slice(0, 3);
    const topicList = sampled.map(s => `"${s.topic}" (${s.domain.title})`).join(", ");

    setSelectedDomain(null);
    setSelectedTopic("Random Quiz");
    setMode(MODES.QUIZ);
    setQuestions([]);
    setCurrentQ(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setLoading(true);

    const data = await callClaudeJSON(
      `You are a CIPP/US exam question writer. Return ONLY valid JSON — no markdown, no preamble.`,
      `Generate exactly 3 multiple-choice CIPP/US exam questions, one from each of these topics: ${topicList}.
Each question must be exam-realistic and challenging.
Return a JSON array of exactly 3 objects, each with:
{
  "question": "...",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correct": 0,
  "explanation": "Why this answer is correct and why others are wrong.",
  "topic": "the topic this question covers"
}
"correct" is the 0-based index of the correct option.`,
      2000
    );
    setQuestions(data || []);
    setLoading(false);
  };

  const startRandomFlashcards = async () => {
    const allTopics = DOMAINS.flatMap(d => d.topics.map(t => ({ domain: d, topic: t })));
    const shuffled = allTopics.sort(() => Math.random() - 0.5);
    const sampled = shuffled.slice(0, randomFlashCount);
    const topicList = sampled.map(s => `"${s.topic}" (${s.domain.title})`).join(", ");

    setFlashcards([]);
    setFlashIndex(0);
    setFlashFlipped(false);
    setMode(MODES.FLASHCARDS);
    setLoading(true);

    const data = await callClaudeJSON(
      `You are a CIPP/US exam instructor. Return ONLY valid JSON — no markdown, no preamble.`,
      `Generate exactly ${randomFlashCount} flashcards, one per topic from this list: ${topicList}.
Each card should test a single important, exam-likely concept from that topic.
Return a JSON array of exactly ${randomFlashCount} objects:
{
  "front": "A clear, concise question or prompt (1-2 sentences)",
  "back": "The answer — 2-4 sentences with the key fact, rule, or threshold",
  "topic": "the topic name",
  "domain": "the domain title"
}`,
      2000
    );
    setFlashcards(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const startTopicFlashcards = async (domain, topic) => {
    setFlashcards([]);
    setFlashIndex(0);
    setFlashFlipped(false);
    setSelectedDomain(domain);
    setSelectedTopic(topic);
    setMode(MODES.FLASHCARDS);
    setLoading(true);

    const data = await callClaudeJSON(
      `You are a CIPP/US exam instructor. Return ONLY valid JSON — no markdown, no preamble.`,
      `Generate exactly 5 flashcards for the CIPP/US topic "${topic}" (domain: "${domain.title}").
Each card should test a distinct, exam-likely concept from this topic.
Return a JSON array of exactly 5 objects:
{
  "front": "A clear, concise question or prompt (1-2 sentences)",
  "back": "The answer — 2-4 sentences with the key fact, rule, or threshold",
  "topic": "${topic}",
  "domain": "${domain.title}"
}`,
      2000
    );
    setFlashcards(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleAnswer = (idx) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    const isCorrect = idx === questions[currentQ].correct;
    setAnswers(prev => [...prev, { selected: idx, correct: questions[currentQ].correct, isCorrect }]);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      // Save scores
      const correct = answers.filter(a => a.isCorrect).length + (selectedAnswer === questions[currentQ].correct ? 1 : 0);
      // already counted above in answers when handleAnswer ran
      const finalCorrect = answers.filter(a => a.isCorrect).length;
      setScores(prev => {
        const existing = prev[selectedTopic] || { correct: 0, total: 0 };
        return {
          ...prev,
          [selectedTopic]: {
            correct: existing.correct + finalCorrect,
            total: existing.total + questions.length,
          }
        };
      });
      setMode(MODES.RESULTS);
    } else {
      setCurrentQ(q => q + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    return text
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**"))
          return <p key={i} style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{line.replace(/\*\*/g, "")}</p>;
        if (line.startsWith("## "))
          return <h3 key={i} style={{ color: "#15803d", fontSize: 15, fontWeight: 700, marginTop: 16, marginBottom: 6 }}>{line.replace("## ", "")}</h3>;
        if (line.startsWith("# "))
          return <h2 key={i} style={{ color: "#15803d", fontSize: 18, fontWeight: 800, marginTop: 12, marginBottom: 8 }}>{line.replace("# ", "")}</h2>;
        if (line.startsWith("- "))
          return <li key={i} style={{ color: "#64748b", marginLeft: 16, marginBottom: 3, lineHeight: 1.6 }}>{line.replace(/^- /, "").replace(/\*\*(.*?)\*\*/g, "$1")}</li>;
        if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
        // Inline bold
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} style={{ color: "#64748b", marginBottom: 4, lineHeight: 1.7 }}>
            {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: "#334155" }}>{p}</strong> : p)}
          </p>
        );
      });
  };

  const ts = totalScore();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f1f5f9",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: "#1e293b",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #e2e8f0",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#ffffff",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <button
          onClick={() => setMode(MODES.HOME)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#1e293b", letterSpacing: 1 }}>
            CIPP/US PREP
          </span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {ts !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ProgressRing pct={ts} size={36} stroke={3} color={ts >= 70 ? "#4fc9a4" : "#f74f8e"} />
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{ts}% overall</span>
            </div>
          )}
          {mode !== MODES.HOME && (
            <button onClick={() => setMode(MODES.HOME)} style={{
              background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 6,
              color: "#94a3b8", padding: "4px 12px", fontSize: 11, cursor: "pointer"
            }}>← back</button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>

        {/* HOME */}
        {mode === MODES.HOME && (
          <div>
            <div style={{ marginBottom: 32, textAlign: "center" }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: 2, marginBottom: 8, color: "#1e293b" }}>
                CIPP/US STUDY DASHBOARD
              </h1>
              <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>Five domains · AI explanations · Quizzes · Flashcards</p>

              {/* Quick start settings */}
              <div style={{ display: "inline-flex", flexDirection: "column", gap: 10, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 20px", marginBottom: 20, textAlign: "left" }}>
                <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 2, fontWeight: 600 }}>QUICK START SETTINGS</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "#64748b", minWidth: 148 }}>Questions per quiz:</span>
                  {[3, 5, 10].map(n => (
                    <button key={n} onClick={() => setQuizCount(n)} style={{
                      background: quizCount === n ? "#dcfce7" : "#f8fafc",
                      border: `1px solid ${quizCount === n ? "#22c55e" : "#e2e8f0"}`,
                      borderRadius: 6, color: quizCount === n ? "#15803d" : "#64748b",
                      padding: "4px 14px", fontSize: 12, cursor: "pointer",
                    }}>{n}</button>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "#64748b", minWidth: 148 }}>Flashcards per set:</span>
                  {[3, 5, 10].map(n => (
                    <button key={n} onClick={() => setRandomFlashCount(n)} style={{
                      background: randomFlashCount === n ? "#eff6ff" : "#f8fafc",
                      border: `1px solid ${randomFlashCount === n ? "#4f8ef7" : "#e2e8f0"}`,
                      borderRadius: 6, color: randomFlashCount === n ? "#1d4ed8" : "#64748b",
                      padding: "4px 14px", fontSize: 12, cursor: "pointer",
                    }}>{n}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={startRandomQuiz}
                  style={{
                    background: "#dcfce7", border: "2px solid #22c55e", borderRadius: 10,
                    color: "#15803d", padding: "12px 28px", fontSize: 14,
                    fontFamily: "'Syne', sans-serif", fontWeight: 700, cursor: "pointer",
                    letterSpacing: 1, transition: "all 0.2s", boxShadow: "0 2px 8px #22c55e22",
                  }}
                  onMouseEnter={e => { e.target.style.background = "#bbf7d0"; e.target.style.boxShadow = "0 4px 14px #22c55e33"; }}
                  onMouseLeave={e => { e.target.style.background = "#dcfce7"; e.target.style.boxShadow = "0 2px 8px #22c55e22"; }}
                >
                  🎲 RANDOM QUIZ — 3 QUESTIONS
                </button>
                <button
                  onClick={startRandomFlashcards}
                  style={{
                    background: "#eff6ff", border: "2px solid #4f8ef7", borderRadius: 10,
                    color: "#1d4ed8", padding: "12px 28px", fontSize: 14,
                    fontFamily: "'Syne', sans-serif", fontWeight: 700, cursor: "pointer",
                    letterSpacing: 1, transition: "all 0.2s", boxShadow: "0 2px 8px #4f8ef722",
                  }}
                  onMouseEnter={e => { e.target.style.background = "#dbeafe"; e.target.style.boxShadow = "0 4px 14px #4f8ef733"; }}
                  onMouseLeave={e => { e.target.style.background = "#eff6ff"; e.target.style.boxShadow = "0 2px 8px #4f8ef722"; }}
                >
                  🃏 RANDOM FLASHCARDS — {randomFlashCount}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {DOMAINS.map(domain => {
                const ds = domainScore(domain);
                const studied = domain.topics.filter(t => scores[t]).length;
                return (
                  <div key={domain.id} style={{
                    background: "#ffffff",
                    border: `1px solid #e2e8f0`,
                    borderLeft: `3px solid ${domain.color}`,
                    borderRadius: 10,
                    padding: 20,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 10, color: domain.color, letterSpacing: 2, marginBottom: 4, fontWeight: 500 }}>
                          DOMAIN {domain.id}
                        </div>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#1e293b" }}>
                          {domain.title}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                          {studied}/{domain.topics.length} topics studied
                        </div>
                      </div>
                      {ds !== null && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: "column" }}>
                          <ProgressRing pct={ds} size={44} stroke={4} color={domain.color} />
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>{ds}%</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {domain.topics.map(topic => {
                        const ts = scores[topic];
                        const pct = ts ? Math.round((ts.correct / ts.total) * 100) : null;
                        return (
                          <div key={topic} style={{ display: "flex", gap: 0 }}>
                            <button
                              onClick={() => studyTopic(domain, topic)}
                              style={{
                                background: pct !== null ? "#f0fdf4" : "#f8fafc",
                                border: `1px solid ${pct !== null ? domain.color + "44" : "#e2e8f0"}`,
                                borderRadius: "4px 0 0 4px",
                                color: pct !== null ? "#1e293b" : "#64748b",
                                padding: "5px 10px",
                                fontSize: 11,
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={e => e.target.style.borderColor = domain.color}
                              onMouseLeave={e => e.target.style.borderColor = pct !== null ? domain.color + "44" : "#e2e8f0"}
                            >
                              📖 {topic}
                            </button>
                            <button
                              onClick={() => startQuiz(domain, topic)}
                              style={{
                                background: "#f8fafc",
                                border: `1px solid #e2e8f0`,
                                borderLeft: "none",
                                borderRadius: "0",
                                color: pct !== null ? (pct >= 70 ? "#4fc9a4" : "#f74f8e") : "#475569",
                                padding: "5px 8px",
                                fontSize: 10,
                                cursor: "pointer",
                              }}
                              title="Quiz this topic"
                            >
                              {pct !== null ? `${pct}%` : "⚡"}
                            </button>
                            <button
                              onClick={() => startTopicFlashcards(domain, topic)}
                              style={{
                                background: "#f8fafc",
                                border: `1px solid #e2e8f0`,
                                borderLeft: "none",
                                borderRadius: "0 4px 4px 0",
                                color: "#4f8ef7",
                                padding: "5px 8px",
                                fontSize: 10,
                                cursor: "pointer",
                              }}
                              title="Flashcards for this topic"
                            >
                              🃏
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STUDY MODE */}
        {mode === MODES.STUDY && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: selectedDomain?.color || "#22c55e", letterSpacing: 2, marginBottom: 4 }}>
                  DOMAIN {selectedDomain?.id} · STUDY MODE
                </div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: "#1e293b", margin: 0 }}>
                  {selectedTopic}
                </h2>
              </div>
              <button
                onClick={() => startQuiz(selectedDomain, selectedTopic)}
                disabled={loading}
                style={{
                  background: "#dcfce7",
                  border: "1px solid #22c55e",
                  borderRadius: 8, color: "#15803d",
                  padding: "8px 16px", fontSize: 12, cursor: "pointer",
                }}
              >
                ⚡ Quiz this topic
              </button>
            </div>

            <div style={{
              background: "#ffffff", border: "1px solid #e2e8f0",
              borderRadius: 10, padding: 24, minHeight: 200,
            }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748b" }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: selectedDomain?.color || "#22c55e",
                    animation: "pulse 1s ease-in-out infinite",
                  }} />
                  <span style={{ fontSize: 13 }}>Generating explanation & charts...</span>
                  <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }`}</style>
                </div>
              ) : (
                <div>
                  {studyCharts.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>
                        KEY CONCEPTS AT A GLANCE
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: studyCharts.length >= 2 ? "1fr 1fr" : "1fr", gap: 12 }}>
                        {studyCharts.map((chart, i) => <ChartBlock key={i} chart={chart} />)}
                      </div>
                      <div style={{ height: 1, background: "#e2e8f0", margin: "20px 0" }} />
                    </div>
                  )}
                  <div style={{ lineHeight: 1.8, fontSize: 14 }}>
                    {renderMarkdown(studyContent)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QUIZ MODE */}
        {mode === MODES.QUIZ && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: selectedDomain?.color || "#22c55e", letterSpacing: 2, marginBottom: 4 }}>
                {selectedDomain ? `DOMAIN ${selectedDomain.id} · QUIZ MODE` : "RANDOM · ALL DOMAINS"}
              </div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#1e293b", margin: 0 }}>
                {selectedTopic}
              </h2>
            </div>

            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748b", padding: 40 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: selectedDomain?.color || "#22c55e", animation: "pulse 1s ease-in-out infinite" }} />
                <span style={{ fontSize: 13 }}>Generating {quizCount} questions...</span>
                <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }`}</style>
              </div>
            ) : questions.length > 0 ? (
              <div>
                {/* Progress bar */}
                <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
                  {questions.map((_, i) => (
                    <div key={i} style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: i < currentQ
                        ? (answers[i]?.isCorrect ? "#4fc9a4" : "#f74f8e")
                        : i === currentQ ? (selectedDomain?.color || "#22c55e") : "#e2e8f0",
                      transition: "background 0.3s",
                    }} />
                  ))}
                </div>

                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>
                  Question {currentQ + 1} of {questions.length}
                </div>

                <div style={{
                  background: "#ffffff", border: "1px solid #e2e8f0",
                  borderRadius: 10, padding: 24, marginBottom: 16,
                }}>
                  <p style={{ fontSize: 15, color: "#1e293b", lineHeight: 1.7, margin: 0 }}>
                    {questions[currentQ].question}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {questions[currentQ].options.map((opt, i) => {
                    const isSelected = selectedAnswer === i;
                    const isCorrect = i === questions[currentQ].correct;
                    let bg = "#ffffff", border = "#e2e8f0", color = "#94a3b8";
                    if (selectedAnswer !== null) {
                      if (isCorrect) { bg = "#f0fdf4"; border = "#4fc9a4"; color = "#4fc9a4"; }
                      else if (isSelected && !isCorrect) { bg = "#fff1f2"; border = "#f74f8e"; color = "#f74f8e"; }
                    }
                    return (
                      <button key={i} onClick={() => handleAnswer(i)} style={{
                        background: bg, border: `1px solid ${border}`,
                        borderRadius: 8, padding: "12px 16px",
                        color, fontSize: 13, textAlign: "left",
                        cursor: selectedAnswer !== null ? "default" : "pointer",
                        transition: "all 0.2s",
                        lineHeight: 1.5,
                      }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <div style={{
                    background: "#f0fdf4", border: `1px solid #dcfce7`,
                    borderRadius: 10, padding: 16, marginBottom: 16,
                  }}>
                    <div style={{ fontSize: 10, color: "#22c55e", letterSpacing: 2, marginBottom: 8 }}>EXPLANATION</div>
                    <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                      {questions[currentQ].explanation}
                    </p>
                  </div>
                )}

                {selectedAnswer !== null && (
                  <button onClick={nextQuestion} style={{
                    background: "#dcfce7", border: "1px solid #22c55e",
                    borderRadius: 8, color: "#15803d",
                    padding: "10px 24px", fontSize: 13, cursor: "pointer", width: "100%",
                  }}>
                    {currentQ + 1 >= questions.length ? "See Results →" : "Next Question →"}
                  </button>
                )}
              </div>
            ) : (
              <div style={{ color: "#f74f8e", padding: 20 }}>Failed to generate questions. Please try again.</div>
            )}
          </div>
        )}

        {/* RESULTS */}
        {mode === MODES.RESULTS && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 10, color: selectedDomain?.color || "#22c55e", letterSpacing: 2, marginBottom: 8 }}>QUIZ COMPLETE</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 4 }}>
              {selectedTopic}
            </h2>
            <div style={{ fontSize: 48, fontWeight: 800, margin: "24px 0", color: (() => {
              const s = scores[selectedTopic];
              if (!s) return "#1e293b";
              const p = Math.round((s.correct / s.total) * 100);
              return p >= 70 ? "#4fc9a4" : "#f74f8e";
            })() }}>
              {(() => {
                const s = scores[selectedTopic];
                return s ? `${Math.round((s.correct / s.total) * 100)}%` : "—";
              })()}
            </div>
            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 32 }}>
              {answers.filter(a => a.isCorrect).length} / {questions.length} correct
              {answers.filter(a => a.isCorrect).length < questions.length
                ? " — keep studying!" : " — great work!"}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => studyTopic(selectedDomain, selectedTopic)} style={{
                background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8,
                color: "#64748b", padding: "10px 20px", fontSize: 13, cursor: "pointer",
              }}>📖 Re-study topic</button>
              <button onClick={() => startQuiz(selectedDomain, selectedTopic)} style={{
                background: "#dcfce7", border: "1px solid #22c55e", borderRadius: 8,
                color: "#15803d", padding: "10px 20px", fontSize: 13, cursor: "pointer",
              }}>⚡ Retry quiz</button>
              <button onClick={() => setMode(MODES.HOME)} style={{
                background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8,
                color: "#64748b", padding: "10px 20px", fontSize: 13, cursor: "pointer",
              }}>← Dashboard</button>
            </div>
          </div>
        )}
        {/* FLASHCARDS */}
        {mode === MODES.FLASHCARDS && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: selectedDomain?.color || "#4f8ef7", letterSpacing: 2, marginBottom: 4 }}>
                  {selectedDomain ? `DOMAIN ${selectedDomain.id} · FLASHCARDS` : "RANDOM · ALL DOMAINS"}
                </div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: "#1e293b", margin: 0 }}>
                  {selectedTopic || "Random Flashcards"}
                </h2>
              </div>
              {!loading && flashcards.length > 0 && (
                <div style={{ fontSize: 13, color: "#94a3b8" }}>
                  {flashIndex + 1} / {flashcards.length}
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748b", padding: 40 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#4f8ef7", animation: "pulse 1s ease-in-out infinite" }} />
                <span style={{ fontSize: 13 }}>Generating {randomFlashCount} flashcards...</span>
                <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }`}</style>
              </div>
            ) : flashcards.length > 0 ? (
              <div>
                {/* Progress dots */}
                <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
                  {flashcards.map((_, i) => (
                    <div key={i} style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: i < flashIndex ? "#4f8ef7" : i === flashIndex ? "#93c5fd" : "#e2e8f0",
                      transition: "background 0.3s",
                    }} />
                  ))}
                </div>

                {/* Card */}
                <div
                  onClick={() => setFlashFlipped(f => !f)}
                  style={{
                    background: flashFlipped ? "#eff6ff" : "#ffffff",
                    border: `2px solid ${flashFlipped ? "#4f8ef7" : "#e2e8f0"}`,
                    borderRadius: 14, padding: "40px 32px",
                    minHeight: 200, cursor: "pointer",
                    textAlign: "center", transition: "all 0.25s",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 16,
                    boxShadow: flashFlipped ? "0 4px 16px #4f8ef722" : "0 2px 8px #00000008",
                  }}
                >
                  <div style={{ fontSize: 10, color: flashFlipped ? "#4f8ef7" : "#94a3b8", letterSpacing: 2, fontWeight: 600 }}>
                    {flashFlipped ? "ANSWER" : "QUESTION — TAP TO FLIP"}
                  </div>
                  <div style={{ fontSize: 16, color: "#1e293b", lineHeight: 1.7, maxWidth: 560 }}>
                    {flashFlipped ? flashcards[flashIndex].back : flashcards[flashIndex].front}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    {flashcards[flashIndex].topic} · {flashcards[flashIndex].domain}
                  </div>
                </div>

                {/* Navigation */}
                <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center" }}>
                  <button
                    onClick={() => { setFlashIndex(i => Math.max(0, i - 1)); setFlashFlipped(false); }}
                    disabled={flashIndex === 0}
                    style={{
                      background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8,
                      color: flashIndex === 0 ? "#cbd5e1" : "#475569",
                      padding: "10px 24px", fontSize: 13,
                      cursor: flashIndex === 0 ? "default" : "pointer",
                    }}
                  >← Prev</button>

                  {flashIndex + 1 < flashcards.length ? (
                    <button
                      onClick={() => { setFlashIndex(i => i + 1); setFlashFlipped(false); }}
                      style={{
                        background: "#eff6ff", border: "1px solid #4f8ef7", borderRadius: 8,
                        color: "#1d4ed8", padding: "10px 24px", fontSize: 13, cursor: "pointer",
                      }}
                    >Next →</button>
                  ) : (
                    <button
                      onClick={() => { startRandomFlashcards(); }}
                      style={{
                        background: "#eff6ff", border: "1px solid #4f8ef7", borderRadius: 8,
                        color: "#1d4ed8", padding: "10px 24px", fontSize: 13, cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >🔀 New Set</button>
                  )}

                  <button
                    onClick={() => setMode(MODES.HOME)}
                    style={{
                      background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8,
                      color: "#475569", padding: "10px 24px", fontSize: 13, cursor: "pointer",
                    }}
                  >← Dashboard</button>
                </div>
              </div>
            ) : (
              <div style={{ color: "#f74f8e", padding: 20 }}>Failed to generate flashcards. Please try again.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
