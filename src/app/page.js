"use client";

import React from "react";
import { TaskProvider, useTaskManager } from "@/context/TaskContext";
import WindowFrame from "@/components/WindowFrame";
import DeskView from "@/components/views/DeskView";
import SprintView from "@/components/views/SprintView";
import NotesView from "@/components/views/NotesView";
import CafeView from "@/components/views/CafeView";

function MainContent() {
  const { activeTab } = useTaskManager();

  return (
    <WindowFrame>
      {activeTab === "desk" && <DeskView />}
      {activeTab === "sprint" && <SprintView />}
      {activeTab === "notes" && <NotesView />}
      {activeTab === "cafe" && <CafeView />}
    </WindowFrame>
  );
}

export default function Home() {
  return (
    <TaskProvider>
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <MainContent />
      </main>
    </TaskProvider>
  );
}
