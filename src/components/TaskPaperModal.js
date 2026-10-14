"use client";

import React, { useState, useEffect } from "react";
import styles from "./TaskPaperModal.module.css";
import { useTaskManager } from "@/context/TaskContext";
import { sounds } from "@/utils/audio";
import {
  X,
  Edit3,
  Trash2,
  Check,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Coffee,
  Tag,
  AlertCircle,
  Save,
  RotateCcw,
} from "lucide-react";

export default function TaskPaperModal({ task, isOpen, onClose, initialEditMode = false }) {
  if (!isOpen || !task) return null;

  return (
    <TaskPaperContent
      key={task.id}
      task={task}
      onClose={onClose}
      initialEditMode={initialEditMode}
    />
  );
}

function TaskPaperContent({ task, onClose, initialEditMode = false }) {
  const { apps, updateTask, deleteTask, updateTaskStatus } = useTaskManager();

  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [appId, setAppId] = useState(task?.appId || (apps[0]?.id || ""));
  const [priority, setPriority] = useState(task?.priority || "normal");
  const [type, setType] = useState(task?.type || "sprint");
  const [status, setStatus] = useState(task?.status || "sprouting");
  const [teacups, setTeacups] = useState(task?.teacups || 1);

  const currentApp = apps.find((a) => a.id === (task.appId || appId));

  const handleOpenEdit = () => {
    if (sounds) sounds.playClick();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (sounds) sounds.playClick();
    // revert
    setTitle(task.title || "");
    setDescription(task.description || "");
    setAppId(task.appId || "");
    setPriority(task.priority || "normal");
    setType(task.type || "sprint");
    setStatus(task.status || "sprouting");
    setTeacups(task.teacups || 1);
    setIsEditing(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      appId,
      priority,
      type,
      status,
      teacups: Number(teacups),
    });

    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove "${task.title}"?`)) {
      deleteTask(task.id);
      onClose();
    }
  };

  const handleQuickStatusMove = (newStatus) => {
    updateTaskStatus(task.id, newStatus);
    setStatus(newStatus);
  };

  const getPriorityLabel = (p) => {
    switch (p) {
      case "urgent":
        return "🔥 URGENT";
      case "high":
        return "🌸 HIGH";
      case "cozy":
        return "🌱 COZY";
      default:
        return "🍵 NORMAL";
    }
  };

  const getStatusLabel = (s) => {
    switch (s) {
      case "in-bloom":
        return "🌻 In Bloom (Doing)";
      case "harvested":
        return "🍯 Harvested (Done)";
      default:
        return "🌱 Sprouting (To Do)";
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.paperSheet}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Washi Tape Header Decoration */}
        <div className={styles.washiTape}>
          <span>🌿</span> DEVSPOUT TASK MEMO <span>📌</span>
        </div>

        {/* Paper Header / Metadata badges */}
        <div className={styles.paperTopBar}>
          <div className={styles.badgesCluster}>
            <span className={styles.ticketBadge}>{task.ticketNumber || "#SP-?"}</span>
            <span
              className={styles.statusBadge}
              style={{
                background:
                  (task.status || status) === "harvested"
                    ? "#5f7a49"
                    : (task.status || status) === "in-bloom"
                    ? "#c98234"
                    : "#6b8058",
              }}
            >
              {getStatusLabel(task.status || status)}
            </span>
            <span
              className={styles.priorityBadge}
              style={{
                background:
                  (task.priority || priority) === "urgent"
                    ? "#cb4f4f"
                    : (task.priority || priority) === "high"
                    ? "#b06d89"
                    : "#8a7e6b",
              }}
            >
              {getPriorityLabel(task.priority || priority)}
            </span>
          </div>

          <button
            className={styles.closeBtn}
            onClick={() => {
              if (sounds) sounds.playClick();
              onClose();
            }}
            title="Close Note"
          >
            <X size={16} />
          </button>
        </div>

        {/* Paper Content: View or Edit Mode */}
        {!isEditing ? (
          /* READ / VIEW DETAILS MODE */
          <div className={styles.paperBody}>
            <div className={styles.paperMarginLine} />

            <div className={styles.contentWrap}>
              {/* Task Title */}
              <h2 className={styles.taskTitle}>{task.title}</h2>

              {/* App / Category Pill Row */}
              <div className={styles.metaRow}>
                {currentApp && (
                  <span className={styles.appPill}>
                    {currentApp.icon} {currentApp.name} ({currentApp.tag})
                  </span>
                )}
                <span className={styles.typePill}>
                  <Tag size={12} /> {task.typeLabel || (task.type && task.type.toUpperCase()) || "SPRINT"}
                </span>
                <span className={styles.teacupsPill}>
                  {"🍵".repeat(task.teacups || 1)} {task.teacups || 1} focus cup
                  {(task.teacups || 1) > 1 ? "s" : ""}
                </span>
              </div>

              {/* Full Task Description / Notes */}
              <div className={styles.notesSection}>
                <div className={styles.notesSectionLabel}>Full Task Details & Notes:</div>
                <div className={styles.notesPaperBox}>
                  {task.description ? (
                    <p className={styles.notesText}>{task.description}</p>
                  ) : (
                    <p className={styles.notesEmpty}>
                      No extra notes written for this quest yet. Click &quot;Edit Task&quot; below to add details!
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Status Mover */}
              <div className={styles.quickStatusBox}>
                <span className={styles.quickStatusLabel}>Move quest status:</span>
                <div className={styles.quickStatusButtons}>
                  {task.status !== "sprouting" && (
                    <button
                      className={styles.statusMoveBtn}
                      onClick={() => handleQuickStatusMove("sprouting")}
                    >
                      <ArrowLeft size={13} /> 🌱 To Do
                    </button>
                  )}
                  {task.status !== "in-bloom" && (
                    <button
                      className={`${styles.statusMoveBtn} ${styles.btnBloom}`}
                      onClick={() => handleQuickStatusMove("in-bloom")}
                    >
                      🌻 In Bloom (Doing)
                    </button>
                  )}
                  {task.status !== "harvested" && (
                    <button
                      className={`${styles.statusMoveBtn} ${styles.btnHarvest}`}
                      onClick={() => handleQuickStatusMove("harvested")}
                    >
                      🍯 Harvest (Done) <Check size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Paper Footer with Edit Button */}
            <div className={styles.paperFooter}>
              <div className={styles.leftActions}>
                <button
                  className={styles.deleteBtn}
                  onClick={handleDelete}
                  title="Delete this task"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>

              <div className={styles.rightActions}>
                <button
                  className={styles.editTaskBtn}
                  onClick={handleOpenEdit}
                  title="Edit full task details"
                >
                  <Edit3 size={15} />
                  <span>Edit Task</span>
                </button>
                <button
                  className={styles.foldPaperBtn}
                  onClick={() => {
                    if (sounds) sounds.playClick();
                    onClose();
                  }}
                >
                  Fold Paper
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* EDIT MODE ON PAPER */
          <form onSubmit={handleSave} className={styles.paperBody}>
            <div className={styles.paperMarginLine} />

            <div className={styles.contentWrap}>
              <div className={styles.editModeHeader}>
                <span>✏️ Editing Quest Details</span>
                <span className={styles.editTicketHint}>{task.ticketNumber}</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.paperInput}
                  placeholder="Task title..."
                  required
                  autoFocus
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Full Description & Notes</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.paperTextarea}
                  placeholder="Detailed notes, requirements, acceptance criteria, or work log..."
                />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>App / Workspace</label>
                  <select
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    className={styles.paperSelect}
                  >
                    {apps.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.icon} {app.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={styles.paperSelect}
                  >
                    <option value="sprouting">🌱 Sprouting (To Do)</option>
                    <option value="in-bloom">🌻 In Bloom (Doing)</option>
                    <option value="harvested">🍯 Harvested (Done)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={styles.paperSelect}
                  >
                    <option value="sprint">Sprint Quest</option>
                    <option value="backend">Backend Logic ⚡</option>
                    <option value="bugfix">Bug Squash 🐞</option>
                    <option value="ui-flower">UI Flower 🌸</option>
                    <option value="polish">Polish / Clean ✨</option>
                    <option value="rest">Mindful Rest ☕</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className={styles.paperSelect}
                  >
                    <option value="normal">🍵 Normal (Gentle)</option>
                    <option value="urgent">🔥 Urgent (ASAP)</option>
                    <option value="high">🌸 High (Today)</option>
                    <option value="cozy">🌱 Cozy (Later)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Effort (Teacups 🍵)</label>
                  <select
                    value={teacups}
                    onChange={(e) => setTeacups(e.target.value)}
                    className={styles.paperSelect}
                  >
                    <option value={1}>1 teacup (~25 min)</option>
                    <option value={2}>2 teacups (~50 min)</option>
                    <option value={3}>3 teacups (~75 min)</option>
                    <option value={4}>4 teacups (deep sprint)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Edit Mode Footer */}
            <div className={styles.paperFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCancelEdit}
              >
                <RotateCcw size={14} />
                <span>Cancel</span>
              </button>

              <button type="submit" className={styles.saveBtn}>
                <Save size={14} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
