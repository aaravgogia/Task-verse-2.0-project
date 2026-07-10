/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, Project, Folder, Task, Comment, ActivityLog } from "./types";
import { motion, AnimatePresence } from "motion/react";

// Import Components
import LoginScreen from "./components/LoginScreen";
import AIChatbot from "./components/AIChatbot";
import QuickUpdateForm from "./components/QuickUpdateForm";
import TaskForm from "./components/TaskForm";
import KanbanBoard from "./components/KanbanBoard";
import ListView from "./components/ListView";
import CalendarView from "./components/CalendarView";
import ActivityLogView from "./components/ActivityLogView";
import { DashboardView } from "./components/DashboardView";
import LogoutScreen from "./components/LogoutScreen";

// Import Icons
import {
  LayoutDashboard,
  Kanban,
  ListTodo,
  CalendarDays,
  History,
  FolderOpen,
  FolderPlus,
  Plus,
  Share2,
  Settings,
  Bookmark,
  Sparkles,
  Users,
  ChevronRight,
  Trash2,
  Layers,
  LogOut,
  LogIn,
  Shield,
  Info,
  X,
  Sun,
  Moon,
  Bot,
  Send,
  Key,
  Lock
} from "lucide-react";

export default function App() {
  // DB Core States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Navigation / Filter States
  const [activeView, setActiveView] = useState<"dashboard" | "kanban" | "list" | "calendar" | "activity">("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("prj-1"); // Default to Enterprise Web Portal
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all"); // "all" or specific folder ID

  // Theme State ("dark" | "light")
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Active User session (Local credentials auth for Task Verse 2.0)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("usr-1"); // Default backup
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [showLogoutPage, setShowLogoutPage] = useState<boolean>(false);

  // Dialog Modals States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | undefined>(undefined);
  const [prefillDate, setPrefillDate] = useState<string>("");

  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState<boolean>(false);
  const [showTaskAssigner, setShowTaskAssigner] = useState<boolean>(false);

  // New Project Form Inputs
  const [newProjName, setNewProjName] = useState<string>("");
  const [newProjDesc, setNewProjDesc] = useState<string>("");
  const [newProjColor, setNewProjColor] = useState<string>("indigo");

  // New Folder Form Inputs
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [newFolderDesc, setNewFolderDesc] = useState<string>("");

  // Loading indicator
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch full state from Express relational simulation backend
  const fetchState = async () => {
    try {
      const res = await fetch("/api/db");
      if (res.ok) {
        const db = await res.json();
        setTasks(db.tasks || []);
        setUsers(db.users || []);
        setProjects(db.projects || []);
        setFolders(db.folders || []);
        setActivities(db.activities || []);
      }
    } catch (err) {
      console.error("Failed to load relational database state:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchState();

    // Load theme setting
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }

    // Check for saved local credentials user session
    const savedUser = localStorage.getItem("currentUserSession");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setCurrentUserId(parsed.id);
      } catch (err) {
        console.error("Failed to parse local user session:", err);
      }
    }
  }, []);

  const handleLocalLogin = async (role: "admin" | "user", username: string, email: string, avatar: string) => {
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, username, email, avatar })
      });

      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      
      setCurrentUser(data.user);
      setCurrentUserId(data.user.id);
      localStorage.setItem("currentUserSession", JSON.stringify(data.user));
      await fetchState();
    } catch (err) {
      console.error("Login process failed:", err);
      alert("Verification failed. Please check credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserId("usr-1");
    localStorage.removeItem("currentUserSession");
    setShowLogoutPage(true);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  // Update Task Status
  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task["status"]) => {
    const actingUser = users.find(u => u.id === currentUserId);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          userId: currentUserId,
          userName: actingUser ? actingUser.name : "System User"
        })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Task Favorite
  const handleToggleTaskFavorite = async (task: Task) => {
    const actingUser = users.find(u => u.id === currentUserId);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isFavorite: !task.isFavorite,
          userId: currentUserId,
          userName: actingUser ? actingUser.name : "System User"
        })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    const actingUser = users.find(u => u.id === currentUserId);
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}?userId=${currentUserId}&userName=${actingUser ? encodeURIComponent(actingUser.name) : ""}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjName.trim(),
          description: newProjDesc.trim(),
          color: newProjColor,
          isFavorite: false
        })
      });
      if (res.ok) {
        const created = await res.json();
        setSelectedProjectId(created.id);
        setSelectedFolderId("all");
        setIsNewProjectModalOpen(false);
        setNewProjName("");
        setNewProjDesc("");
        setNewProjColor("indigo");
        fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Project
  const handleDeleteProject = async (projId: string) => {
    if (!confirm("Are you sure you want to delete this project? All nested folders and tasks will be removed!")) return;
    try {
      const res = await fetch(`/api/projects/${projId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        const remaining = projects.filter(p => p.id !== projId);
        setSelectedProjectId(remaining[0]?.id || "all");
        setSelectedFolderId("all");
        fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !selectedProjectId) return;

    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          projectId: selectedProjectId,
          description: newFolderDesc.trim()
        })
      });
      if (res.ok) {
        const created = await res.json();
        setSelectedFolderId(created.id);
        setIsNewFolderModalOpen(false);
        setNewFolderName("");
        setNewFolderDesc("");
        fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Share Project
  const handleToggleShareWithUser = async (targetUserId: string) => {
    const currentProj = projects.find(p => p.id === selectedProjectId);
    if (!currentProj) return;

    let sharedList = [...(currentProj.sharedWith || [])];
    if (sharedList.includes(targetUserId)) {
      sharedList = sharedList.filter(id => id !== targetUserId);
    } else {
      sharedList.push(targetUserId);
    }

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isShared: sharedList.length > 0,
          sharedWith: sharedList
        })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open task creator modal with a prefilled date (from calendar cell click)
  const handleAddTaskWithDate = (dateStr: string) => {
    setPrefillDate(dateStr);
    setSelectedTaskForEdit(undefined);
    setIsTaskModalOpen(true);
  };

  // Main UI Filter Logic
  const activeProject = projects.find(p => p.id === selectedProjectId);
  const activeFolder = folders.find(f => f.id === selectedFolderId);

  // Filtered tasks representing current view context
  const mainBoardTasks = tasks.filter((t) => {
    // 1. Filter by Project
    if (selectedProjectId !== "all" && t.projectId !== selectedProjectId) return false;
    // 2. Filter by Folder
    if (selectedFolderId !== "all" && t.folderId !== selectedFolderId) return false;
    // 3. Skip archived (except in list view filters or specific tab)
    if (t.isArchived) return false;
    return true;
  });

  const activeActingUser = currentUser || users.find(u => u.id === currentUserId) || { id: "usr-1", name: "Aarav Gogia", email: "aaravgogia10d@gmail.com" };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen w-screen bg-[#0F1115] items-center justify-center text-slate-100 font-sans">
        <div className="h-10 w-10 border-4 border-t-indigo-500 border-white/5 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold tracking-wider text-slate-400">CONNECTING TO WORKSPACE...</p>
      </div>
    );
  }

  // Check and show the logout page first if triggered
  if (showLogoutPage) {
    return (
      <LogoutScreen
        onReturn={() => setShowLogoutPage(false)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  // Force authenticated credentials login screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLocalLogin}
        isLoggingIn={isLoggingIn}
        users={users}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className={"flex h-screen w-screen bg-app-custom overflow-hidden font-sans text-slate-300 flex-col select-none " + (theme === "light" ? "light" : "")} id="app-workspace">
      
      {/* Upper area containing sidebars and main workspace layout */}
      <div className="flex flex-1 overflow-hidden w-full">
        {/* =========================================================================
           LEFT SIDEBAR: PROJECTS, FOLDERS, & CORE NAV
           ========================================================================= */}
        <aside className="w-64 bg-sidebar-custom border-r border-custom flex flex-col justify-between flex-shrink-0" id="sidebar-panel">
          <div>
            {/* Logo Brand Banner */}
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Layers className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h1 className="font-sans font-extrabold text-sm text-slate-100 tracking-tight leading-none">Task Verse 2.0</h1>
                <span className="text-[10px] text-indigo-400 font-bold font-mono tracking-wider">WORKSPACE</span>
              </div>
            </div>

            {/* Core Views navigation list */}
            <div className="px-3 py-4 space-y-1">
              <span className="block px-3 pb-1 text-[10px] font-bold text-slate-600 uppercase tracking-widest select-none">VIEWS</span>
              
              <button
                onClick={() => setActiveView("dashboard")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  activeView === "dashboard" 
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                }`}
                id="view-dashboard-btn"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard Hub</span>
              </button>

              <button
                onClick={() => setActiveView("kanban")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  activeView === "kanban" 
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                }`}
                id="view-kanban-btn"
              >
                <Kanban className="h-4 w-4" />
                <span>Kanban Board</span>
              </button>

              <button
                onClick={() => setActiveView("list")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  activeView === "list" 
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                }`}
                id="view-list-btn"
              >
                <ListTodo className="h-4 w-4" />
                <span>List Grid</span>
              </button>

              <button
                onClick={() => setActiveView("calendar")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  activeView === "calendar" 
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                }`}
                id="view-calendar-btn"
              >
                <CalendarDays className="h-4 w-4" />
                <span>Calendar Matrix</span>
              </button>

              <button
                onClick={() => setActiveView("activity")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  activeView === "activity" 
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                }`}
                id="view-activity-btn"
              >
                <History className="h-4 w-4" />
                <span>Activity Stream</span>
              </button>
            </div>

            {/* Relational Database Projects Section */}
            <div className="px-3 py-2 flex flex-col">
              <div className="flex items-center justify-between px-3 pb-1.5">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest select-none">PROJECTS</span>
                <button 
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-slate-200"
                  title="Create Project"
                  id="create-project-btn"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                {projects.map((proj) => {
                  const isActive = selectedProjectId === proj.id;
                  return (
                    <motion.div
                      key={proj.id}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      className={`group/proj flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive 
                          ? "bg-white/5 text-slate-100 border border-white/10" 
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                      }`}
                      onClick={() => {
                        setSelectedProjectId(proj.id);
                        setSelectedFolderId("all");
                      }}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className={`h-2 w-2 rounded-full bg-${proj.color}-500 flex-shrink-0`}></div>
                        <span className="truncate">{proj.name}</span>
                      </div>
                      
                      {projects.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(proj.id);
                          }}
                          className="opacity-0 group-hover/proj:opacity-100 p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-all"
                          title="Delete project"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Folders in selected Project */}
            {selectedProjectId !== "all" && (
              <div className="px-3 py-4 flex flex-col border-t border-white/5 mt-2">
                <div className="flex items-center justify-between px-3 pb-1.5">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest select-none">FOLDERS</span>
                  <button
                    onClick={() => setIsNewFolderModalOpen(true)}
                    className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-slate-200"
                    title="Create Folder"
                    id="create-folder-btn"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                  {/* Folder All */}
                  <button
                    onClick={() => setSelectedFolderId("all")}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-left transition-all ${
                      selectedFolderId === "all"
                        ? "text-indigo-400 bg-indigo-500/10 font-bold border border-white/5"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    <span>All Tasks</span>
                  </button>

                  {folders
                    .filter((f) => f.projectId === selectedProjectId)
                    .map((fld) => {
                      const isFldActive = selectedFolderId === fld.id;
                      return (
                        <button
                          key={fld.id}
                          onClick={() => setSelectedFolderId(fld.id)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-left truncate transition-all ${
                            isFldActive
                              ? "text-indigo-400 bg-indigo-500/10 font-bold border border-white/5"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isFldActive ? "rotate-90 text-indigo-400" : "text-slate-600"}`} />
                          <span className="truncate">{fld.name}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

          </div>

          {/* User Sign In and Simulation Selector (Collaboration control!) */}
          <div className="p-4 border-t border-white/5 bg-[#1C2026]/50 flex flex-col gap-3">
            {currentUser && (
              // Authenticated via Credential Role
              <div className="bg-[#0F1115]/50 border border-indigo-500/10 rounded-2xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                    <Shield className="h-3 w-3 fill-indigo-500/10" />
                    <span>{currentUser.role === "admin" ? "ADMIN SECURE" : "MEMBER SECURE"}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1 hover:bg-white/5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-hidden">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full border border-indigo-500/30 object-cover bg-slate-800"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300">
                      {currentUser.name.split(" ").map(n => n[0]).join("")}
                    </div>
                  )}
                  <div className="truncate leading-tight">
                    <span className="block text-[11px] font-bold text-slate-100 truncate">{currentUser.name}</span>
                    <span className="block text-[9px] text-slate-500 truncate">{currentUser.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Team simulation selector */}
            <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
              <span className="text-[10px] text-slate-500 font-medium">Simulate Team Actor:</span>
              <select
                value={currentUserId}
                onChange={(e) => setCurrentUserId(e.target.value)}
                className="bg-[#0F1115] border border-white/5 text-[10px] text-slate-300 rounded p-1 max-w-[100px] focus:outline-none focus:border-indigo-500 cursor-pointer"
                title="Switch actor to simulate team members comments and logs"
                id="actor-simulate-select"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name.split(" ")[0]}</option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* =========================================================================
           MAIN APPLICATION AREA: ACTIONS & THE SELECTED TAB VIEW
           ========================================================================= */}
        <main className="flex-1 flex flex-col bg-app-custom overflow-hidden" id="main-content-panel">
          
          {/* Workspace Top Header Bar */}
          <header className="h-14 bg-sidebar-custom border-b border-custom flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-200 font-sans tracking-tight">
                {activeProject ? activeProject.name : "All Projects"}
              </span>
              {activeFolder && activeFolder !== "all" && (
                <>
                  <span className="text-slate-700">/</span>
                  <span className="text-xs font-semibold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
                    {activeFolder.name}
                  </span>
                </>
              )}
              <div className="h-4 w-[1px] bg-white/10 mx-2 hidden sm:block"></div>
              <div className="hidden md:flex items-center space-x-2 text-[10px] font-mono text-emerald-400 opacity-80">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>PYTHON_BACKEND: RUNNING</span>
                <span className="text-white/30 text-[8px] uppercase tracking-widest ml-3">MySQL 8.0.32 CONNECTED</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Logout Button */}
              {currentUser && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 transition-all duration-300 shadow-sm font-sans font-semibold text-xs cursor-pointer"
                  title="Sign out of the workspace safely"
                  id="header-logout-btn"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}

              {/* Theme Toggle Switcher */}
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300 shadow-sm font-sans font-semibold text-xs cursor-pointer ${
                  theme === "dark"
                    ? "border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10"
                    : "border-indigo-500/20 bg-indigo-500/5 text-indigo-600 hover:bg-indigo-500/10"
                }`}
                title="Toggle between bright light mode and dark mode"
                id="header-theme-toggle"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span className="hidden sm:inline font-sans text-xs font-bold">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="hidden sm:inline font-sans text-xs font-bold">Dark Mode</span>
                  </>
                )}
              </button>

              {/* Share project controls */}
              {activeProject && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-[#0F1115] hover:bg-white/5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all"
                  id="share-project-modal-btn"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share Project</span>
                </button>
              )}

              {/* Create Task button */}
              <button
                onClick={() => {
                  setPrefillDate("");
                  setSelectedTaskForEdit(undefined);
                  setIsTaskModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/10"
                id="create-task-modal-btn"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Task</span>
              </button>
            </div>
          </header>

          {/* Dynamic Inner Workspace Viewport */}
          <div className="flex-1 overflow-y-auto p-6 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeView}-${selectedProjectId}-${selectedFolderId}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="h-full"
              >
                {activeView === "dashboard" && (
                  <DashboardView
                    tasks={mainBoardTasks}
                    users={users}
                    projects={projects}
                    folders={folders}
                    activities={activities}
                    currentUser={currentUser}
                    onSelectTask={(task) => {
                      setSelectedTaskForEdit(task);
                      setIsTaskModalOpen(true);
                      setActiveView("kanban");
                    }}
                    onCreateTask={() => {
                      setSelectedTaskForEdit(undefined);
                      setIsTaskModalOpen(true);
                    }}
                    onCreateProject={() => setIsNewProjectModalOpen(true)}
                    onCreateFolder={() => setIsNewFolderModalOpen(true)}
                    onSwitchView={(view) => setActiveView(view)}
                    fetchState={fetchState}
                  />
                )}

                {activeView === "kanban" && (
                  <KanbanBoard
                    tasks={mainBoardTasks}
                    users={users}
                    projects={projects}
                    folders={folders}
                    onUpdateStatus={handleUpdateTaskStatus}
                    onEditTask={(task) => {
                      setSelectedTaskForEdit(task);
                      setIsTaskModalOpen(true);
                    }}
                    onToggleFavorite={handleToggleTaskFavorite}
                  />
                )}

                {activeView === "list" && (
                  <ListView
                    tasks={mainBoardTasks}
                    users={users}
                    projects={projects}
                    folders={folders}
                    onUpdateStatus={handleUpdateTaskStatus}
                    onEditTask={(task) => {
                      setSelectedTaskForEdit(task);
                      setIsTaskModalOpen(true);
                    }}
                    onDeleteTask={handleDeleteTask}
                    onToggleFavorite={handleToggleTaskFavorite}
                  />
                )}

                {activeView === "calendar" && (
                  <CalendarView
                    tasks={mainBoardTasks}
                    projects={projects}
                    onEditTask={(task) => {
                      setSelectedTaskForEdit(task);
                      setIsTaskModalOpen(true);
                    }}
                    onAddTaskWithDate={handleAddTaskWithDate}
                  />
                )}

                {activeView === "activity" && (
                  <div className="space-y-6" id="activity-stream-view-container">
                    <ActivityLogView activities={activities} />
                    
                    {/* Collapsible Task Assigner Section */}
                    <div className="flex flex-col items-center justify-center pt-2 pb-1">
                      <button
                        onClick={() => setShowTaskAssigner(!showTaskAssigner)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl border font-sans font-bold text-xs transition-all duration-300 shadow-md transform hover:-translate-y-0.5 cursor-pointer ${
                          showTaskAssigner
                            ? "bg-[#111319]/90 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 shadow-indigo-500/5"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white border-transparent hover:shadow-indigo-500/20 shadow-lg"
                        }`}
                        id="activity-toggle-task-assigner"
                        type="button"
                      >
                        <Sparkles className={`h-4 w-4 ${showTaskAssigner ? "rotate-45 text-indigo-400" : "animate-pulse text-white"} transition-transform duration-300`} />
                        <span>{showTaskAssigner ? "Hide Task Assigner" : "Open Task Assigner"}</span>
                      </button>
                    </div>

                    <AnimatePresence>
                      {showTaskAssigner && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: 15 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: 15 }}
                          transition={{ duration: 0.35, ease: "easeInOut" }}
                          className="overflow-hidden"
                          id="activity-stream-quick-update-column"
                        >
                          <div className="bg-card-custom border border-custom rounded-2xl p-6 space-y-4 shadow-xl">
                            <div className="border-b border-custom pb-3 mb-2">
                              <h3 className="font-sans font-bold text-sm text-title-custom flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                                <span>Task Assigner Control Panel</span>
                              </h3>
                              <p className="text-[11px] text-muted-custom mt-1">
                                Assign tasks directly to team members and update titles on the fly. Toggle layout styling dynamically.
                              </p>
                            </div>
                            
                            <div className="max-w-3xl mx-auto">
                              <QuickUpdateForm 
                                tasks={tasks.filter(t => t.projectId === selectedProjectId)} 
                                users={users} 
                                onSuccess={fetchState} 
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </main>

      </div>

      {/* Footer Status Bar matching the Design HTML */}
      <footer className="h-6 bg-indigo-600 px-4 flex items-center justify-between text-[10px] text-white font-medium flex-shrink-0 select-none z-10">
        <div className="flex items-center space-x-4">
          <span>DB: MySQL-PROD-01</span>
          <span>Latency: 24ms</span>
          <span>User: aaravgogia10d@gmail.com</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Version 2.0.4-stable</span>
          <span className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-white mr-1 animate-pulse"></div> Cloud Sync Active</span>
        </div>
      </footer>

      {/* =========================================================================
         DIALOG MODALS: CREATE PROJECT, CREATE FOLDER, SHARE PROJECT, TASKFORM
         ========================================================================= */}
      
      {/* 1. Detail Task Creator/Editor Dialog */}
      {isTaskModalOpen && (
        <TaskForm
          task={selectedTaskForEdit}
          projects={projects}
          folders={folders}
          users={users}
          currentProjectId={selectedProjectId}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={fetchState}
        />
      )}

      {/* 2. Create Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              <span>Create Workspace Project</span>
            </h3>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Q3 Launch Campaign"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Description (Optional)</label>
                <textarea
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Objectives and scope..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Accent Theme Color</label>
                <div className="flex gap-2">
                  {["indigo", "emerald", "amber", "rose", "sky", "purple"].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewProjColor(col)}
                      className={`h-6 w-6 rounded-full bg-${col}-500 border-2 transition-all ${
                        newProjColor === col ? "border-white scale-110" : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-xl border border-slate-800 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Create Folder Modal */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FolderOpen className="h-4.5 w-4.5 text-indigo-400" />
              <span>Create Relational Folder</span>
            </h3>

            <p className="text-[11px] text-slate-500">
              Folders are grouped inside <span className="font-semibold text-slate-300">{activeProject?.name}</span> to structure tasks hierarchically.
            </p>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Folder Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Sprint Backlog"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Purpose/Description (Optional)</label>
                <input
                  type="text"
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  placeholder="Scope of this collection..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-xl border border-slate-800 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Project Share Modal (Collaboration Workspace) */}
      {isShareModalOpen && activeProject && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="share-project-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-400" />
                <span>Share & Collaboration Settings</span>
              </h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 leading-relaxed">
                Configure shared access for <span className="font-semibold text-slate-200">{activeProject.name}</span>. Group members will be permitted to edit tasks, attach documentation, and post comments.
              </div>

              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">TEAM MEMBERS IN WORKSPACE</span>
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto bg-slate-950/40 p-2 border border-slate-800/80 rounded-xl">
                {users.map(u => {
                  const isShared = (activeProject.sharedWith || []).includes(u.id);
                  return (
                    <div 
                      key={u.id} 
                      className="flex items-center justify-between p-2 rounded-lg text-xs hover:bg-slate-900/40 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-300">
                          {u.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="font-medium text-slate-200">{u.name}</span>
                      </div>

                      <button
                        onClick={() => handleToggleShareWithUser(u.id)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                          isShared
                            ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            : "bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20"
                        }`}
                      >
                        {isShared ? "Revoke Access" : "Grant Access"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800/80">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Floating AI Chatbot Helper */}
      <AIChatbot theme={theme} />

    </div>
  );
}
