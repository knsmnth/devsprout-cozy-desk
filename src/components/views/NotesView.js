"use client";

import React, { useState } from "react";
import styles from "./NotesView.module.css";
import { useTaskManager } from "@/context/TaskContext";
import { sounds } from "@/utils/audio";
import { Check, Copy, CheckCheck, Plus } from "lucide-react";
import confetti from "canvas-confetti";

export default function NotesView() {
  const {
    scratchpadCode,
    setScratchpadCode,
    learnings,
    setLearnings,
    stamps,
    addStamp,
    mascotQuote,
  } = useTaskManager();

  const [activeTag, setActiveTag] = useState("daily");
  const [copied, setCopied] = useState(false);
  const [newLearningText, setNewLearningText] = useState("");

  const handleCopyCode = () => {
    navigator.clipboard.writeText(scratchpadCode);
    setCopied(true);
    if (sounds) sounds.playPop();
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleLearning = (id) => {
    if (sounds) sounds.playPop();
    setLearnings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleAddLearning = (e) => {
    e.preventDefault();
    if (!newLearningText.trim()) return;
    if (sounds) sounds.playClick();
    setLearnings((prev) => [
      ...prev,
      { id: `l-${Date.now()}`, text: newLearningText.trim(), done: false },
    ]);
    setNewLearningText("");
  };

  const triggerMascotReaction = () => {
    if (sounds) sounds.playPop();
    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.8, x: 0.2 },
      colors: ["#78995a", "#f9d976"],
    });
  };

  return (
    <div className={styles.notesGrid}>
      {/* Left Column */}
      <div className={styles.leftCol}>
        {/* Notebooks & Tags */}
        <div className={styles.card}>
          <div className={styles.notebooksHeader}>Notebooks & Tags 🍯</div>
          <div className={styles.tagsList}>
            <div
              className={`${styles.tagItem} ${activeTag === "daily" ? styles.tagActive : ""}`}
              onClick={() => {
                if (sounds) sounds.playClick();
                setActiveTag("daily");
              }}
            >
              <span>💭 daily dev thoughts</span>
              <span className={styles.countPill}>{learnings.length}</span>
            </div>
            <div
              className={`${styles.tagItem} ${activeTag === "snippets" ? styles.tagActive : ""}`}
              onClick={() => {
                if (sounds) sounds.playClick();
                setActiveTag("snippets");
              }}
            >
              <span>⚡ code snippets</span>
            </div>
            <div
              className={`${styles.tagItem} ${activeTag === "bugs" ? styles.tagActive : ""}`}
              onClick={() => {
                if (sounds) sounds.playClick();
                setActiveTag("bugs");
              }}
            >
              <span>🐞 bug notes</span>
            </div>
            <div
              className={`${styles.tagItem} ${activeTag === "reading" ? styles.tagActive : ""}`}
              onClick={() => {
                if (sounds) sounds.playClick();
                setActiveTag("reading");
              }}
            >
              <span>🍵 reading list</span>
            </div>
          </div>

          <div
            className={styles.newScrapbookBtn}
            onClick={() => {
              if (sounds) sounds.playClick();
              alert("New scrapbook tab added to your cozy shelf! 📖");
            }}
          >
            + new scrapbook page
          </div>
        </div>

        {/* Warm Reminder Card */}
        <div className={styles.warmReminderCard}>
          <div className={styles.starBadge}>★</div>
          <div className={styles.warmTitle}>WARM REMINDER</div>
          <p className={styles.warmQuote}>&ldquo;{mascotQuote}&rdquo;</p>
          <div className={styles.warmMeta}>
            <span>🍵 matcha: warm</span>
            <span>•</span>
            <span>✨ mood: snug</span>
          </div>
        </div>

        {/* Mascot Card */}
        <div
          className={styles.mascotCard}
          onClick={triggerMascotReaction}
          title="Click to cheer Sprout!"
        >
          <div className={styles.mascotIconBox}>
            <span className="cute-bounce">🧸</span>
          </div>
          <div>
            <div className={styles.mascotTitle}>Sprout&apos;s Desk Mascot</div>
            <div className={styles.mascotSub}>currently napping on keyboard... zzz</div>
          </div>
        </div>
      </div>

      {/* Right Column: Scratchpad & Code Snippets */}
      <div className={styles.scratchpadCard}>
        <div className={styles.entryBanner}>★ TODAY&apos;S ENTRY ★</div>

        <div className={styles.scratchpadHeader}>
          <h2 className={styles.scratchpadTitle}>
            <span>📝</span> Today&apos;s Scratchpad & Code Snippets
          </h2>
          <div className={styles.datePill}>
            <span>🗓️</span> today • sunny afternoon
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className={styles.codeBox}>
          <div className={styles.codeHeader}>
            <div className={styles.codeTitle}>
              <span>⚡</span> cute-helper.ts (snug hydration check)
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span className={styles.verifiedBadge}>verified cozy</span>
              <button
                onClick={handleCopyCode}
                style={{ fontSize: "0.75rem", color: "#666", display: "flex", alignItems: "center", gap: "3px" }}
                title="Copy code"
              >
                {copied ? <CheckCheck size={14} color="#5f7a49" /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>

          <textarea
            value={scratchpadCode}
            onChange={(e) => setScratchpadCode(e.target.value)}
            className={styles.codeTextarea}
            rows={7}
            placeholder="// Paste quick snippets or scratchpad code here..."
          />
        </div>

        {/* What I Learned Today */}
        <div className={styles.learnedSection}>
          <div className={styles.learnedTitle}>
            <span>🍓</span> What I learned today
          </div>

          <div className={styles.learnList}>
            {learnings.length === 0 ? (
              <div style={{ padding: "16px", color: "#8c8371", fontSize: "0.82rem", fontStyle: "italic", textAlign: "center", background: "#faf8f2", borderRadius: "8px", border: "1px dashed #e2dac9" }}>
                No micro-learnings jotted down yet today! Add one below 🍓
              </div>
            ) : (
              learnings.map((item) => (
                <div key={item.id} className={styles.learnItem}>
                  <button
                    className={`${styles.learnCheck} ${item.done ? styles.learnChecked : ""}`}
                    onClick={() => toggleLearning(item.id)}
                  >
                    {item.done && <Check size={12} />}
                  </button>
                  <span style={{ textDecoration: item.done ? "line-through" : "none", opacity: item.done ? 0.7 : 1 }}>
                    {item.text}
                  </span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddLearning} style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="+ jot down one cute micro-learning..."
              value={newLearningText}
              onChange={(e) => setNewLearningText(e.target.value)}
              style={{
                flex: 1,
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1.5px solid #ded6c5",
                fontSize: "0.82rem",
                background: "#faf8f2",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#657d4f",
                color: "#fff",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: 700,
              }}
            >
              Add
            </button>
          </form>
        </div>

        {/* Bottom Stamps & Reactions Bar */}
        <div className={styles.stampsBar}>
          <div className={styles.stampsGroup}>
            <span className={styles.stampsLabel}>Stamps & Reactions:</span>
            <button
              className={styles.stampBtn}
              onClick={() => addStamp("bear")}
              title={`Bear Stamp: ${stamps.bear}`}
            >
              🧸
            </button>
            <button
              className={styles.stampBtn}
              onClick={() => addStamp("strawberry")}
              title={`Strawberry Stamp: ${stamps.strawberry}`}
            >
              🍓
            </button>
            <button
              className={styles.stampBtn}
              onClick={() => addStamp("matcha")}
              title={`Matcha Cup: ${stamps.matcha}`}
            >
              🍵
            </button>
            <button
              className={styles.stampBtn}
              onClick={() => addStamp("sparkle")}
              title={`Sparkles: ${stamps.sparkle}`}
            >
              ✨
            </button>
          </div>

          <div className={styles.autosaveBadge}>
            <span style={{ color: "#5f7a49" }}>●</span> all notes autosaved with care
          </div>
        </div>
      </div>
    </div>
  );
}
