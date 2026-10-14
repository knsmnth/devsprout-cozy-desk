"use client";

import React, { useState } from "react";
import styles from "./SprintView.module.css";
import { useTaskManager } from "@/context/TaskContext";
import { sounds } from "@/utils/audio";
import NewTaskModal from "@/components/NewTaskModal";
import TaskPaperModal from "@/components/TaskPaperModal";
import { Plus, ArrowRight, ArrowLeft, Trash2, CheckCircle } from "lucide-react";

export default function SprintView() {
  const {
    apps,
    tasks,
    updateTaskStatus,
    deleteTask,
    selectedAppId,
    setSelectedAppId,
  } = useTaskManager();

  const [activeFilter, setActiveFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskForPaper, setSelectedTaskForPaper] = useState(null);

  const handleOpenPaper = (task) => {
    if (sounds) sounds.playClick();
    setSelectedTaskForPaper(task);
  };

  // Filter tasks by selected app and category
  const filteredTasks = tasks.filter((t) => {
    if (selectedAppId !== "all" && t.appId !== selectedAppId) return false;
    if (activeFilter === "all") return true;
    if (activeFilter === "frontend" && (t.type === "ui-flower" || t.type === "polish")) return true;
    if (activeFilter === "backend" && t.type === "backend") return true;
    if (activeFilter === "bugfix" && t.type === "bugfix") return true;
    return true;
  });

  const sproutingTasks = filteredTasks.filter((t) => t.status === "sprouting");
  const inBloomTasks = filteredTasks.filter((t) => t.status === "in-bloom");
  const harvestedTasks = filteredTasks.filter((t) => t.status === "harvested");

  const totalFiltered = filteredTasks.length;
  const doneFiltered = harvestedTasks.length;
  const progressPercent = totalFiltered > 0 ? Math.round((doneFiltered / totalFiltered) * 100) : 0;

  const currentAppObj = apps.find((a) => a.id === selectedAppId);

  return (
    <div className={styles.sprintContainer}>
      {/* Multi-App Filter Bar */}
      <div className={styles.appTabsBar}>
        <button
          className={`${styles.appTabBtn} ${selectedAppId === "all" ? styles.appTabBtnActive : ""}`}
          onClick={() => {
            if (sounds) sounds.playClick();
            setSelectedAppId("all");
          }}
        >
          <span>🌐</span> All Apps & Portals ({tasks.length})
        </button>
        {apps.map((app) => {
          const count = tasks.filter((t) => t.appId === app.id).length;
          return (
            <button
              key={app.id}
              className={`${styles.appTabBtn} ${selectedAppId === app.id ? styles.appTabBtnActive : ""}`}
              onClick={() => {
                if (sounds) sounds.playClick();
                setSelectedAppId(app.id);
              }}
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

        {/* Quick Filters Card */}
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
            <button
              className={`${styles.filterBtn} ${activeFilter === "frontend" ? styles.filterBtnActive : ""}`}
              onClick={() => setActiveFilter("frontend")}
            >
              🌸 front-end petals
            </button>
            <button
              className={`${styles.filterBtn} ${activeFilter === "backend" ? styles.filterBtnActive : ""}`}
              onClick={() => setActiveFilter("backend")}
            >
              🥕 backend roots
            </button>
            <button
              className={`${styles.filterBtn} ${activeFilter === "bugfix" ? styles.filterBtnActive : ""}`}
              onClick={() => setActiveFilter("bugfix")}
            >
              🐞 bug squash
            </button>
          </div>
        </div>
      </div>

      {/* 3-Column Kanban Board */}
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
              sproutingTasks.map((task) => (
                <div
                  key={task.id}
                  className={styles.taskCard}
                  onClick={() => handleOpenPaper(task)}
                  style={{ cursor: "pointer" }}
                  title="Click to view full paper note & details"
                >
                  <div className={styles.cardTop}>
                    <span
                      className={styles.badgeTag}
                      style={{
                        background: task.priority === "urgent" ? "#d9534f" : "#657d4f",
                        color: "#fff",
                      }}
                    >
                      {task.priority === "urgent" ? "🔥 URGENT" : task.typeLabel || task.type}
                    </span>
                    <span className={styles.ticketId}>{task.ticketNumber}</span>
                  </div>

                  <div className={styles.cardTitle}>{task.title}</div>
                  {task.description && <div className={styles.cardDesc}>{task.description}</div>}

                  <div className={styles.cardFooter}>
                    <span>{"🍵".repeat(task.teacups || 1)}</span>
                    <div className={styles.cardActions}>
                      <button
                        className={styles.paperBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPaper(task);
                        }}
                        title="Open paper note & edit details"
                      >
                        📄 Note
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(task.id, "in-bloom");
                        }}
                        title="Move to In Bloom"
                      >
                        Bloom <ArrowRight size={12} style={{ display: "inline" }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            <button
              className={styles.addSeedBtn}
              onClick={() => {
                if (sounds) sounds.playClick();
                setIsModalOpen(true);
              }}
            >
              + plant new seed
            </button>
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
              inBloomTasks.map((task) => (
                <div
                  key={task.id}
                  className={styles.taskCard}
                  onClick={() => handleOpenPaper(task)}
                  style={{ cursor: "pointer" }}
                  title="Click to view full paper note & details"
                >
                  <div className={styles.cardTop}>
                    <span
                      className={styles.badgeTag}
                      style={{ background: "#d48b38", color: "#fff" }}
                    >
                      {task.typeLabel || task.type}
                    </span>
                    <span className={styles.ticketId}>{task.ticketNumber}</span>
                  </div>

                  <div className={styles.cardTitle}>{task.title}</div>
                  {task.description && <div className={styles.cardDesc}>{task.description}</div>}

                  <div className={styles.cardFooter}>
                    <span>🧸 sprout bear</span>
                    <div className={styles.cardActions}>
                      <button
                        className={styles.paperBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPaper(task);
                        }}
                        title="Open paper note & edit details"
                      >
                        📄 Note
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(task.id, "sprouting");
                        }}
                        title="Move back"
                      >
                        <ArrowLeft size={12} style={{ display: "inline" }} />
                      </button>
                      <button
                        className={styles.actionBtn}
                        style={{ background: "#657d4f", color: "#fff" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(task.id, "harvested");
                        }}
                        title="Harvest task"
                      >
                        Harvest 🍯
                      </button>
                    </div>
                  </div>
                </div>
              ))
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
              harvestedTasks.map((task) => (
                <div
                  key={task.id}
                  className={styles.taskCard}
                  onClick={() => handleOpenPaper(task)}
                  style={{ opacity: 0.85, cursor: "pointer" }}
                  title="Click to view full paper note & details"
                >
                  <div className={styles.cardTop}>
                    <span
                      className={styles.badgeTag}
                      style={{ background: "#657d4f", color: "#fff" }}
                    >
                      ✓ DONE
                    </span>
                    <span className={styles.ticketId}>{task.ticketNumber}</span>
                  </div>

                  <div className={styles.cardTitle} style={{ textDecoration: "line-through" }}>
                    {task.title}
                  </div>
                  {task.description && <div className={styles.cardDesc}>{task.description}</div>}

                  <div className={styles.cardFooter}>
                    <span>✨ harvested</span>
                    <div className={styles.cardActions}>
                      <button
                        className={styles.paperBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPaper(task);
                        }}
                        title="Open paper note & edit details"
                      >
                        📄 Note
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(task.id, "in-bloom");
                        }}
                        title="Reopen task"
                      >
                        Reopen
                      </button>
                      <button
                        className={styles.actionBtn}
                        style={{ color: "#d9534f" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
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
