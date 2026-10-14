"use client";

import React, { useState } from "react";
import styles from "./DeskView.module.css";
import { useTaskManager } from "@/context/TaskContext";
import { sounds } from "@/utils/audio";
import NewTaskModal from "@/components/NewTaskModal";
import TaskPaperModal from "@/components/TaskPaperModal";
import CottageGarden from "@/components/CottageGarden";
import { Check, Plus, AlertCircle, Coffee, Sparkles } from "lucide-react";

export default function DeskView() {
  const {
    apps,
    tasks,
    toggleTaskDone,
    staleTasks,
    appBalanceData,
    imbalancedApp,
    waterCups,
    maxWaterCups,
    sipWater,
    setActiveTab,
    setSelectedAppId,
    timerIntervalCount,
    userProfile,
    shelves,
    openDeskMenu,
  } = useTaskManager();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskForPaper, setSelectedTaskForPaper] = useState(null);

  const completedCount = tasks.filter((t) => t.status === "harvested").length;

  return (
    <div className={styles.deskGrid}>
      {/* Left Column: Mascot, Shelves & Multi-App Daily Balance */}
      <div className={styles.leftCol}>
        {/* Profile Card */}
        <div className={`${styles.card} ${styles.profileCard}`}>
          <div className={styles.profileTopRow}>
            <span style={{ fontSize: "0.72rem", color: "#8a806d", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Developer Identity
            </span>
            <button
              className={styles.editCardBtn}
              onClick={() => {
                if (sounds) sounds.playClick();
                openDeskMenu("profile");
              }}
              title="Edit profile & avatar"
            >
              ✏️ Edit
            </button>
          </div>

          <div className={styles.profileHeader}>
            <div
              className={styles.avatarBox}
              onClick={() => {
                if (sounds) sounds.playPop();
                openDeskMenu("profile");
              }}
              style={{ cursor: "pointer" }}
              title="Click to customize avatar"
            >
              <span className="cute-bounce">{userProfile?.avatar || "🧸"}</span>
              <span className={styles.lvlBadge}>Lv. 1</span>
            </div>
            <div className={styles.profileInfo}>
              <h3>
                {userProfile?.name || "SPROUT"}{" "}
                <span style={{ color: "#d9534f" }}>●</span> {userProfile?.handle || "(@^ 0 ^)"}
              </h3>
              <p>{userProfile?.title || "frontend / developer / plant parent"}</p>
              <p>
                <span className={styles.statusDot}></span>
                {userProfile?.mood || "in the coding flow"}
              </p>
            </div>
          </div>

          <p className={styles.profileBio}>
            {userProfile?.bio || "Hello friend! Welcome to your cozy desk. Take sips of water, stretch often, and celebrate small commits! ☕🌱"}
          </p>

          <div className={styles.profilePills}>
            <span className={styles.pillBadge}>🌱 {completedCount} tasks done</span>
            <span className={`${styles.pillBadge} ${styles.pillButter}`}>
              🍵 {waterCups} cups sipped
            </span>
            <span className={`${styles.pillBadge} ${styles.pillRose}`}>
              ✨ {timerIntervalCount > 0 ? `pomodoro #${timerIntervalCount}` : "ready to focus"}
            </span>
          </div>
        </div>

        {/* Find My Shelves Card */}
        <div className={styles.card}>
          <div className={styles.shelvesHeaderRow}>
            <div className={styles.shelvesHeader}>
              Find My Shelves! 🌸
            </div>
            <button
              className={styles.editCardBtn}
              onClick={() => {
                if (sounds) sounds.playClick();
                openDeskMenu("shelves");
              }}
              title="Manage shelf links and bookmarks"
            >
              ⚙️ Manage
            </button>
          </div>

          <div className={styles.shelvesList}>
            {(!shelves || shelves.length === 0) ? (
              <div style={{ fontSize: "0.78rem", color: "#8a806d", fontStyle: "italic", textAlign: "center", padding: "8px 0" }}>
                No shelves yet. Click Manage to add links!
              </div>
            ) : (
              shelves.map((shelf) => {
                if (shelf.isExternal && shelf.url) {
                  return (
                    <a
                      key={shelf.id}
                      href={shelf.url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.shelfItem}
                      onClick={() => sounds && sounds.playClick()}
                    >
                      <span>{shelf.icon || "🔖"}</span> {shelf.label}
                    </a>
                  );
                }
                return (
                  <button
                    key={shelf.id}
                    type="button"
                    className={styles.shelfItem}
                    style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", width: "100%", font: "inherit" }}
                    onClick={() => {
                      if (sounds) sounds.playClick();
                      if (shelf.action === "rain") sounds && sounds.toggleAmbient("rain");
                      else if (shelf.action === "cafe") sounds && sounds.toggleAmbient("cafe");
                      else if (shelf.action === "sprint") setActiveTab("sprint");
                      else if (shelf.action === "notes") setActiveTab("notes");
                      else if (shelf.action === "desk") setActiveTab("desk");
                      else if (shelf.url) window.open(shelf.url, "_blank");
                    }}
                  >
                    <span>{shelf.icon || "🔖"}</span> {shelf.label}
                  </button>
                );
              })
            )}
          </div>

          <div className={styles.tipBox}>
            🧺 <strong>Tip:</strong> check the Daily Balance meter to ensure every app gets loved!
          </div>
        </div>

        {/* Multi-App Daily Workload Balance Card */}
        <div className={styles.appBalanceCard}>
          <div className={styles.balanceTitle}>
            <span>⚖️ Daily App Balance</span>
            <span style={{ fontSize: "0.75rem", color: "#657d4f" }}>
              {appBalanceData.filter((a) => a.completed > 0).length}/{apps.length} Apps Active
            </span>
          </div>

          {appBalanceData.map((app) => (
            <div
              key={app.id}
              className={styles.appMeterRow}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedAppId(app.id);
                setActiveTab("sprint");
              }}
              title="Click to view app sprint board"
            >
              <div className={styles.appMeterHeader}>
                <span>
                  {app.icon} {app.name}
                </span>
                <span style={{ color: app.metQuota ? "#5f7a49" : "#a88132" }}>
                  {app.completed}/{app.quota} {app.metQuota ? "✨" : ""}
                </span>
              </div>
              <div className={styles.appProgressBar}>
                <div
                  className={styles.appProgressFill}
                  style={{
                    width: `${app.percentage}%`,
                    backgroundColor: app.color,
                  }}
                />
              </div>
            </div>
          ))}

          {imbalancedApp && (
            <div
              style={{
                marginTop: "10px",
                background: "#fff9ea",
                border: "1px dashed #e8c878",
                borderRadius: "8px",
                padding: "8px",
                fontSize: "0.74rem",
                color: "#7e5e1a",
                lineHeight: 1.35,
              }}
            >
              ⚠️ <strong>Balance Tip:</strong> You&apos;ve made great progress on {imbalancedApp.name}! Make sure other apps get at least 1 commit before end of day.
            </div>
          )}
        </div>
      </div>

      {/* Main Right Column: Widgets & Current Quests */}
      <div className={styles.mainCol}>
        {/* Top Row: Sprout's Cottage Garden & Daily Intention */}
        <div className={styles.topWidgetsRow}>
          {/* Dynamic Weather & Pet Playground Garden */}
          <CottageGarden />

          {/* Daily Intention & Water Meter */}
          <div className={styles.intentionCard}>
            <div className={styles.starPin}>★</div>
            <div className={styles.intentionHeader}>
              <span
                className={styles.intentionTitle}
                onClick={() => {
                  if (sounds) sounds.playClick();
                  openDeskMenu("profile");
                }}
                style={{ cursor: "pointer" }}
                title="Click to edit daily intention"
              >
                Daily Intention 🍯 ✏️
              </span>
              <span className={styles.paceBadge}>gentle pace</span>
            </div>
            <p className={styles.intentionQuote}>
              &ldquo;{userProfile?.dailyIntention || "Keep code clean, sip matcha often, and don't worry if a bug takes time. We nurture our garden one seed at a time."}&rdquo;
            </p>
            <div className={styles.waterMeterBox}>
              <span>
                Today&apos;s Focus Water Meter: {waterCups} / {maxWaterCups} Cups 🍵
              </span>
              <button className={styles.sipBtn} onClick={sipWater}>
                + Sip Cup
              </button>
            </div>
          </div>
        </div>

        {/* Stale Task Reminder Banner (if any) */}
        {staleTasks.length > 0 && (
          <div className={styles.staleAlertBanner}>
            <div className={styles.staleContent}>
              <span className={styles.staleIcon}>⏰</span>
              <div>
                <strong>Gentle Reminder:</strong> &ldquo;{staleTasks[0].title}&rdquo; has been waiting for {staleTasks[0].createdDaysAgo} days!
                <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>
                  Let&apos;s brew a cup and take 15 minutes to unblock it today.
                </div>
              </div>
            </div>
            <button
              className={styles.staleActionBtn}
              onClick={() => setActiveTab("sprint")}
            >
              Tackle in Sprint →
            </button>
          </div>
        )}

        {/* Current Quests & Checklist */}
        <div className={styles.questsContainer}>
          <div className={styles.questsHeader}>
            <div className={styles.questsTitle}>
              <span>📋</span> Current Quests & Checklist
            </div>
            <button
              className={styles.newQuestBtn}
              onClick={() => {
                if (sounds) sounds.playClick();
                setIsModalOpen(true);
              }}
            >
              <Plus size={15} />
              <span>new quest</span>
            </button>
          </div>

          <div className={styles.questList}>
            {tasks.length === 0 ? (
              <div className={styles.emptyQuests}>
                <div className={styles.emptyEmoji}>🌱</div>
                <div className={styles.emptyTitle}>No quests planted yet!</div>
                <p className={styles.emptyDesc}>
                  Your desk is fresh and clear. Click <strong>+ new quest</strong> to plant your first focus task.
                </p>
              </div>
            ) : (
              tasks.map((task) => {
                const isDone = task.status === "harvested";
                const app = apps.find((a) => a.id === task.appId);

                // tag color helper
                const getTagClass = () => {
                  switch (task.type) {
                    case "bugfix":
                      return styles.tagBugfix;
                    case "backend":
                      return styles.tagBackend;
                    case "rest":
                      return styles.tagRest;
                    case "ui-flower":
                      return styles.tagUi;
                    case "polish":
                      return styles.tagPolish;
                    default:
                      return styles.tagSprint;
                  }
                };

                return (
                  <div key={task.id} className={styles.questItem}>
                    <button
                      className={`${styles.questCheckbox} ${isDone ? styles.questChecked : ""}`}
                      onClick={() => toggleTaskDone(task.id)}
                      title={isDone ? "Mark as in progress" : "Mark completed"}
                    >
                      {isDone && <Check size={14} />}
                    </button>

                    <div
                      className={styles.questBody}
                      onClick={() => {
                        if (sounds) sounds.playClick();
                        setSelectedTaskForPaper(task);
                      }}
                      style={{ cursor: "pointer" }}
                      title="Click to view full paper note & details"
                    >
                      <div className={styles.questTopMeta}>
                        <span className={`${styles.tagBadge} ${getTagClass()}`}>
                          {task.typeLabel || task.type.toUpperCase()}
                        </span>
                        {app && (
                          <span className={styles.appTagPill}>
                            {app.icon} {app.name}
                          </span>
                        )}
                        {task.priority === "urgent" && (
                          <span style={{ fontSize: "0.7rem", color: "#d9534f", fontWeight: 800 }}>
                            🔥 URGENT
                          </span>
                        )}
                        <button
                          className={styles.questNoteBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (sounds) sounds.playClick();
                            setSelectedTaskForPaper(task);
                          }}
                          title="Open full paper note & edit details"
                        >
                          📄 Note
                        </button>
                      </div>

                      <div
                        className={`${styles.questTitleText} ${isDone ? styles.questDoneText : ""}`}
                      >
                        {task.title}
                      </div>

                      {task.description && (
                        <p className={styles.questDesc}>{task.description}</p>
                      )}

                      <div className={styles.taskTeacups}>
                        <span>{"🍵".repeat(task.teacups || 1)}</span>
                        <span>• ticket {task.ticketNumber}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      <NewTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Paper Task Details & Edit Modal */}
      <TaskPaperModal
        task={selectedTaskForPaper}
        isOpen={Boolean(selectedTaskForPaper)}
        onClose={() => setSelectedTaskForPaper(null)}
      />
    </div>
  );
}
