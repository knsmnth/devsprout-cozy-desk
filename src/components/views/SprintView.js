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
              />
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
          <span className={styles.statusPill}>
            🌱 Sprouting: <strong>{sproutingTasks.length}</strong>
          </span>
          <span className={styles.statusPill}>
            🌻 In Bloom: <strong>{inBloomTasks.length}</strong>
          </span>
          <span className={styles.statusPill}>
            🍯 Harvested: <strong>{harvestedTasks.length}</strong>
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
          <Plus size={16} />
          <span>+ plant new seed</span>
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
            <span className={styles.colCountBadge}>{sproutingTasks.length}</span>
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
                        className={styles.minimalAppDot}
                        style={{ backgroundColor: app?.color || "#8c8371" }}
                        title={app?.name ? `Project: ${app.name}` : "Workspace task"}
                      />
                      {task.priority === "urgent" && (
                        <span className={styles.urgentFire} title="Urgent Priority">🔥</span>
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
                        className={styles.miniActionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(task.id, "in-bloom");
                        }}
                        title="Move to In Bloom"
                      >
                        Bloom <ArrowRight size={11} style={{ display: "inline" }} />
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
            <span className={styles.colCountBadge}>{inBloomTasks.length}</span>
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
                        className={styles.minimalAppDot}
                        style={{ backgroundColor: app?.color || "#d48b38" }}
                        title={app?.name ? `Project: ${app.name}` : "Workspace task"}
                      />
                      {task.priority === "urgent" && (
                        <span className={styles.urgentFire} title="Urgent Priority">🔥</span>
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
                        className={styles.miniActionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(task.id, "sprouting");
                        }}
                        title="Move back to Sprouting"
                      >
                        <ArrowLeft size={11} style={{ display: "inline" }} />
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
                        Harvest 🍯
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            <div className={styles.colTip}>
              * take a 30-second eye rest between tasks 🌿 *
            </div>
          </div>
        </div>

        {/* Column 3: Harvested (Done) */}
        <div className={styles.kanbanCol}>
          <div className={styles.colHeader}>
            <div className={styles.colTitle}>
              <span>🍯</span> Harvested (Done)
            </div>
            <span className={styles.colCountBadge}>{harvestedTasks.length}</span>
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
                        className={styles.minimalAppDot}
                        style={{ backgroundColor: app?.color || "#657d4f" }}
                        title={app?.name ? `Project: ${app.name}` : "Workspace task"}
                      />
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
                        className={styles.miniActionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(task.id, "in-bloom");
                        }}
                        title="Reopen task"
                      >
                        Reopen
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
