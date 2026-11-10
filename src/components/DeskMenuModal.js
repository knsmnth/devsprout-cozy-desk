"use client";

import React, { useState, useRef } from "react";
import styles from "./DeskMenuModal.module.css";
import { useTaskManager } from "@/context/TaskContext";
import { useAuthStore } from "@/store/useAuthStore";
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
  ChevronLeft,
  ChevronRight,
  Cloud,
  RefreshCw,
  LogOut,
  LogIn,
  ShieldCheck,
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
    updateShelves,
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
    getExportPayload,
    tasks,
    levelData,
    XP_REWARDS,
    shuffleDailyQuote,
  } = useTaskManager();

  // Cloud & Auth Store
  const authUser = useAuthStore((state) => state.user);
  const syncStatus = useAuthStore((state) => state.syncStatus);
  const lastSyncedAt = useAuthStore((state) => state.lastSyncedAt);
  const syncError = useAuthStore((state) => state.syncError);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const openLogoutModal = useAuthStore((state) => state.openLogoutModal);
  const signOut = useAuthStore((state) => state.signOut);
  const saveCloudWorkspace = useAuthStore((state) => state.saveCloudWorkspace);

  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [cloudMsg, setCloudMsg] = useState("");

  const handleManualSync = async () => {
    if (!authUser) return;
    setIsManualSyncing(true);
    setCloudMsg("");
    const res = await saveCloudWorkspace(getExportPayload());
    setIsManualSyncing(false);
    if (res.success) {
      if (sounds) sounds.playBellChime();
      setCloudMsg(`Workspace successfully synced to Supabase at ${res.syncedAt}!`);
    } else {
      if (sounds) sounds.playPop();
      setCloudMsg(`Sync failed: ${res.error}`);
    }
  };

  const handleSignOut = () => {
    if (sounds) sounds.playPop();
    onClose();
    openLogoutModal();
  };

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
  const [newAppTag, setNewAppTag] = useState("Project");
  const [newAppColor, setNewAppColor] = useState("#5F7A49");
  const [newAppQuota, setNewAppQuota] = useState(2);

  // New Tag / Filter Form
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🏷️");
  const [newCatColor, setNewCatColor] = useState("#5F7A49");

  const fileInputRef = useRef(null);
  const tabsNavRef = useRef(null);

  // Sync profile form when modal opens or userProfile changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (userProfile) {
        setProfileForm({
          avatar: userProfile.avatar || "🧸",
          name: userProfile.name || "SPROUT",
          handle: userProfile.handle || "(@^ 0 ^)",
          title: userProfile.title || "frontend / developer / plant parent",
          mood: userProfile.mood || "in the coding flow",
          bio:
            userProfile.bio !== undefined && userProfile.bio !== null
              ? userProfile.bio
              : "Hello friend! Welcome to your cozy desk. Take sips of water, stretch often, and celebrate small commits! ☕🌱",
          dailyIntention: userProfile.dailyIntention || "",
        });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const handleTabChange = (tabId, event) => {
    if (sounds) sounds.playClick();
    setDeskMenuTab(tabId);

    // Auto-scroll logic: If clicked tab is at or near the right boundary, slide it to be the first!
    if (event?.currentTarget && tabsNavRef.current) {
      const container = tabsNavRef.current;
      const tab = event.currentTarget;
      const tabLeft = tab.offsetLeft;
      const tabWidth = tab.offsetWidth;
      const containerLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;

      // When clicking the last tab(s) shown on the screen (near right edge),
      // auto-scroll so the clicked tab slides to the beginning of the viewport (becomes first)
      if (tabLeft + tabWidth >= containerLeft + containerWidth - 30) {
        container.scrollTo({ left: tabLeft, behavior: "smooth" });
      } else if (tabLeft < containerLeft + 30) {
        container.scrollTo({ left: Math.max(0, tabLeft - 20), behavior: "smooth" });
      }
    }
  };

  const handleScrollTabs = (direction) => {
    if (sounds) sounds.playPop();
    if (!tabsNavRef.current) return;
    const container = tabsNavRef.current;
    const scrollAmount = Math.max(160, Math.floor(container.clientWidth * 0.65));
    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
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
      dailyTarget: Number(newAppQuota) || 2,
    });

    setNewAppName("");
    setNewAppTag("Project");
    setNewAppColor("#5F7A49");
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

        {/* Tab Navigation with Left/Right Arrows & Hidden Scrollbars */}
        <div className={styles.tabsNavWrapper}>
          <button
            type="button"
            className={styles.tabsScrollBtn}
            onClick={() => handleScrollTabs("left")}
            title="Scroll tabs left"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft size={16} />
          </button>

          <div className={styles.tabsNav} ref={tabsNavRef}>
            <button
              className={`${styles.tabBtn} ${deskMenuTab === "profile" ? styles.tabBtnActive : ""}`}
              onClick={(e) => handleTabChange("profile", e)}
            >
              <User size={14} /> Profile
            </button>
            <button
              className={`${styles.tabBtn} ${deskMenuTab === "shelves" ? styles.tabBtnActive : ""}`}
              onClick={(e) => handleTabChange("shelves", e)}
            >
              <Bookmark size={14} /> Shelves
            </button>
            <button
              className={`${styles.tabBtn} ${deskMenuTab === "apps" ? styles.tabBtnActive : ""}`}
              onClick={(e) => handleTabChange("apps", e)}
            >
              <FolderKanban size={14} /> Projects & Quotas
            </button>
            <button
              className={`${styles.tabBtn} ${deskMenuTab === "tags" ? styles.tabBtnActive : ""}`}
              onClick={(e) => handleTabChange("tags", e)}
            >
              <Tag size={14} /> Task Filters & Tags
            </button>
            <button
              className={`${styles.tabBtn} ${deskMenuTab === "theme" ? styles.tabBtnActive : ""}`}
              onClick={(e) => handleTabChange("theme", e)}
            >
              <Palette size={14} /> Themes & Ambience
            </button>
            <button
              className={`${styles.tabBtn} ${deskMenuTab === "data" ? styles.tabBtnActive : ""}`}
              onClick={(e) => handleTabChange("data", e)}
            >
              <Database size={14} /> Data & Backup
            </button>
            <button
              className={`${styles.tabBtn} ${deskMenuTab === "cloud" ? styles.tabBtnActive : ""}`}
              onClick={(e) => handleTabChange("cloud", e)}
            >
              <Cloud size={14} /> Cloud & Account
            </button>
          </div>

          <button
            type="button"
            className={styles.tabsScrollBtn}
            onClick={() => handleScrollTabs("right")}
            title="Scroll tabs right"
            aria-label="Scroll tabs right"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.body}>
          {/* TAB 1: PROFILE */}
          {deskMenuTab === "profile" && (
            <form onSubmit={handleSaveProfile}>
              {/* Cozy Developer Level & Progression Hub */}
              <div className={styles.levelHubCard}>
                <div className={styles.levelHubHeader}>
                  <div className={styles.levelHubBadge}>
                    <span className={styles.levelHubEmoji}>{levelData?.icon || "🌱"}</span>
                    <div>
                      <div className={styles.levelHubTitle}>
                        Level {levelData?.level || 1}: {levelData?.title || "Cozy Sprout"}
                      </div>
                      <div className={styles.levelHubSub}>
                        Total Progression: <strong>{levelData?.totalXp || 0} XP</strong>
                      </div>
                    </div>
                  </div>
                  <div className={styles.levelHubNextPill}>
                    {levelData?.nextTier
                      ? `${(levelData.neededForNext || 100) - (levelData.currentLevelXp || 0)} XP to ${levelData.nextTier.title}`
                      : "Max Mythic Tier Reached! ✨"}
                  </div>
                </div>

                <div className={styles.levelHubProgressBar}>
                  <div
                    className={styles.levelHubProgressFill}
                    style={{ width: `${levelData?.progressPercent || 0}%` }}
                  />
                </div>
                <div className={styles.levelHubProgressLabels}>
                  <span>Progress to Next Tier</span>
                  <span>
                    {levelData?.progressPercent || 0}% ({levelData?.currentLevelXp || 0} / {levelData?.neededForNext || 100} XP)
                  </span>
                </div>

                <div className={styles.xpSourcesRow}>
                  <span className={styles.xpSourceTag}>🌱 Task Harvested: +{XP_REWARDS?.HARVEST_TASK || 20} XP</span>
                  <span className={styles.xpSourceTag}>☕ Mindful Pomodoro: +{XP_REWARDS?.FOCUS_SESSION || 15} XP</span>
                  <span className={styles.xpSourceTag}>📝 Micro-Learning: +{XP_REWARDS?.LEARNING_NOTE || 10} XP</span>
                  <span className={styles.xpSourceTag}>🍵 Hydration Sip: +{XP_REWARDS?.SIP_WATER || 5} XP</span>
                  <span className={styles.xpSourceTag}>✨ Desk Stamp: +{XP_REWARDS?.STAMP || 2} XP</span>
                </div>
              </div>

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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                  <label className={styles.label} style={{ margin: 0 }}>Desk Bio & Greeting</label>
                  <span style={{ fontSize: "0.72rem", color: "var(--cozy-text-muted)" }}>
                    Customizable • Live on companion card
                  </span>
                </div>
                <textarea
                  rows={2}
                  className={styles.textarea}
                  placeholder="Hello friend! Welcome to your cozy desk. Take sips of water, stretch often, and celebrate small commits! ☕🌱"
                  value={profileForm.bio ?? ""}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                />
              </div>

              {/* Automated Daily Intention Card */}
              <div className={styles.dailyQuoteCard}>
                <div className={styles.dailyQuoteHeader}>
                  <div className={styles.dailyQuoteTitle}>
                    <span>🍯</span>
                    <strong>Today&apos;s Automated Intention Quote</strong>
                  </div>
                  <span className={styles.dailyQuoteBadge}>🌱 Rotates at midnight</span>
                </div>

                <p className={styles.dailyQuoteText}>
                  &ldquo;{userProfile?.dailyIntention || profileForm.dailyIntention}&rdquo;
                </p>

                <div className={styles.dailyQuoteActions}>
                  <span className={styles.dailyQuoteHint}>
                    Mindful developer affirmation rotated automatically each calendar day.
                  </span>
                  <button
                    type="button"
                    className={styles.shuffleQuoteBtn}
                    onClick={() => {
                      if (sounds) sounds.playPop();
                      shuffleDailyQuote();
                    }}
                    title="Roll another inspiring quote for today"
                  >
                    <Sparkles size={13} />
                    <span>Shuffle Today&apos;s Quote</span>
                  </button>
                </div>
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

              {/* Add New Bookmark Form - Positioned ABOVE the list */}
              <form onSubmit={handleAddShelf} className={styles.addFormCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--cozy-green-header)" }}>
                    + Add New Shelf Link
                  </span>
                  <span style={{ fontSize: "0.74rem", color: "var(--cozy-text-muted)" }}>
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

              {/* Current Shelves List */}
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
            </div>
          )}

          {/* TAB 3: PROJECTS & QUOTAS */}
          {deskMenuTab === "apps" && (
            <div>
              <div className={styles.sectionTitle}>Workspace Projects & Daily Targets</div>
              <div className={styles.sectionSubtitle}>
                Manage your active projects and adjust daily quota targets for the Daily Task Goals meter.
              </div>

              {/* Add New App Form - Positioned ABOVE the list */}
              <form onSubmit={handleAddApp} className={styles.addFormCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--cozy-green-header)" }}>
                    + Add New Project
                  </span>
                  <span style={{ fontSize: "0.74rem", color: "var(--cozy-text-muted)" }}>
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

                <div className={styles.addAppInputsGrid}>
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
                    placeholder="Tag (e.g. Mobile, Web)"
                    className={styles.input}
                    value={newAppTag}
                    onChange={(e) => setNewAppTag(e.target.value)}
                  />
                  <input
                    type="color"
                    value={newAppColor}
                    onChange={(e) => setNewAppColor(e.target.value)}
                    title="Project Color"
                    style={{ width: "34px", height: "34px", border: "none", borderRadius: "8px", cursor: "pointer", background: "none" }}
                  />
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newAppQuota}
                    onChange={(e) => setNewAppQuota(Number(e.target.value))}
                    title="Daily Target (tasks/day)"
                    style={{ width: "100%", padding: "6px 4px", borderRadius: "8px", border: "1px solid #ccc", textAlign: "center" }}
                  />
                  <button type="submit" className={styles.primaryBtn} style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <Plus size={15} /> Add
                  </button>
                </div>
              </form>

              {/* Current Projects List */}
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
            </div>
          )}

          {/* TAB: TASK FILTERS & TAGS */}
          {deskMenuTab === "tags" && (
            <div>
              <div className={styles.sectionTitle}>Task Filters & Categories</div>
              <div className={styles.sectionSubtitle}>
                Customize quick filter tags used across your sprint board and quest creation.
              </div>

              {/* Add New Tag / Filter Form - Positioned ABOVE the list */}
              <form onSubmit={handleAddCategory} className={styles.addFormCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--cozy-green-header)" }}>
                    + Add New Category Filter
                  </span>
                  <span style={{ fontSize: "0.74rem", color: "var(--cozy-text-muted)" }}>
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

              {/* Categories List */}
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

          {/* TAB 7: CLOUD & ACCOUNT */}
          {deskMenuTab === "cloud" && (
            <div>
              <div className={styles.sectionTitle}>Cloud Workspace & Online Authorization</div>
              <div className={styles.sectionSubtitle}>
                Synchronize your dev quests, cozy notes, shelves, and developer XP safely across your devices.
              </div>

              {cloudMsg && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "var(--cozy-green-light, #eef5e6)",
                    border: "1px solid var(--cozy-green-accent, #78995a)",
                    color: "var(--cozy-green-header, #50683a)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    marginBottom: "14px",
                  }}
                >
                  {cloudMsg}
                </div>
              )}

              {authUser ? (
                <>
                  {/* Account Status Card */}
                  <div className={styles.dataActionBox} style={{ background: "var(--cozy-bg-warm, #faf7ef)" }}>
                    <div className={styles.dataActionText}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <strong>{authUser.email}</strong>
                        <span
                          className={`${styles.cloudStatusBadge} ${syncStatus === "error"
                              ? styles.cloudStatusBadgeError
                              : syncStatus === "offline"
                                ? styles.cloudStatusBadgeOffline
                                : ""
                            }`}
                        >
                          {syncStatus === "syncing"
                            ? "Syncing..."
                            : syncStatus === "error"
                              ? "Sync Error"
                              : "Cloud Active ✓"}
                        </span>
                      </div>
                      <p>
                        Last synchronized:{" "}
                        {lastSyncedAt ? <strong>{lastSyncedAt}</strong> : "Awaiting first sync"}
                      </p>
                      {syncError && (
                        <p style={{ color: "#b91c1c", marginTop: 4 }}>
                          Notice: {syncError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Manual Sync Now */}
                  <div className={styles.dataActionBox}>
                    <div className={styles.dataActionText}>
                      <strong>Push Workspace to Cloud</strong>
                      <p>Immediately sync all latest quests, notes, hydration, and settings.</p>
                    </div>
                    <button
                      type="button"
                      className={styles.primaryBtn}
                      onClick={handleManualSync}
                      disabled={isManualSyncing}
                      style={{ padding: "8px 16px" }}
                    >
                      <RefreshCw size={14} className={isManualSyncing ? styles.syncSpin : ""} />
                      <span>{isManualSyncing ? "Syncing..." : "Sync Now"}</span>
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className={styles.dataActionBox}>
                    <div className={styles.dataActionText}>
                      <strong>Sign Out of Account</strong>
                      <p>Disconnect cloud sync on this device. Your data remains safe in the cloud.</p>
                    </div>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={handleSignOut}
                      style={{ padding: "8px 14px", color: "#a84738" }}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Guest Mode Card */}
                  <div className={styles.dataActionBox}>
                    <div className={styles.dataActionText}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <strong>Guest Workspace (Local Only)</strong>
                        <span className={`${styles.cloudStatusBadge} ${styles.cloudStatusBadgeOffline}`}>
                          Local Device Only
                        </span>
                      </div>
                      <p>
                        Your quests and settings are stored locally on this machine. Sign in to sync across devices!
                      </p>
                    </div>
                  </div>

                  <div className={styles.dataActionBox}>
                    <div className={styles.dataActionText}>
                      <strong>Connect Free Cloud Account</strong>
                      <p>Sign in or register with email to enable seamless cross-device cloud synchronization.</p>
                    </div>
                    <button
                      type="button"
                      className={styles.primaryBtn}
                      onClick={() => {
                        onClose();
                        openAuthModal("login");
                      }}
                      style={{ padding: "8px 16px" }}
                    >
                      <LogIn size={14} /> Sign In / Register
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={styles.footer}>
          <div style={{ fontSize: "0.78rem", color: "#8c8371" }}>
            🍵 DevSprout Cozy Hub • all preferences autosaved
          </div>
          <button
            className={styles.secondaryBtn}
            onClick={() => {
              if (deskMenuTab === "profile") {
                updateUserProfile(profileForm);
              }
              onClose();
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
