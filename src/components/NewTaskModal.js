"use client";

import React, { useState } from "react";
import styles from "./NewTaskModal.module.css";
import { useTaskManager } from "@/context/TaskContext";
import { X } from "lucide-react";

export default function NewTaskModal({ isOpen, onClose }) {
  const { apps, addTask, taskCategories } = useTaskManager();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAppId, setSelectedAppId] = useState("");
  const [priority, setPriority] = useState("normal");
  const [type, setType] = useState(taskCategories?.[0]?.id || "ui-flower");
  const [teacups, setTeacups] = useState(1);

  const activeAppId =
    selectedAppId && apps.some((a) => a.id === selectedAppId)
      ? selectedAppId
      : apps[0]?.id || "main-workspace";

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedCat = taskCategories?.find((c) => c.id === type);

    addTask({
      title: title.trim(),
      description: description.trim(),
      appId: activeAppId,
      priority,
      type,
      typeLabel: matchedCat ? matchedCat.label : type.toUpperCase(),
      teacups: Number(teacups),
      status: "sprouting",
    });

    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <span>🌱</span> Plant New Quest
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Which App / Website?</label>
            <select
              value={activeAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className={styles.select}
            >
              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.icon} {app.name} ({app.tag})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Quest Title</label>
            <input
              type="text"
              placeholder="e.g. Refactor API auth flow or Fix button hover"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Notes & Details</label>
            <textarea
              rows={2}
              placeholder="What needs to be done? Any test cases or commit notes?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Priority Tier</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={styles.select}
              >
                <option value="urgent">🔥 Urgent (ASAP)</option>
                <option value="high">🌸 High (Today)</option>
                <option value="normal">🍵 Normal (Gentle)</option>
                <option value="cozy">🌱 Cozy (Later)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={styles.select}
              >
                {taskCategories && taskCategories.length > 0 ? (
                  taskCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="ui-flower">🌸 Front-End Petals</option>
                    <option value="backend">🥕 Backend Roots</option>
                    <option value="bugfix">🐞 Bug Squash</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Effort (Teacups of focus 🍵)</label>
            <select
              value={teacups}
              onChange={(e) => setTeacups(e.target.value)}
              className={styles.select}
            >
              <option value={1}>1 teacup (~25 min)</option>
              <option value={2}>2 teacups (~50 min)</option>
              <option value={3}>3 teacups (~75 min)</option>
              <option value={4}>4 teacups (deep sprint)</option>
            </select>
          </div>

          <button type="submit" className={styles.submitBtn}>
            + Plant Quest on Desk
          </button>
        </form>
      </div>
    </div>
  );
}
