"use client";

import React, { useState } from "react";
import styles from "./SprintView.module.css";
import { useTaskManager } from "@/context/TaskContext";
import { sounds } from "@/utils/audio";
import NewTaskModal from "@/components/NewTaskModal";
import TaskPaperModal from "@/components/TaskPaperModal";
import AppleBasket from "@/components/AppleBasket";
import { Trash2 } from "lucide-react";

const getPriorityEmoji = (priority) => {
  switch (priority) {
    case "urgent":
      return "🔥";
    case "high":
      return "🌸";
    case "cozy":
      return "🌱";
    case "normal":
    default:
      return "🍵";
  }
};

const getPriorityLabel = (priority) => {
  switch (priority) {
    case "urgent":
      return "Urgent (ASAP)";
    case "high":
      return "High (Today)";
    case "cozy":
      return "Cozy (Later)";
    case "normal":
    default:
      return "Normal (Gentle)";
  }
};

export default function SprintView() {
  const {
    apps,
    tasks,
    updateTaskStatus,
    deleteTask,
    selectedAppId,
    setSelectedAppId,
    selectAppWithTheme,
    taskCategories,
  } = useTaskManager();

  const [activeFilter, setActiveFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskForPaper, setSelectedTaskForPaper] = useState(null);
  const [fallingApples, setFallingApples] = useState([]);
  const [isBasketBouncing, setIsBasketBouncing] = useState(false);

  const triggerAppleDrop = () => {
    const appleId = Date.now() + Math.random();
    setFallingApples((prev) => [...prev, { id: appleId }]);
    setIsBasketBouncing(true);

    setTimeout(() => {
      setFallingApples((prev) => prev.filter((a) => a.id !== appleId));
    }, 900);

    setTimeout(() => {
      setIsBasketBouncing(false);
    }, 500);
  };

  const handleHarvestTask = (taskId) => {
    if (sounds?.playHarvest) {
      sounds.playHarvest();
    } else if (sounds?.playPop) {
      sounds.playPop();
    }
    triggerAppleDrop();
    updateTaskStatus(taskId, "harvested");
  };

  const handleOpenPaper = (task) => {
    if (sounds) sounds.playClick();
    setSelectedTaskForPaper(task);
  };

  // Filter tasks by selected app and dynamic category
  const filteredTasks = tasks.filter((t) => {
    if (selectedAppId !== "all" && t.appId !== selectedAppId) return false;
    if (activeFilter === "all") return true;
    return t.type === activeFilter;
  });

  const sproutingTasks = filteredTasks.filter((t) => t.status === "sprouting");
  const inBloomTasks = filteredTasks.filter((t) => t.status === "in-bloom");
  const harvestedTasks = filteredTasks.filter((t) => t.status === "harvested");

  const totalFiltered = filteredTasks.length;
  const doneFiltered = harvestedTasks.length;
  const progressPercent = totalFiltered > 0 ? Math.round((doneFiltered / totalFiltered) * 100) : 0;

  const currentAppObj = apps.find((a) => a.id === selectedAppId);

  // Helper to switch app and project theme
  const handleSelectApp = (appId) => {
    if (sounds) sounds.playClick();
    if (typeof selectAppWithTheme === "function") {
      selectAppWithTheme(appId);
    } else {
      setSelectedAppId(appId);
    }
  };

  return (
    <div className={styles.sprintContainer}>
      {/* Multi-App Filter Bar with Theme Association */}
      <div className={styles.appTabsBar}>
        <button
          className={`${styles.appTabBtn} ${selectedAppId === "all" ? styles.appTabBtnActive : ""}`}
          onClick={() => handleSelectApp("all")}
        >
          <span>🌐</span> All Apps & Portals ({tasks.length})
        </button>
        {apps.map((app) => {
          const count = tasks.filter((t) => t.appId === app.id).length;
          return (
            <button
              key={app.id}
              className={`${styles.appTabBtn} ${selectedAppId === app.id ? styles.appTabBtnActive : ""}`}
              onClick={() => handleSelectApp(app.id)}
            >
              <span>{app.icon}</span> {app.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Top Sprint Banner & Quick Filters */}
      <div className={styles.topRow}>
        {/* Sprint Hero Card with Progress, Basket & Internal Action Bar */}
        <div className={styles.sprintHero}>
          <div className={styles.sprintHeroMain}>
            <div className={styles.acornBadge}>
              <span>🌰</span>
              <span className={styles.sprintPill}>SPRINT</span>
            </div>

            <div className={styles.sprintDetails}>
              <div className={styles.sprintTitleRow}>
                <h2 className={styles.sprintTitle}>
                  {currentAppObj ? `${currentAppObj.name} Quests` : "Current Workspace Sprint"}
                </h2>
                <span className={styles.versionTag}>(active)</span>
                <span className={styles.daysTag}>🌿 ongoing</span>
              </div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progressPercent}%` }}
                >
                  {progressPercent > 8 && (
                    <span className={styles.progressSproutEmoji}>🌱</span>
                  )}
                </div>
              </div>

              <div className={styles.sprintSubtext}>
                🌱 {progressPercent}% sprouted & nurtured • {doneFiltered} / {totalFiltered} tasks harvested
              </div>
            </div>

            {/* Apple Basket with Falling Apple Reaction */}
            <div className={`${styles.harvestJarBox} ${isBasketBouncing ? styles.basketBounce : ""}`}>
              <div className={styles.basketTopAnimation}>
                {fallingApples.map((apple) => (
                  <span key={apple.id} className={styles.fallingApple}>
                    🍎
                  </span>
                ))}
              </div>

              <div className={styles.basketVisual}>
                <AppleBasket
                  count={harvestedTasks.length}
                  isBouncing={isBasketBouncing}
                  width={76}
                  height={70}
                />
              </div>

              <span className={styles.jarTitle}>Harvest Basket</span>
              <span className={styles.jarSubtitle}>
                {harvestedTasks.length} apple{harvestedTasks.length === 1 ? "" : "s"} collected
              </span>
            </div>
          </div>

          {/* Action Row inside Progress Bar Card */}
          <div className={styles.heroFooterRow}>
            <div className={styles.boardStatusPills}>
              <span className={`${styles.statusPill} ${styles.sproutPill}`}>
                🌱 Sprouting <strong>{sproutingTasks.length}</strong>
              </span>
              <span className={`${styles.statusPill} ${styles.bloomPill}`}>
                🌻 In Bloom <strong>{inBloomTasks.length}</strong>
              </span>
              <span className={`${styles.statusPill} ${styles.harvestPill}`}>
                🍯 Harvested <strong>{harvestedTasks.length}</strong>
              </span>
            </div>

            <button
              className={styles.specialPlantSeedBtn}
              onClick={() => {
                if (sounds) sounds.playClick();
                setIsModalOpen(true);
              }}
              title="Plant a new seed / quest"
            >
              <span className={styles.bouncySprout}>🌱</span>
              <span>Plant New Seed</span>
            </button>
          </div>
        </div>

        {/* Quick Filters Card (Dynamic from Desk Menu categories with emojis) */}
        <div className={styles.quickFiltersCard}>
          <div className={styles.filterHeader}>
            <span>🍓 Quick Filters</span>
            {activeFilter !== "all" && (
              <button
                className={styles.clearBtn}
                onClick={() => setActiveFilter("all")}
              >
                clear
              </button>
            )}
          </div>

          <div className={styles.filterPills}>
            <button
              className={`${styles.filterBtn} ${activeFilter === "all" ? styles.filterBtnActive : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              <span>🌰</span> all tasks ({totalFiltered})
            </button>
            {taskCategories && taskCategories.map((cat) => {
              const count = tasks.filter(
                (t) => (selectedAppId === "all" || t.appId === selectedAppId) && t.type === cat.id
              ).length;
              return (
                <button
                  key={cat.id}
                  className={`${styles.filterBtn} ${activeFilter === cat.id ? styles.filterBtnActive : ""}`}
                  onClick={() => setActiveFilter(cat.id)}
                >
                  <span>{cat.emoji || cat.icon || "🏷️"}</span> {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3-Column Minimal Kanban Board with Independent Column Scroll */}
      <div className={styles.kanbanGrid}>
        {/* Column 1: Sprouting (To Do) */}
        <div className={styles.kanbanCol}>
          <div className={styles.colHeader}>
            <div className={styles.colTitle}>
              <span>🌱</span> Sprouting (To Do)
            </div>
            <span className={`${styles.colCountBadge} ${styles.sproutBadge}`}>{sproutingTasks.length}</span>
          </div>

          <div className={styles.cardsList}>
            {sproutingTasks.length === 0 ? (
              <div className={styles.emptyColMessage}>No sprouting tasks yet 🌱</div>
            ) : (
              sproutingTasks.map((task) => {
                const app = apps.find((a) => a.id === task.appId);
                return (
                  <div
                    key={task.id}
                    className={styles.minimalTaskCard}
                    onClick={() => handleOpenPaper(task)}
                    title="Click to view full paper note & details"
                  >
                    <div className={styles.minimalLeft}>
                      <span
                        className={styles.priorityEmojiOnly}
                        title={`Priority: ${getPriorityLabel(task.priority)}${app ? ` • Project: ${app.name}` : ""}`}
                      >
                        {getPriorityEmoji(task.priority)}
                      </span>
                      <span className={styles.minimalTitle}>{task.title}</span>
                    </div>

                    <div className={styles.minimalActions}>
                      <button
                        type="button"
                        className={`${styles.miniActionBtn} ${styles.miniBloomBtn}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(task.id, "in-bloom");
                        }}
                        title="Move to In Bloom"
                      >
                        🌻 Bloom →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: In Bloom (Doing) */}
        <div className={styles.kanbanCol}>
          <div className={styles.colHeader}>
            <div className={styles.colTitle}>
              <span>🌻</span> In Bloom (Doing)
            </div>
            <span className={`${styles.colCountBadge} ${styles.bloomBadge}`}>{inBloomTasks.length}</span>
          </div>

          <div className={styles.cardsList}>
            {inBloomTasks.length === 0 ? (
              <div className={styles.emptyColMessage}>No tasks currently in bloom 🌻</div>
            ) : (
              inBloomTasks.map((task) => {
                const app = apps.find((a) => a.id === task.appId);
                return (
                  <div
                    key={task.id}
                    className={`${styles.minimalTaskCard} ${styles.minimalCardBloom}`}
                    onClick={() => handleOpenPaper(task)}
                    title="Click to view full paper note & details"
                  >
                    <div className={styles.minimalLeft}>
                      <span
                        className={styles.priorityEmojiOnly}
                        title={`Priority: ${getPriorityLabel(task.priority)}${app ? ` • Project: ${app.name}` : ""}`}
                      >
                        {getPriorityEmoji(task.priority)}
                      </span>
                      <span className={styles.minimalTitle}>{task.title}</span>
                    </div>

                    <div className={styles.minimalActions}>
                      <button
                        type="button"
                        className={`${styles.miniActionBtn} ${styles.miniBackBtn}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(task.id, "sprouting");
                        }}
                        title="Move back to Sprouting"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        className={`${styles.miniActionBtn} ${styles.miniHarvestBtn}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHarvestTask(task.id);
                        }}
                        title="Harvest task"
                      >
                        🍯 Harvest
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            <div className={styles.cozyTipBox}>
              <span>🍵</span>
              <span>take a 30-sec eye rest &amp; stretch your paws ~ 🐾</span>
            </div>
          </div>
        </div>

        {/* Column 3: Harvested (Done) */}
        <div className={styles.kanbanCol}>
          <div className={styles.colHeader}>
            <div className={styles.colTitle}>
              <span>🍯</span> Harvested (Done)
            </div>
            <span className={`${styles.colCountBadge} ${styles.harvestBadge}`}>{harvestedTasks.length}</span>
          </div>

          <div className={styles.cardsList}>
            {harvestedTasks.length === 0 ? (
              <div className={styles.emptyColMessage}>No harvested tasks yet 🍯</div>
            ) : (
              harvestedTasks.map((task) => {
                const app = apps.find((a) => a.id === task.appId);
                return (
                  <div
                    key={task.id}
                    className={`${styles.minimalTaskCard} ${styles.minimalCardHarvested}`}
                    onClick={() => handleOpenPaper(task)}
                    title="Click to view full paper note & details"
                  >
                    <div className={styles.minimalLeft}>
                      <span
                        className={styles.priorityEmojiOnly}
                        title={`Priority: ${getPriorityLabel(task.priority)}${app ? ` • Project: ${app.name}` : ""}`}
                      >
                        {getPriorityEmoji(task.priority)}
                      </span>
                      <span className={`${styles.minimalTitle} ${styles.harvestedTitle}`}>
                        {task.title}
                      </span>
                    </div>

                    <div className={styles.minimalActions}>
                      <button
                        type="button"
                        className={`${styles.miniActionBtn} ${styles.miniReopenBtn}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(task.id, "in-bloom");
                        }}
                        title="Reopen task"
                      >
                        ↩ Reopen
                      </button>
                      <button
                        type="button"
                        className={`${styles.miniActionBtn} ${styles.miniDeleteBtn}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <NewTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <TaskPaperModal
        task={selectedTaskForPaper}
        isOpen={Boolean(selectedTaskForPaper)}
        onClose={() => setSelectedTaskForPaper(null)}
      />
    </div>
  );
}
