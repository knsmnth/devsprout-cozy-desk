"use client";

import React, { useState } from "react";
import styles from "./SprintView.module.css";
import { useTaskManager } from "@/context/TaskContext";
import { sounds } from "@/utils/audio";
import NewTaskModal from "@/components/NewTaskModal";
import TaskPaperModal from "@/components/TaskPaperModal";
import { Plus, ArrowRight, ArrowLeft, Trash2 } from "lucide-react";

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
        {/* Sprint Hero Card */}
        <div className={styles.sprintHero}>
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

          <div className={styles.harvestJarBox}>
            <span className={styles.jarIcon}>🧺</span>
            <span className={styles.jarTitle}>Harvest Jar</span>
            <span className={styles.jarSubtitle}>
              {harvestedTasks.length} task{harvestedTasks.length === 1 ? "" : "s"} harvested
            </span>
          </div>
        </div>

        {/* Quick Filters Card (Dynamic from Desk Menu categories) */}
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
              all tasks ({totalFiltered})
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
                  <span>{cat.icon}</span> {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Prominent Action Bar above columns with Special Seed Button */}
      <div className={styles.boardTopBar}>
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
                      {app ? (
                        <span
                          className={styles.miniAppBadge}
                          style={{
                            background: app.color ? `${app.color}15` : "#f3ede2",
                            color: app.color || "#5c4f3a",
                            borderColor: app.color ? `${app.color}35` : "#ded4c2",
                          }}
                          title={`Project: ${app.name}`}
                        >
                          <span>{app.icon}</span> {app.tag || app.name}
                        </span>
                      ) : (
                        <span className={styles.miniAppBadge} title="Workspace task">
                          <span>🌱</span> task
                        </span>
                      )}
                      {task.priority === "urgent" && (
                        <span className={styles.urgentBadge} title="Urgent Priority">🔥 URGENT</span>
                      )}
                      <span className={styles.minimalTitle}>{task.title}</span>
                    </div>

                    <div className={styles.minimalActions}>
                      <button
                        type="button"
                        className={styles.miniNoteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPaper(task);
                        }}
                        title="Open paper note"
                      >
                        📄 Note
                      </button>
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
                      {app ? (
                        <span
                          className={styles.miniAppBadge}
                          style={{
                            background: app.color ? `${app.color}18` : "#fef4e2",
                            color: app.color || "#7c5516",
                            borderColor: app.color ? `${app.color}40` : "#f4dfb5",
                          }}
                          title={`Project: ${app.name}`}
                        >
                          <span>{app.icon}</span> {app.tag || app.name}
                        </span>
                      ) : (
                        <span className={styles.miniAppBadge} title="Workspace task">
                          <span>🌻</span> doing
                        </span>
                      )}
                      {task.priority === "urgent" && (
                        <span className={styles.urgentBadge} title="Urgent Priority">🔥 URGENT</span>
                      )}
                      <span className={styles.minimalTitle}>{task.title}</span>
                    </div>

                    <div className={styles.minimalActions}>
                      <button
                        type="button"
                        className={styles.miniNoteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPaper(task);
                        }}
                        title="Open paper note"
                      >
                        📄 Note
                      </button>
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
                          if (sounds) sounds.playHarvest();
                          updateTaskStatus(task.id, "harvested");
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
                      {app ? (
                        <span
                          className={styles.miniAppBadge}
                          style={{
                            background: "#f5f0e6",
                            color: "#8c8371",
                            borderColor: "#e4dbcc",
                          }}
                          title={`Project: ${app.name}`}
                        >
                          <span>{app.icon}</span> {app.tag || app.name}
                        </span>
                      ) : (
                        <span className={styles.miniAppBadge}>
                          <span>🍯</span> done
                        </span>
                      )}
                      <span className={`${styles.minimalTitle} ${styles.harvestedTitle}`}>
                        {task.title}
                      </span>
                    </div>

                    <div className={styles.minimalActions}>
                      <button
                        type="button"
                        className={styles.miniNoteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPaper(task);
                        }}
                        title="Open paper note"
                      >
                        📄 Note
                      </button>
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
