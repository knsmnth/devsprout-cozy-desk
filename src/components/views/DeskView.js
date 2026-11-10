"use client";

import React, { useState, useEffect, useMemo } from "react";
import styles from "./DeskView.module.css";
import { useTaskManager } from "@/context/TaskContext";
import { sounds } from "@/utils/audio";
import NewTaskModal from "@/components/NewTaskModal";
import TaskPaperModal from "@/components/TaskPaperModal";
import CottageGarden from "@/components/CottageGarden";
import {
  Check,
  Plus,
  AlertCircle,
  Coffee,
  Sparkles,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function DeskView() {
  const {
    apps,
    tasks,
    toggleTaskDone,
    updateTaskStatus,
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
    levelData,
    shuffleDailyQuote,
  } = useTaskManager();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskForPaper, setSelectedTaskForPaper] = useState(null);
  const [questViewMode, setQuestViewMode] = useState("bento"); // 'bento' | 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8); // at least 8-10 quests per page
  const [completingTaskIds, setCompletingTaskIds] = useState(new Set());
  const [isQuoteShuffling, setIsQuoteShuffling] = useState(false);

  // Filter out completed (harvested) tasks for Current Quests & Checklist
  const activeTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== "harvested");
  }, [tasks]);

  const inBloomTasks = tasks.filter((t) => t.status === "in-bloom");

  // Restore saved view and page size preferences
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedMode = localStorage.getItem("devsprout_quest_view_mode");
        if (savedMode === "bento" || savedMode === "list") {
          setQuestViewMode(savedMode);
        }
        const savedSize = localStorage.getItem("devsprout_quest_page_size");
        if (savedSize) {
          const num = parseInt(savedSize, 10);
          if (num === 8 || num === 10) {
            setItemsPerPage(num);
          }
        }
      } catch (e) {
        // ignore storage errors
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleViewModeChange = (mode) => {
    if (sounds) sounds.playClick();
    setQuestViewMode(mode);
    setCurrentPage(1);
    try {
      localStorage.setItem("devsprout_quest_view_mode", mode);
    } catch (e) { }
  };

  const handlePageSizeChange = (size) => {
    if (sounds) sounds.playClick();
    setItemsPerPage(size);
    setCurrentPage(1);
    try {
      localStorage.setItem("devsprout_quest_page_size", String(size));
    } catch (e) { }
  };

  // Smooth completion handler: checkmark fills, celebratory chime, smooth 350ms fade-out
  const handleCheckTask = (taskId, e) => {
    if (e) e.stopPropagation();
    if (sounds) sounds.playPop();

    setCompletingTaskIds((prev) => new Set(prev).add(taskId));

    setTimeout(() => {
      toggleTaskDone(taskId);
      setCompletingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }, 350);
  };

  // Pagination calculations: strictly based on active quests
  const totalPages = Math.max(1, Math.ceil(activeTasks.length / itemsPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedTasks = activeTasks.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  // Auto-step back if harvesting leaves currentPage beyond new totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const completedCount = tasks.filter((t) => t.status === "harvested").length;

  // tag color helper
  const getTagClass = (type) => {
    switch (type) {
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
              <span className={styles.lvlBadge}>Lv. {levelData?.level || 1}</span>
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

          {/* Cozy Developer Level Progression */}
          <div
            className={styles.levelCard}
            onClick={() => {
              if (sounds) sounds.playPop();
              openDeskMenu("profile");
            }}
            title="Click to view level progression & rewards"
          >
            <div className={styles.levelCardHeader}>
              <div className={styles.levelTitleRow}>
                <span className={styles.levelIcon}>{levelData?.icon || "🌱"}</span>
                <span className={styles.levelName}>
                  Lv. {levelData?.level || 1} • {levelData?.title || "Cozy Sprout"}
                </span>
              </div>
              <span className={styles.levelXpText}>
                {levelData?.currentLevelXp ?? 0} / {levelData?.neededForNext ?? 100} XP
              </span>
            </div>
            <div className={styles.levelProgressBar}>
              <div
                className={styles.levelProgressFill}
                style={{ width: `${levelData?.progressPercent ?? 0}%` }}
              />
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
            🧺 <strong>Tip:</strong> check the Daily Task Goals meter to track your daily progress!
          </div>
        </div>

        {/* Multi-App Daily Workload Balance Card */}
        <div className={styles.appBalanceCard}>
          <div className={styles.balanceTitle}>
            <span>🎯 Daily Task Goals</span>
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
                background: "var(--cozy-honey-light, #fff9ea)",
                border: "1px dashed var(--cozy-honey, #e8c878)",
                borderRadius: "8px",
                padding: "8px",
                fontSize: "0.74rem",
                color: "var(--cozy-text-dark, #7e5e1a)",
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
              <div className={styles.intentionTitleGroup}>
                <span className={styles.intentionTitle}>Daily Intention 🍯</span>
                <button
                  type="button"
                  className={styles.deskShuffleBtn}
                  onClick={() => {
                    if (sounds) sounds.playPop();
                    setIsQuoteShuffling(true);
                    setTimeout(() => {
                      shuffleDailyQuote();
                      setIsQuoteShuffling(false);
                    }, 180);
                  }}
                  title="Roll another inspiring quote for today"
                >
                  <Sparkles size={11} />
                  <span>Shuffle</span>
                </button>
              </div>
              <span className={styles.paceBadge}>gentle pace</span>
            </div>
            <p className={`${styles.intentionQuote} ${isQuoteShuffling ? styles.quoteFading : ""}`}>
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

        {/* Currently Blooming / In Focus Spotlight */}
        {inBloomTasks.length > 0 && (
          <div className={styles.bloomingSpotlight}>
            <div className={styles.bloomingHeader}>
              <div className={styles.bloomingTitle}>
                <span className={styles.bloomingPulsingIcon}>🌻</span>
                <span>Currently Blooming &amp; In Focus</span>
                <span className={styles.bloomingBadge}>{inBloomTasks.length} active</span>
              </div>
              <button
                type="button"
                className={styles.sprintJumpBtn}
                onClick={() => {
                  if (sounds) sounds.playClick();
                  setActiveTab("sprint");
                }}
                title="Open Sprint Harvest Board"
              >
                View in Sprint →
              </button>
            </div>

            <div className={styles.bloomingCardsList}>
              {inBloomTasks.map((task) => {
                const app = apps.find((a) => a.id === task.appId);
                return (
                  <div
                    key={task.id}
                    className={styles.bloomingCard}
                    onClick={() => {
                      if (sounds) sounds.playClick();
                      setSelectedTaskForPaper(task);
                    }}
                    title="Click to view full paper note & details"
                  >
                    <div className={styles.bloomingCardLeft}>
                      <div className={styles.bloomingCardTitleRow}>
                        {app && (
                          <span
                            className={styles.bloomingAppPill}
                            style={{
                              borderColor: app.color || "#d48b38",
                              color: app.color || "#6b5938",
                              background: app.color ? `${app.color}18` : undefined,
                            }}
                          >
                            {app.icon} {app.name}
                          </span>
                        )}
                        <span className={styles.bloomingTaskTitle}>{task.title}</span>
                        {task.priority === "urgent" && (
                          <span className={styles.bentoUrgent} title="Urgent Priority">
                            🔥 URGENT
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className={styles.bloomingDesc}>{task.description}</p>
                      )}
                    </div>

                    <div className={styles.bloomingCardActions}>
                      <button
                        type="button"
                        className={styles.bloomingHarvestBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (sounds) sounds.playHarvest();
                          updateTaskStatus(task.id, "harvested");
                        }}
                        title="Harvest task (Mark Done)"
                      >
                        🍯 Harvest
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Current Quests & Checklist */}
        <div className={styles.questsContainer}>
          <div className={styles.questsHeader}>
            <div className={styles.questsTitle}>
              <span>📋</span> Current Quests & Checklist
              {activeTasks.length > 0 && (
                <span className={styles.questsCountBadge}>{activeTasks.length}</span>
              )}
            </div>

            <div className={styles.headerRightActions}>
              {/* Cute View Toggle: Bento Cards vs List */}
              <div className={styles.viewToggleGroup} role="group" aria-label="Quest view style">
                <button
                  type="button"
                  className={`${styles.viewToggleBtn} ${questViewMode === "bento" ? styles.viewToggleActive : ""}`}
                  onClick={() => handleViewModeChange("bento")}
                  title="Bento Card Grid (2-column compact cards)"
                >
                  <LayoutGrid size={13} />
                  <span>Bento</span>
                </button>
                <button
                  type="button"
                  className={`${styles.viewToggleBtn} ${questViewMode === "list" ? styles.viewToggleActive : ""}`}
                  onClick={() => handleViewModeChange("list")}
                  title="Classic List View"
                >
                  <List size={13} />
                  <span>List</span>
                </button>
              </div>

              {/* New Quest Button */}
              <button
                type="button"
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
          </div>

          {activeTasks.length === 0 ? (
            <div className={styles.emptyQuests}>
              <div className={styles.emptyEmoji}>🌱</div>
              <div className={styles.emptyTitle}>
                {tasks.length > 0 ? "All quests harvested! 🎉" : "No quests planted yet!"}
              </div>
              <p className={styles.emptyDesc}>
                {tasks.length > 0
                  ? "Your desk is clear of pending tasks. Visit Sprint Harvest to admire completed work or plant a new quest."
                  : "Your desk is fresh and clear. Click + new quest to plant your first focus task."}
              </p>
            </div>
          ) : questViewMode === "bento" ? (
            /* Bento Cards Layout: 2 Columns, Compact & Cute */
            <div className={styles.bentoGrid}>
              {paginatedTasks.map((task) => {
                const isCompleting = completingTaskIds.has(task.id);
                const isDone = task.status === "harvested" || isCompleting;
                const app = apps.find((a) => a.id === task.appId);

                return (
                  <div
                    key={task.id}
                    className={`${styles.bentoCard} ${isDone ? styles.bentoCardDone : ""} ${isCompleting ? styles.bentoCardCompleting : ""}`}
                    onClick={() => {
                      if (sounds) sounds.playClick();
                      setSelectedTaskForPaper(task);
                    }}
                    title="Click to view full paper note & details"
                  >
                    {/* Top Row: Checkbox, Badge & Note */}
                    <div className={styles.bentoTopRow}>
                      <div className={styles.bentoTopLeft}>
                        <button
                          type="button"
                          className={`${styles.questCheckbox} ${styles.bentoCheckbox} ${isDone ? styles.questChecked : ""}`}
                          onClick={(e) => handleCheckTask(task.id, e)}
                          title="Mark completed (Harvest)"
                        >
                          {isDone && <Check size={12} strokeWidth={3} />}
                        </button>

                        <span className={`${styles.tagBadge} ${styles.bentoTagBadge} ${getTagClass(task.type)}`}>
                          {task.typeLabel || task.type?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Title & Description Preview */}
                    <div className={styles.bentoContent}>
                      <div className={`${styles.bentoTitle} ${isDone ? styles.questDoneText : ""}`}>
                        {task.title}
                      </div>
                      {task.description && (
                        <p className={styles.bentoDesc}>{task.description}</p>
                      )}
                    </div>

                    {/* Bottom Row: App Pill + Urgency + Teacups & Ticket */}
                    <div className={styles.bentoBottomRow}>
                      <div className={styles.bentoAppPill}>
                        {app ? (
                          <span
                            className={styles.bentoAppName}
                            style={{
                              color: app.color || undefined,
                              fontWeight: 700,
                            }}
                            title={app.name}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                backgroundColor: app.color || "#8c8371",
                                marginRight: 4,
                              }}
                            />
                            {app.icon} {app.name}
                          </span>
                        ) : (
                          <span className={styles.bentoTicket}>ticket {task.ticketNumber}</span>
                        )}
                        {task.priority === "urgent" && (
                          <span className={styles.bentoUrgent} title="Urgent Priority">🔥 URGENT</span>
                        )}
                      </div>

                      <div className={styles.bentoMetaRight}>
                        <span className={styles.bentoTeacups}>{"🍵".repeat(Math.min(task.teacups || 1, 4))}</span>
                        {app && task.ticketNumber && (
                          <span className={styles.bentoTicket}>#{task.ticketNumber}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Classic List View */
            <div className={styles.questList}>
              {paginatedTasks.map((task) => {
                const isCompleting = completingTaskIds.has(task.id);
                const isDone = task.status === "harvested" || isCompleting;
                const app = apps.find((a) => a.id === task.appId);

                return (
                  <div
                    key={task.id}
                    className={`${styles.questItem} ${isCompleting ? styles.questItemCompleting : ""}`}
                    onClick={() => {
                      if (sounds) sounds.playClick();
                      setSelectedTaskForPaper(task);
                    }}
                    title="Click to view full paper note & details"
                    style={{ cursor: "pointer" }}
                  >
                    <button
                      type="button"
                      className={`${styles.questCheckbox} ${isDone ? styles.questChecked : ""}`}
                      onClick={(e) => handleCheckTask(task.id, e)}
                      title="Mark completed"
                    >
                      {isDone && <Check size={14} />}
                    </button>

                    <div className={styles.questBody}>
                      <div className={styles.questTopMeta}>
                        <span className={`${styles.tagBadge} ${getTagClass(task.type)}`}>
                          {task.typeLabel || task.type?.toUpperCase()}
                        </span>
                        {app && (
                          <span
                            className={styles.appTagPill}
                            style={{
                              borderColor: app.color || undefined,
                              color: app.color || undefined,
                              background: app.color ? `${app.color}15` : undefined,
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                backgroundColor: app.color || "#8c8371",
                                marginRight: 4,
                              }}
                            />
                            {app.icon} {app.name}
                          </span>
                        )}
                        {task.priority === "urgent" && (
                          <span style={{ fontSize: "0.7rem", color: "#d9534f", fontWeight: 800 }}>
                            🔥 URGENT
                          </span>
                        )}
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
              })}
            </div>
          )}

          {/* Cute Page-by-Page Pagination Bar */}
          {activeTasks.length > 0 && (
            <div className={styles.paginationRow}>
              <div className={styles.pageInfo}>
                <span className={styles.pageInfoIcon}>🌱</span>
                <span>
                  Page <strong>{safePage}</strong> of <strong>{totalPages}</strong>
                  <span className={styles.pageInfoCount}>({activeTasks.length} active)</span>
                </span>

                {/* Per Page Selector: 8 or 10 */}
                <div className={styles.pageSizeWrapper}>
                  <span className={styles.pageSizeLabel}>Per page:</span>
                  <div className={styles.pageSizePills}>
                    {[8, 10].map((size) => (
                      <button
                        key={size}
                        type="button"
                        className={`${styles.pageSizeBtn} ${itemsPerPage === size ? styles.pageSizeBtnActive : ""}`}
                        onClick={() => handlePageSizeChange(size)}
                        title={`Show ${size} quests per page`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {totalPages > 1 && (
                <div className={styles.paginationBtns}>
                  <button
                    type="button"
                    className={styles.pageNavBtn}
                    onClick={() => {
                      if (safePage > 1) {
                        if (sounds) sounds.playClick();
                        setCurrentPage((p) => Math.max(1, p - 1));
                      }
                    }}
                    disabled={safePage <= 1}
                    title="Previous Page"
                  >
                    <ChevronLeft size={14} />
                    <span>Prev</span>
                  </button>

                  <div className={styles.pagePills}>
                    {Array.from({ length: totalPages }, (_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = pageNum === safePage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          className={`${styles.pagePill} ${isActive ? styles.pagePillActive : ""}`}
                          onClick={() => {
                            if (sounds) sounds.playClick();
                            setCurrentPage(pageNum);
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className={styles.pageNavBtn}
                    onClick={() => {
                      if (safePage < totalPages) {
                        if (sounds) sounds.playClick();
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                      }
                    }}
                    disabled={safePage >= totalPages}
                    title="Next Page"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
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
