"use client";

import React, { useState, useRef } from "react";
import styles from "./DeskMenuModal.module.css";
import { useTaskManager } from "@/context/TaskContext";
import { sounds } from "@/utils/audio";
import {
  X,
  User,
  Bookmark,
  FolderKanban,
  Palette,
  Database,
  Check,
  Plus,
  Trash2,
  Download,
  Upload,
  Volume2,
  VolumeX,
  Droplets,
  Clock,
  Sparkles,
  Tag,
} from "lucide-react";
import confetti from "canvas-confetti";

const AVATAR_OPTIONS = [
  "🧸", "🐱", "🦊", "🐰", "🐸", "🐶", "🐼", "🐥",
  "🌱", "☕", "🍓", "🌸", "🌻", "🍄", "✨", "🍵"
];

const PROJECT_EMOJI_OPTIONS = [
  "🌱", "🌿", "🍵", "☕", "💻", "📱", "🚀", "🎨", "🎮", "📚",
  "🍓", "🍊", "🍄", "⭐", "🧸", "✨", "🔥", "🛠️", "💡", "🎯"
];

const SHELF_EMOJI_OPTIONS = [
  "🔖", "🐛", "🍊", "🍓", "🍃", "📚", "🎨", "☕", "⭐", "🔗",
  "💻", "📂", "📌", "🌐", "🛠️", "🎧"
];

const THEME_OPTIONS = [
  {
    id: "matcha",
    name: "Matcha Garden",
    emoji: "🍵",
    colors: ["#50683a", "#607b4b", "#faf6ed", "#a84738"],
    description: "Classic earthy herbal tea & warm parchment",
  },
  {
    id: "sakura",
    name: "Sakura Blossom",
    emoji: "🌸",
    colors: ["#8d4f64", "#a26078", "#fdf6f7", "#b85d68"],
    description: "Soft rose petals, dusty pink & honey",
  },
  {
    id: "coffee",
    name: "Coffeehouse",
    emoji: "☕",
    colors: ["#5a4033", "#6d4f40", "#f8f4ee", "#8a5738"],
    description: "Espresso tones, warm wood & roasted chicory",
  },
  {
    id: "midnight",
    name: "Midnight Lo-Fi",
    emoji: "🌙",
    colors: ["#1e2533", "#293245", "#131720", "#4e658a"],
    description: "Sleek night mode with dim amber moonlight",
  },
  {
    id: "terracotta",
    name: "Sunset Clay",
    emoji: "🍊",
    colors: ["#8e4235", "#a54f42", "#faf4ef", "#7a3227"],
    description: "Warm glazed ceramic, terracotta & peach",
  },
];

export default function DeskMenuModal({ isOpen, onClose }) {
  const {
    deskMenuTab,
    setDeskMenuTab,
    userProfile,
    updateUserProfile,
    shelves,
    addShelf,
    deleteShelf,
    apps,
    addApp,
    updateApp,
    deleteApp,
    theme,
    updateTheme,
    audioEnabled,
    toggleAudio,
    maxWaterCups,
    updateMaxWater,
    pomodoroDuration,
    updatePomodoroDuration,
    taskCategories,
    addCategory,
    deleteCategory,
    updateCategory,
    clearHarvestedTasks,
    resetDailyStats,
    exportWorkspaceData,
    importWorkspaceData,
  } = useTaskManager();

  // Profile Form Local State
  const [profileForm, setProfileForm] = useState(userProfile);
  const [profileSaved, setProfileSaved] = useState(false);

  // New Shelf Form
  const [newShelfIcon, setNewShelfIcon] = useState("🔖");
  const [newShelfLabel, setNewShelfLabel] = useState("");
  const [newShelfUrl, setNewShelfUrl] = useState("");

  // New App Form
  const [newAppName, setNewAppName] = useState("");
  const [newAppIcon, setNewAppIcon] = useState("🌱");
  const [newAppTag, setNewAppTag] = useState("Web App");
  const [newAppColor, setNewAppColor] = useState("#5F7A49");
  const [newAppTheme, setNewAppTheme] = useState("matcha");
  const [newAppQuota, setNewAppQuota] = useState(2);

  // New Tag / Filter Form
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🏷️");
  const [newCatColor, setNewCatColor] = useState("#5F7A49");

  const fileInputRef = useRef(null);

  // Sync profile form when modal opens or userProfile changes
  React.useEffect(() => {
    if (userProfile) {
      setProfileForm(userProfile);
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const handleTabChange = (tabId) => {
    if (sounds) sounds.playClick();
    setDeskMenuTab(tabId);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile(profileForm);
    setProfileSaved(true);
    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.6 },
      colors: ["#50683a", "#f9d976", "#e07a5f"],
    });
    setTimeout(() => setProfileSaved(false), 2200);
  };

  const handleAddShelf = (e) => {
    e.preventDefault();
    if (!newShelfLabel.trim() || !newShelfUrl.trim()) return;

    let targetUrl = newShelfUrl.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://") && !targetUrl.startsWith("#")) {
      targetUrl = `https://${targetUrl}`;
    }

    addShelf({
      icon: newShelfIcon || "🔖",
      label: newShelfLabel.trim(),
      url: targetUrl,
      isExternal: true,
    });

    setNewShelfLabel("");
    setNewShelfUrl("");
    setNewShelfIcon("🔖");
  };

  const handleAddApp = (e) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    addApp({
      name: newAppName.trim(),
      icon: newAppIcon || "🌱",
      tag: newAppTag.trim() || "Project",
      color: newAppColor || "#5F7A49",
      theme: newAppTheme || "matcha",
      dailyTarget: Number(newAppQuota) || 2,
    });

    setNewAppName("");
    setNewAppTag("Web App");
    setNewAppColor("#5F7A49");
    setNewAppTheme("matcha");
    setNewAppQuota(2);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;

    const slug = newCatLabel.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    addCategory({
      id: slug || `cat-${Date.now()}`,
      label: newCatLabel.trim(),
      emoji: newCatEmoji || "🏷️",
      color: newCatColor || "#5F7A49",
    });

    setNewCatLabel("");
    setNewCatEmoji("🏷️");
    setNewCatColor("#5F7A49");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        const success = importWorkspaceData(content);
        if (success) {
          alert("Workspace backup successfully loaded! 🍵✨");
        } else {
          alert("Could not load file. Please check the JSON format.");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <span>☕</span> Desk Customization & Settings
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Close menu">
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabsNav}>
          <button
            className={`${styles.tabBtn} ${deskMenuTab === "profile" ? styles.tabBtnActive : ""}`}
            onClick={() => handleTabChange("profile")}
          >
            <User size={14} /> Profile
          </button>
          <button
            className={`${styles.tabBtn} ${deskMenuTab === "shelves" ? styles.tabBtnActive : ""}`}
            onClick={() => handleTabChange("shelves")}
          >
            <Bookmark size={14} /> Shelves
          </button>
          <button
            className={`${styles.tabBtn} ${deskMenuTab === "apps" ? styles.tabBtnActive : ""}`}
            onClick={() => handleTabChange("apps")}
          >
            <FolderKanban size={14} /> Projects & Quotas
          </button>
          <button
            className={`${styles.tabBtn} ${deskMenuTab === "tags" ? styles.tabBtnActive : ""}`}
            onClick={() => handleTabChange("tags")}
          >
            <Tag size={14} /> Task Filters & Tags
          </button>
          <button
            className={`${styles.tabBtn} ${deskMenuTab === "theme" ? styles.tabBtnActive : ""}`}
            onClick={() => handleTabChange("theme")}
          >
            <Palette size={14} /> Themes & Ambience
          </button>
          <button
            className={`${styles.tabBtn} ${deskMenuTab === "data" ? styles.tabBtnActive : ""}`}
            onClick={() => handleTabChange("data")}
          >
            <Database size={14} /> Data & Backup
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.body}>
          {/* TAB 1: PROFILE */}
          {deskMenuTab === "profile" && (
            <form onSubmit={handleSaveProfile}>
              <div className={styles.sectionTitle}>Mascot Avatar & Identity</div>
              <div className={styles.sectionSubtitle}>Choose your companion avatar and how you appear on your desk.</div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Select Companion Avatar</label>
                <div className={styles.avatarGrid}>
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={`${styles.avatarItem} ${profileForm.avatar === emoji ? styles.avatarItemActive : ""}`}
                      onClick={() => setProfileForm((prev) => ({ ...prev, avatar: emoji }))}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Developer Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Handle / Kaomoji</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={profileForm.handle}
                    onChange={(e) => setProfileForm({ ...profileForm, handle: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Role / Subtitle</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={profileForm.title}
                    onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Current Coding Mood</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={profileForm.mood}
                    onChange={(e) => setProfileForm({ ...profileForm, mood: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Desk Bio & Greeting</label>
                <textarea
                  rows={2}
                  className={styles.textarea}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Daily Intention Quote</label>
                <textarea
                  rows={2}
                  className={styles.textarea}
                  value={profileForm.dailyIntention}
                  onChange={(e) => setProfileForm({ ...profileForm, dailyIntention: e.target.value })}
                />
              </div>

              <button type="submit" className={styles.primaryBtn} style={{ marginTop: "12px" }}>
                {profileSaved ? <Check size={16} /> : <Sparkles size={16} />}
                <span>{profileSaved ? "Profile Saved!" : "Save Profile Changes"}</span>
              </button>
            </form>
          )}

          {/* TAB 2: SHELVES */}
          {deskMenuTab === "shelves" && (
            <div>
              <div className={styles.sectionTitle}>Find My Shelves (Quick Bookmarks)</div>
              <div className={styles.sectionSubtitle}>
                Add links to your actual GitHub repos, Figma files, Jira sprint boards, or playlists.
              </div>

              <div style={{ marginBottom: "16px" }}>
                {shelves.map((shelf) => (
                  <div key={shelf.id} className={styles.shelfRow}>
                    <div className={styles.shelfInfo}>
                      <button
                        type="button"
                        className={styles.appIconChangeBtn}
                        title="Click to cycle icon"
                        onClick={() => {
                          if (sounds) sounds.playPop();
                          const curIdx = SHELF_EMOJI_OPTIONS.indexOf(shelf.icon);
                          const nextEmoji = SHELF_EMOJI_OPTIONS[(curIdx + 1) % SHELF_EMOJI_OPTIONS.length] || "🔖";
                          updateShelves(shelves.map((s) => (s.id === shelf.id ? { ...s, icon: nextEmoji } : s)));
                        }}
                      >
                        {shelf.icon || "🔖"}
                      </button>
                      <span>{shelf.label}</span>
                      <span className={styles.shelfUrl}>{shelf.url || "ambient sound"}</span>
                    </div>
                    {shelves.length > 1 && (
                      <button
                        className={styles.deleteBtn}
                        onClick={() => deleteShelf(shelf.id)}
                        title="Delete bookmark"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Bookmark Form */}
              <form onSubmit={handleAddShelf} style={{ background: "#faf7ef", padding: "14px", borderRadius: "12px", border: "1px dashed #dcd3be" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "#4f633d" }}>
                    + Add New Shelf Link
                  </span>
                  <span style={{ fontSize: "0.74rem", color: "#8c8371" }}>
                    Selected Icon: <strong style={{ fontSize: "1rem" }}>{newShelfIcon}</strong>
                  </span>
                </div>

                {/* Shelf Emoji Picker Palette */}
                <div className={styles.emojiPickerSection}>
                  <div className={styles.emojiPickerLabel}>
                    <span>Choose Bookmark Icon:</span>
                    <span className={styles.emojiHint}>Click an emoji or type custom</span>
                  </div>
                  <div className={styles.emojiQuickList}>
                    {SHELF_EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`${styles.emojiQuickBtn} ${newShelfIcon === emoji ? styles.emojiQuickBtnActive : ""}`}
                        onClick={() => {
                          if (sounds) sounds.playPop();
                          setNewShelfIcon(emoji);
                        }}
                        title={`Select ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "50px 1fr 1fr auto", gap: "8px", alignItems: "center" }}>
                  <input
                    type="text"
                    maxLength={2}
                    className={styles.input}
                    value={newShelfIcon}
                    onChange={(e) => setNewShelfIcon(e.target.value)}
                    title="Icon emoji"
                    style={{ textAlign: "center", fontSize: "1.1rem", padding: "6px" }}
                  />
                  <input
                    type="text"
                    placeholder="Label (e.g. Jira Board)"
                    className={styles.input}
                    value={newShelfLabel}
                    onChange={(e) => setNewShelfLabel(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="URL (e.g. jira.company.com)"
                    className={styles.input}
                    value={newShelfUrl}
                    onChange={(e) => setNewShelfUrl(e.target.value)}
                    required
                  />
                  <button type="submit" className={styles.primaryBtn} style={{ padding: "8px 14px" }}>
                    <Plus size={15} /> Add
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: PROJECTS & QUOTAS */}
          {deskMenuTab === "apps" && (
            <div>
              <div className={styles.sectionTitle}>Workspace Projects & Daily Targets</div>
              <div className={styles.sectionSubtitle}>
                Manage your active apps and adjust daily quota targets for the Daily Balance meter.
              </div>

              <div style={{ marginBottom: "16px" }}>
                {apps.map((app) => (
                  <div key={app.id} className={styles.shelfRow} style={{ flexWrap: "wrap" }}>
                    <div className={styles.shelfInfo}>
                      <button
                        type="button"
                        className={styles.appIconChangeBtn}
                        title="Click to cycle project icon"
                        onClick={() => {
                          if (sounds) sounds.playPop();
                          const curIdx = PROJECT_EMOJI_OPTIONS.indexOf(app.icon);
                          const nextEmoji = PROJECT_EMOJI_OPTIONS[(curIdx + 1) % PROJECT_EMOJI_OPTIONS.length] || "🌱";
                          updateApp(app.id, { icon: nextEmoji });
                        }}
                      >
                        {app.icon || "🌱"}
                      </button>
                      <div>
                        <div>{app.name} <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>({app.tag})</span></div>
                        <div style={{ fontSize: "0.74rem", color: "#8c8371" }}>
                          Daily Target: {app.dailyTarget || 1} tasks/day • <em>click icon to cycle</em>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {/* Project Theme Selector */}
                      <select
                        value={app.theme || "matcha"}
                        onChange={(e) => updateApp(app.id, { theme: e.target.value })}
                        className={styles.select}
                        style={{ padding: "4px 8px", fontSize: "0.76rem", borderRadius: "6px", maxWidth: "115px" }}
                        title="Project Theme (auto-applies when switching to this project)"
                      >
                        <option value="matcha">🍵 Matcha</option>
                        <option value="sakura">🌸 Sakura</option>
                        <option value="coffee">☕ Coffee</option>
                        <option value="midnight">🌙 Midnight</option>
                        <option value="terracotta">🍊 Sunset</option>
                      </select>

                      {/* Project Accent Color */}
                      <input
                        type="color"
                        value={app.color || "#5F7A49"}
                        onChange={(e) => updateApp(app.id, { color: e.target.value })}
                        title="Project Identification Color (seen on cards & checklist)"
                        style={{ width: "24px", height: "24px", border: "none", borderRadius: "50%", cursor: "pointer", background: "none" }}
                      />

                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={app.dailyTarget || 1}
                        onChange={(e) => updateApp(app.id, { dailyTarget: Number(e.target.value) || 1 })}
                        title="Daily target tasks"
                        style={{ width: "42px", padding: "4px", borderRadius: "6px", border: "1px solid #ccc", textAlign: "center" }}
                      />
                      {apps.length > 1 && (
                        <button
                          className={styles.deleteBtn}
                          onClick={() => deleteApp(app.id)}
                          title="Delete app"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New App Form */}
              <form onSubmit={handleAddApp} style={{ background: "#faf7ef", padding: "14px", borderRadius: "12px", border: "1px dashed #dcd3be" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "#4f633d" }}>
                    + Add New Project / App
                  </span>
                  <span style={{ fontSize: "0.74rem", color: "#8c8371" }}>
                    Selected Icon: <strong style={{ fontSize: "1rem" }}>{newAppIcon}</strong>
                  </span>
                </div>

                {/* Project Emoji Picker Palette */}
                <div className={styles.emojiPickerSection}>
                  <div className={styles.emojiPickerLabel}>
                    <span>Choose Project Icon:</span>
                    <span className={styles.emojiHint}>Click an emoji or type custom</span>
                  </div>
                  <div className={styles.emojiQuickList}>
                    {PROJECT_EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`${styles.emojiQuickBtn} ${newAppIcon === emoji ? styles.emojiQuickBtnActive : ""}`}
                        onClick={() => {
                          if (sounds) sounds.playPop();
                          setNewAppIcon(emoji);
                        }}
                        title={`Select ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "48px 1.2fr 1fr 100px 36px 45px auto", gap: "8px", alignItems: "center" }}>
                  <input
                    type="text"
                    maxLength={2}
                    className={styles.input}
                    value={newAppIcon}
                    onChange={(e) => setNewAppIcon(e.target.value)}
                    title="Emoji icon"
                    style={{ textAlign: "center", fontSize: "1.15rem", padding: "6px" }}
                  />
                  <input
                    type="text"
                    placeholder="Project Name"
                    className={styles.input}
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Tag (e.g. Mobile)"
                    className={styles.input}
                    value={newAppTag}
                    onChange={(e) => setNewAppTag(e.target.value)}
                  />
                  <select
                    value={newAppTheme}
                    onChange={(e) => setNewAppTheme(e.target.value)}
                    className={styles.select}
                    style={{ padding: "6px 8px", fontSize: "0.76rem", borderRadius: "8px" }}
                    title="Default Project Theme"
                  >
                    <option value="matcha">🍵 Matcha</option>
                    <option value="sakura">🌸 Sakura</option>
                    <option value="coffee">☕ Coffee</option>
                    <option value="midnight">🌙 Midnight</option>
                    <option value="terracotta">🍊 Sunset</option>
                  </select>
                  <input
                    type="color"
                    value={newAppColor}
                    onChange={(e) => setNewAppColor(e.target.value)}
                    title="Project Color"
                    style={{ width: "32px", height: "32px", border: "none", borderRadius: "6px", cursor: "pointer", background: "none" }}
                  />
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newAppQuota}
                    onChange={(e) => setNewAppQuota(Number(e.target.value))}
                    title="Daily Target"
                    style={{ width: "100%", padding: "6px 4px", borderRadius: "8px", border: "1px solid #ccc", textAlign: "center" }}
                  />
                  <button type="submit" className={styles.primaryBtn} style={{ padding: "8px 14px" }}>
                    <Plus size={15} /> Add
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: TASK FILTERS & TAGS */}
          {deskMenuTab === "tags" && (
            <div>
              <div className={styles.sectionTitle}>Task Filters & Categories</div>
              <div className={styles.sectionSubtitle}>
                Customize quick filter tags used across your sprint board and quest creation.
              </div>

              <div style={{ marginBottom: "16px" }}>
                {taskCategories.map((cat) => (
                  <div key={cat.id} className={styles.shelfRow}>
                    <div className={styles.shelfInfo}>
                      <span style={{ fontSize: "1.2rem" }}>{cat.emoji || "🏷️"}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{cat.label}</div>
                        <div style={{ fontSize: "0.74rem", color: "#8c8371" }}>
                          Filter Key: <code>{cat.id}</code>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: cat.color || "#657d4f",
                          display: "inline-block",
                          border: "1px solid rgba(0,0,0,0.15)",
                        }}
                        title={`Color: ${cat.color}`}
                      />
                      {taskCategories.length > 1 && (
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => deleteCategory(cat.id)}
                          title="Delete tag"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Tag / Filter Form */}
              <form onSubmit={handleAddCategory} style={{ background: "#faf7ef", padding: "14px", borderRadius: "12px", border: "1px dashed #dcd3be" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "#4f633d" }}>
                    + Add New Category Filter
                  </span>
                  <span style={{ fontSize: "0.74rem", color: "#8c8371" }}>
                    Icon: <strong style={{ fontSize: "1rem" }}>{newCatEmoji}</strong>
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "50px 1.5fr 40px auto", gap: "8px", alignItems: "center" }}>
                  <input
                    type="text"
                    maxLength={2}
                    className={styles.input}
                    value={newCatEmoji}
                    onChange={(e) => setNewCatEmoji(e.target.value)}
                    title="Emoji icon"
                    style={{ textAlign: "center", fontSize: "1.15rem", padding: "6px" }}
                  />
                  <input
                    type="text"
                    placeholder="Filter Name (e.g. DevOps, Database, Design)"
                    className={styles.input}
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    required
                  />
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    title="Tag Badge Color"
                    style={{ width: "36px", height: "36px", border: "none", borderRadius: "8px", cursor: "pointer", background: "none" }}
                  />
                  <button type="submit" className={styles.primaryBtn} style={{ padding: "8px 14px" }}>
                    <Plus size={15} /> Add Tag
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: THEMES & AMBIENCE */}
          {deskMenuTab === "theme" && (
            <div>
              <div className={styles.sectionTitle}>Color Theme & Aesthetics</div>
              <div className={styles.sectionSubtitle}>
                Select an earthy curated palette to set the mood for your coding day.
              </div>

              <div className={styles.themeGrid}>
                {THEME_OPTIONS.map((t) => (
                  <div
                    key={t.id}
                    className={`${styles.themeCard} ${theme === t.id ? styles.themeCardActive : ""}`}
                    onClick={() => updateTheme(t.id)}
                  >
                    <div className={styles.themeSwatches}>
                      {t.colors.map((c, i) => (
                        <div key={i} className={styles.themeSwatch} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className={styles.themeName}>
                      <span>{t.emoji}</span>
                      <span>{t.name}</span>
                      {theme === t.id && <Check size={14} color="#50683a" style={{ marginLeft: "auto" }} />}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#797163" }}>{t.description}</div>
                  </div>
                ))}
              </div>

              {/* Sound & Atmosphere Controls */}
              <div className={styles.sectionTitle} style={{ marginTop: "16px" }}>Ambience & Trackers</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "10px" }}>
                {/* Audio Toggle */}
                <div className={styles.dataActionBox}>
                  <div className={styles.dataActionText}>
                    <strong>Tactile Sound FX</strong>
                    <p>Gentle clicks, bubbles, and bell chimes</p>
                  </div>
                  <button
                    className={audioEnabled ? styles.primaryBtn : styles.secondaryBtn}
                    onClick={() => toggleAudio(!audioEnabled)}
                    style={{ padding: "6px 14px" }}
                  >
                    {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    <span>{audioEnabled ? "On" : "Muted"}</span>
                  </button>
                </div>

                {/* Hydration Target */}
                <div className={styles.dataActionBox}>
                  <div className={styles.dataActionText}>
                    <strong>Hydration Goal</strong>
                    <p>Daily cups target ({maxWaterCups} cups)</p>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[3, 5, 8].map((cups) => (
                      <button
                        key={cups}
                        className={maxWaterCups === cups ? styles.primaryBtn : styles.secondaryBtn}
                        onClick={() => updateMaxWater(cups)}
                        style={{ padding: "5px 10px", fontSize: "0.8rem" }}
                      >
                        {cups} 🍵
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pomodoro Focus Presets */}
              <div className={styles.dataActionBox} style={{ marginTop: "10px" }}>
                <div className={styles.dataActionText}>
                  <strong>Focus Sprint Duration</strong>
                  <p>Choose your default mindful Pomodoro session length</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[15, 25, 50].map((mins) => (
                    <button
                      key={mins}
                      className={pomodoroDuration === mins * 60 ? styles.primaryBtn : styles.secondaryBtn}
                      onClick={() => updatePomodoroDuration(mins * 60)}
                      style={{ padding: "6px 12px", fontSize: "0.82rem" }}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA & BACKUP */}
          {deskMenuTab === "data" && (
            <div>
              <div className={styles.sectionTitle}>Workspace Backup & Reset</div>
              <div className={styles.sectionSubtitle}>
                Safely export your quests, notes, and profile settings or clear harvested tasks.
              </div>

              {/* Export Backup */}
              <div className={styles.dataActionBox}>
                <div className={styles.dataActionText}>
                  <strong>Export Workspace Backup</strong>
                  <p>Download a JSON file containing all your tasks, notes, profile, and settings.</p>
                </div>
                <button className={styles.primaryBtn} onClick={exportWorkspaceData}>
                  <Download size={14} /> Download Backup
                </button>
              </div>

              {/* Import Backup */}
              <div className={styles.dataActionBox}>
                <div className={styles.dataActionText}>
                  <strong>Import Backup</strong>
                  <p>Restore tasks and settings from a previously saved JSON file.</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept=".json"
                  onChange={handleFileUpload}
                />
                <button
                  className={styles.secondaryBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} /> Upload Backup
                </button>
              </div>

              {/* Clear Completed Tasks */}
              <div className={styles.dataActionBox}>
                <div className={styles.dataActionText}>
                  <strong>Clear Harvested Tasks</strong>
                  <p>Removes finished tasks to keep your sprint board clean and fresh.</p>
                </div>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => {
                    if (confirm("Remove all completed/harvested tasks?")) {
                      clearHarvestedTasks();
                    }
                  }}
                >
                  <Trash2 size={14} /> Clean Harvested
                </button>
              </div>

              {/* Daily Reset */}
              <div className={styles.dataActionBox}>
                <div className={styles.dataActionText}>
                  <strong>Reset Daily Counters</strong>
                  <p>Reset today&apos;s water cups and Pomodoro session counts for a fresh new day.</p>
                </div>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => {
                    if (confirm("Reset water and cafe counts for today?")) {
                      resetDailyStats();
                    }
                  }}
                >
                  🌱 Fresh Day Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={styles.footer}>
          <div style={{ fontSize: "0.78rem", color: "#8c8371" }}>
            🍵 DevSprout Cozy Hub • all preferences autosaved
          </div>
          <button className={styles.secondaryBtn} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
