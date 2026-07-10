import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Sparkles,
  Plus,
  FolderPlus,
  Users,
  ArrowUpRight,
  BarChart3,
  PieChart as PieIcon,
  CalendarDays,
  Activity,
  ChevronRight,
  Search,
  Bell,
  UserCheck,
  FileText,
  Share2,
  Zap,
  Award,
  Flame,
  FolderOpen,
  Shield,
  Briefcase,
  Layers,
  ArrowRight,
  CheckSquare,
  Sparkle,
  Download,
  Upload,
  UserPlus
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
  RadialBarChart,
  RadialBar
} from "recharts";
import { Task, User, Project, Folder, ActivityLog } from "../types";

interface DashboardViewProps {
  tasks: Task[];
  users: User[];
  projects: Project[];
  folders: Folder[];
  activities: ActivityLog[];
  currentUser: User | null;
  onSelectTask: (task: Task) => void;
  onCreateTask: () => void;
  onCreateProject: () => void;
  onCreateFolder: () => void;
  onSwitchView: (view: "dashboard" | "kanban" | "list" | "calendar" | "activity") => void;
  fetchState: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  users,
  projects,
  folders,
  activities,
  currentUser,
  onSelectTask,
  onCreateTask,
  onCreateProject,
  onCreateFolder,
  onSwitchView,
  fetchState
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Quick State Time and Greeting
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, [currentTime]);

  // General computed stats from existing tasks
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const review = tasks.filter((t) => t.status === "review").length;
    const pending = tasks.filter((t) => t.status === "todo").length;

    // Check overdue
    const nowStr = new Date().toISOString().split("T")[0];
    const overdueTasks = tasks.filter(
      (t) => t.status !== "completed" && t.dueDate && t.dueDate < nowStr
    );

    // Today's tasks
    const todayTasks = tasks.filter((t) => t.dueDate === nowStr);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      review,
      pending,
      overdue: overdueTasks.length,
      overdueList: overdueTasks,
      todayCount: todayTasks.length,
      todayTasks,
      completionRate
    };
  }, [tasks]);

  // Weekly tasks completed helper data
  const weeklyTrends = useMemo(() => {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const results = weekdays.map((day) => ({ name: day, completed: 0, created: 0 }));

    tasks.forEach((task) => {
      if (task.status === "completed" && task.updatedAt) {
        try {
          const date = new Date(task.updatedAt);
          const dayIndex = date.getDay();
          results[dayIndex].completed += 1;
        } catch (e) {
          // ignore
        }
      }
      if (task.createdAt) {
        try {
          const date = new Date(task.createdAt);
          const dayIndex = date.getDay();
          results[dayIndex].created += 1;
        } catch (e) {
          // ignore
        }
      }
    });

    // Reorder so it starts on Monday
    const mondayFirst = [...results.slice(1), results[0]];
    return mondayFirst;
  }, [tasks]);

  // Status Distribution Data
  const statusDistribution = useMemo(() => {
    return [
      { name: "Todo", value: stats.pending, fill: "#64748B" },
      { name: "In Progress", value: stats.inProgress, fill: "#6366F1" },
      { name: "Review", value: stats.review, fill: "#F59E0B" },
      { name: "Completed", value: stats.completed, fill: "#10B981" }
    ].filter((item) => item.value > 0);
  }, [stats]);

  // Tasks Per Project Data
  const tasksPerProject = useMemo(() => {
    return projects.map((proj) => {
      const projTasks = tasks.filter((t) => t.projectId === proj.id);
      const compl = projTasks.filter((t) => t.status === "completed").length;
      return {
        name: proj.name,
        total: projTasks.length,
        completed: compl,
        rate: projTasks.length > 0 ? Math.round((compl / projTasks.length) * 100) : 0
      };
    });
  }, [projects, tasks]);

  // Personal metrics and activity tracking
  const personalProductivity = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const completedToday = tasks.filter(
      (t) => t.status === "completed" && t.updatedAt && t.updatedAt.startsWith(todayStr)
    ).length;

    // Estimate average focus score
    let focusScore = 65;
    if (stats.completionRate > 80) focusScore = 95;
    else if (stats.completionRate > 50) focusScore = 85;
    else if (stats.completionRate > 30) focusScore = 75;

    // Adjust focus score based on overdue tasks
    focusScore = Math.max(20, focusScore - stats.overdue * 3);

    return {
      focusScore,
      completedToday,
      currentStreak: 4, // Simulated streak
      hoursWorked: 6.5,
      weeklyGoal: 20,
      progressToGoal: Math.min(100, Math.round((stats.completed / 20) * 100))
    };
  }, [tasks, stats]);

  // Smart natural language insights computed directly from real tasks data
  const aiInsights = useMemo(() => {
    const insights = [];

    // Milestone completion insight
    if (stats.completed >= 5) {
      insights.push({
        id: "ins-1",
        text: `Phenomenal velocity! You have completed ${stats.completed} tasks this sprint.`,
        type: "success"
      });
    } else {
      insights.push({
        id: "ins-1",
        text: `Get started on high impact goals. ${stats.pending + stats.inProgress} tasks are currently active.`,
        type: "info"
      });
    }

    // Overdue alerts
    if (stats.overdue > 0) {
      insights.push({
        id: "ins-2",
        text: `${stats.overdue} high priority tasks are overdue. Recommend rescheduling or delegating.`,
        type: "warning"
      });
    } else {
      insights.push({
        id: "ins-2",
        text: "Clean ledger! No tasks are currently overdue. Keep up the high momentum.",
        type: "success"
      });
    }

    // Project progress insight
    const topProj = tasksPerProject.reduce(
      (max, p) => (p.total > max.total ? p : max),
      { name: "None", total: 0, completed: 0, rate: 0 }
    );
    if (topProj.total > 0) {
      insights.push({
        id: "ins-3",
        text: `Project '${topProj.name}' is leading active load with ${topProj.total} tasks (${topProj.rate}% completed).`,
        type: "info"
      });
    }

    return insights;
  }, [stats, tasksPerProject]);

  // Filter tasks based on simple search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return tasks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query))
      )
      .slice(0, 5);
  }, [tasks, searchQuery]);

  // Export tasks as CSV format
  const handleExportTasks = () => {
    try {
      const headers = ["Task ID", "Title", "Status", "Priority", "Due Date", "Project ID", "Created At"];
      const rows = tasks.map((t) => [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        t.status,
        t.priority,
        t.dueDate || "N/A",
        t.projectId,
        t.createdAt
      ]);
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `taskverse_export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setCopiedNotification("Successfully exported all workspace tasks!");
      setTimeout(() => setCopiedNotification(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Simulate CSV import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImportStatus(`Parsing '${file.name}'...`);
      setTimeout(() => {
        setImportStatus(`Successfully mock-imported 5 tasks from ${file.name}!`);
        fetchState();
        setTimeout(() => setImportStatus(null), 4000);
      }, 1500);
    }
  };

  // Handle simulated team invite
  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteSuccess(true);
    setInviteEmail("");
    setTimeout(() => setInviteSuccess(false), 3000);
  };

  // Mini Sparkline Generator
  const renderSparkline = (data: { completed: number }[], strokeColor: string) => {
    return (
      <div className="h-6 w-16 opacity-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <Area
              type="monotone"
              dataKey="completed"
              stroke={strokeColor}
              fill={`${strokeColor}1A`}
              strokeWidth={1.5}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Overdue and High Priority lists
  const urgentTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status !== "completed" && (t.priority === "high" || t.dueDate))
      .sort((a, b) => {
        if (a.priority === "high" && b.priority !== "high") return -1;
        if (b.priority === "high" && a.priority !== "high") return 1;
        return (a.dueDate || "") > (b.dueDate || "") ? 1 : -1;
      })
      .slice(0, 5);
  }, [tasks]);

  return (
    <div className="space-y-6 pb-12" id="dashboard-view-main">
      
      {/* Top Notification Banner */}
      <AnimatePresence>
        {copiedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-xl backdrop-blur-md text-xs font-semibold"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{copiedNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: WELCOME HEADER */}
      <div className="relative overflow-hidden bg-[#181D26]/60 border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6" id="dashboard-welcome-banner">
        
        {/* Abstract background blobs for premium feel */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 sm:gap-6 z-10">
          <div className="relative group">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-indigo-500/30 shadow-lg group-hover:scale-105 transition-transform duration-300 bg-slate-800"
              />
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-indigo-900/40 border border-indigo-500/20 flex items-center justify-center font-extrabold text-xl text-indigo-300">
                {currentUser?.name.split(" ").map(n => n[0]).join("") || "U"}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-4 border-[#16191E] animate-pulse" />
          </div>

          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase font-mono bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                {currentUser?.role === "admin" ? "ADMIN WORKSPACE" : "MEMBER WORKSPACE"}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              <span>{greeting}, {currentUser?.name || "Aarav Gogia"}</span>
              <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse hidden sm:inline" />
            </h2>
            
            <p className="text-xs text-slate-400 max-w-md">
              Today is <span className="font-semibold text-slate-300">{currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>. You have <span className="text-indigo-400 font-bold">{stats.todayCount}</span> tasks scheduled for today.
            </p>
          </div>
        </div>

        {/* Dynamic actions / widget inside Welcome Banner */}
        <div className="flex items-center gap-3 self-start md:self-center z-10 w-full md:w-auto">
          
          {/* Quick Search */}
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Quick search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-56 pl-10 pr-4 py-2 bg-[#12151B]/80 border border-white/5 focus:border-indigo-500/50 rounded-2xl text-xs placeholder-slate-500 text-slate-200 outline-none transition-all shadow-inner"
            />

            {/* Quick search match float */}
            <AnimatePresence>
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-12 w-72 bg-[#141820] border border-white/10 rounded-2xl shadow-2xl p-3 z-50 space-y-2 text-left"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matched Tasks ({searchResults.length})</span>
                    <button onClick={() => setSearchQuery("")} className="text-[10px] text-slate-500 hover:text-slate-300">Clear</button>
                  </div>
                  {searchResults.length === 0 ? (
                    <div className="text-[11px] text-slate-500 text-center py-2">No matching tasks found</div>
                  ) : (
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                      {searchResults.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => {
                            onSelectTask(task);
                            setSearchQuery("");
                          }}
                          className="p-2 rounded-xl bg-white/5 hover:bg-indigo-500/10 hover:text-indigo-300 cursor-pointer text-xs font-semibold transition-all border border-transparent hover:border-indigo-500/20"
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-indigo-400 font-mono font-bold">{task.id}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                              task.priority === "high" ? "bg-rose-500/10 text-rose-400" :
                              task.priority === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-slate-500/10 text-slate-400"
                            }`}>{task.priority}</span>
                          </div>
                          <p className="truncate text-slate-200 text-[11px]">{task.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Notifications Panel Icon */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationCenter(!showNotificationCenter)}
              className={`p-2.5 rounded-2xl border transition-all relative cursor-pointer ${
                showNotificationCenter
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-indigo-500/5"
                  : "bg-[#12151B]/80 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15"
              }`}
            >
              <Bell className="h-4.5 w-4.5" />
              {stats.overdue > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-rose-500 rounded-full border-2 border-[#16191E]" />
              )}
            </button>

            {/* Notification drop */}
            <AnimatePresence>
              {showNotificationCenter && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-12 w-80 bg-[#141820] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 space-y-3 text-left"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-indigo-400" />
                      Workspace Activity
                    </span>
                    <button onClick={() => setShowNotificationCenter(false)} className="text-[10px] text-slate-500 hover:text-slate-300">Close</button>
                  </div>
                  
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                    {stats.overdue > 0 && (
                      <div className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/15 text-xs text-rose-400 space-y-1">
                        <p className="font-bold flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="h-3.5 w-3.5" /> Overdue Blockers ({stats.overdue})
                        </p>
                        <p className="text-[10px] text-slate-400 leading-tight">These high priority deliverables are past due date.</p>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recent System Signals</span>
                      {activities.slice(0, 3).map((act) => (
                        <div key={act.id} className="text-[11px] leading-relaxed text-slate-300 border-b border-white/5 pb-1.5">
                          <span className="font-semibold text-slate-200">{act.userName}</span> {act.details}
                          <span className="block text-[9px] text-slate-500 mt-0.5">{new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* SECTION 2: KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-kpi-grid">
        {[
          {
            title: "Total Scope",
            value: stats.total,
            sub: "Tasks logged",
            color: "text-indigo-400",
            bg: "hover:border-indigo-500/20 shadow-indigo-500/5",
            icon: Briefcase,
            sparkData: weeklyTrends.map(w => ({ completed: w.created }))
          },
          {
            title: "Completed",
            value: stats.completed,
            sub: `${stats.completionRate}% Completion`,
            color: "text-emerald-400",
            bg: "hover:border-emerald-500/20 shadow-emerald-500/5",
            icon: CheckCircle2,
            sparkData: weeklyTrends
          },
          {
            title: "In Progress",
            value: stats.inProgress,
            sub: "Active execution",
            color: "text-indigo-400",
            bg: "hover:border-indigo-500/20 shadow-indigo-500/5",
            icon: Clock,
            sparkData: weeklyTrends.map(w => ({ completed: Math.max(1, w.created - w.completed) }))
          },
          {
            title: "Overdue Alert",
            value: stats.overdue,
            sub: "Requires attention",
            color: stats.overdue > 0 ? "text-rose-400 font-bold" : "text-slate-400",
            bg: stats.overdue > 0 ? "hover:border-rose-500/30 border-rose-500/10 shadow-rose-500/5" : "hover:border-slate-500/20",
            icon: AlertTriangle,
            sparkData: stats.overdueList.map((_, i) => ({ completed: i + 1 }))
          }
        ].map((card, idx) => {
          const CardIcon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`relative overflow-hidden bg-[#181D26]/60 border border-white/5 rounded-2xl p-5 shadow-lg transition-all ${card.bg}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.title}</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${card.color}`}>
                      {card.value}
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-white/5 text-slate-300">
                  <CardIcon className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <span className="text-[10px] text-slate-500">{card.sub}</span>
                {renderSparkline(card.sparkData.length > 0 ? card.sparkData : [{ completed: 0 }, { completed: 2 }, { completed: 1 }], card.color.includes("emerald") ? "#10B981" : card.color.includes("rose") ? "#F43F5E" : "#6366F1")}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* PRIMARY TWO-COLUMN LAYOUT: CHARTS & ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: CHARTS, MY TASKS, PROJECTS (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SECTION 3: PRODUCTIVITY ANALYTICS */}
          <div className="bg-[#181D26]/60 border border-white/5 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-indigo-400" />
                <h3 className="font-sans font-bold text-sm text-slate-200">Velocity & Scope Distribution</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold font-mono">LIVE ANALYTICS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Weekly Trend (Bar/Area) */}
              <div className="md:col-span-7 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed vs Created Tasks (Weekly)</span>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyTrends}>
                      <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222731" />
                      <XAxis dataKey="name" stroke="#5F6775" fontSize={10} tickLine={false} />
                      <YAxis stroke="#5F6775" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#141820", borderColor: "#2D3440" }} labelStyle={{ color: "#94A3B8" }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                      <Area type="monotone" name="Created Tasks" dataKey="created" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorCreated)" />
                      <Area type="monotone" name="Completed Tasks" dataKey="completed" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status breakdown Radial/Pie */}
              <div className="md:col-span-5 space-y-2 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Distribution</span>
                {statusDistribution.length > 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#141820", borderColor: "#2D3440" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex items-center gap-3 justify-center flex-wrap mt-2">
                      {statusDistribution.map((item) => (
                        <div key={item.name} className="flex items-center gap-1 text-[10px]">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                          <span className="text-slate-300 font-semibold">{item.name} ({item.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500">No active tasks loaded. Create tasks to view distribution.</div>
                )}
              </div>

            </div>
          </div>

          {/* SECTION 4: MY TASKS / HIGH IMPACT TARGETS */}
          <div className="bg-[#181D26]/60 border border-white/5 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4.5 w-4.5 text-indigo-400" />
                <h3 className="font-sans font-bold text-sm text-slate-200">High Impact Core Deliverables</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold font-mono">PRIORITY PIPELINE</span>
            </div>

            {urgentTasks.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 space-y-2">
                <Award className="h-8 w-8 mx-auto text-emerald-400/20" />
                <p>No immediate priority items found in this project view.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {urgentTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#12151B]/80 hover:bg-[#1C202B]/80 border border-white/5 hover:border-indigo-500/20 rounded-2xl cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {task.status === "completed" ? (
                          <div className="h-4.5 w-4.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          </div>
                        ) : (
                          <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                            task.status === "in_progress" ? "border-indigo-500/40 bg-indigo-500/5 text-indigo-400" :
                            task.status === "review" ? "border-amber-500/40 bg-amber-500/5 text-amber-400" : "border-slate-500/40"
                          }`}>
                            <Clock className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-500">{task.id}</span>
                          <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{task.title}</span>
                        </div>
                        {task.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 max-w-md">{task.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 mt-2 sm:mt-0 self-end sm:self-center">
                      {task.dueDate && (
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-xl">
                          <Calendar className="h-3 w-3" />
                          {task.dueDate}
                        </span>
                      )}
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        task.priority === "high" ? "bg-rose-500/10 text-rose-400" :
                        task.priority === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-slate-500/10 text-slate-400"
                      }`}>
                        {task.priority}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 5: PROJECT OVERVIEW */}
          <div className="bg-[#181D26]/60 border border-white/5 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4.5 w-4.5 text-indigo-400" />
                <h3 className="font-sans font-bold text-sm text-slate-200">Workspace Projects Health & Delivery</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold font-mono">PORTFOLIO TRACKER</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasksPerProject.map((proj) => {
                const originalProj = projects.find(p => p.name === proj.name);
                const health = proj.rate > 70 ? { label: "Excellent", color: "text-emerald-400 bg-emerald-500/10" } :
                               proj.rate > 40 ? { label: "Steady", color: "text-indigo-400 bg-indigo-500/10" } :
                               { label: "Needs Velocity", color: "text-amber-400 bg-amber-500/10" };

                return (
                  <div
                    key={proj.name}
                    className="p-4 bg-[#12151B]/80 border border-white/5 rounded-2xl space-y-3 shadow-inner hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{proj.name}</h4>
                        <span className="text-[10px] text-slate-500">{proj.total} total scope items</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${health.color}`}>
                        {health.label}
                      </span>
                    </div>

                    {/* Progress slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">Completion Progress</span>
                        <span className="text-indigo-400 font-bold">{proj.rate}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${proj.rate}%`,
                            backgroundColor: originalProj?.color === "indigo" ? "#6366F1" :
                                             originalProj?.color === "rose" ? "#F43F5E" :
                                             originalProj?.color === "amber" ? "#F59E0B" : "#10B981"
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-[10px] text-slate-500">
                      <span>{proj.completed} resolved</span>
                      <span>{proj.total - proj.completed} open</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI INSIGHTS, QUICK ACTIONS, PERSONAL STATS (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* SECTION 8: AI INSIGHTS PANEL (DYNAMIC CLIENT COMPUTED) */}
          <div className="bg-[#181D26]/60 border border-white/5 rounded-3xl p-5 shadow-xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Sparkle className="h-4.5 w-4.5 text-indigo-400 animate-spin-slow" />
              <h3 className="font-sans font-bold text-sm text-slate-200">TaskVerse Smart AI Insights</h3>
            </div>

            <div className="space-y-3">
              {aiInsights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-3 rounded-2xl text-xs flex gap-2.5 items-start leading-relaxed ${
                    insight.type === "success" ? "bg-emerald-500/5 border border-emerald-500/15 text-emerald-300" :
                    insight.type === "warning" ? "bg-rose-500/5 border border-rose-500/15 text-rose-300" :
                    "bg-[#12151B]/80 border border-white/5 text-slate-300"
                  }`}
                >
                  {insight.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
                  {insight.type === "warning" && <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />}
                  {insight.type === "info" && <TrendingUp className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />}
                  <p>{insight.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 9: QUICK ACTIONS */}
          <div className="bg-[#181D26]/60 border border-white/5 rounded-3xl p-5 shadow-xl space-y-3.5">
            <h3 className="font-sans font-bold text-sm text-slate-200 border-b border-white/5 pb-2.5">Quick Actions Console</h3>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onCreateTask}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-lg hover:-translate-y-0.5"
                id="quick-action-new-task"
              >
                <Plus className="h-5 w-5 mb-1 text-white" />
                <span className="text-[10px] font-bold">New Task</span>
              </button>

              <button
                onClick={onCreateProject}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#12151B]/80 border border-white/5 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-400 transition-all cursor-pointer hover:-translate-y-0.5"
                id="quick-action-new-project"
              >
                <FolderPlus className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-bold">New Project</span>
              </button>

              <button
                onClick={() => onSwitchView("calendar")}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#12151B]/80 border border-white/5 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-400 transition-all cursor-pointer hover:-translate-y-0.5"
                id="quick-action-calendar"
              >
                <CalendarDays className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-bold">Open Matrix</span>
              </button>

              <button
                onClick={() => onSwitchView("kanban")}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#12151B]/80 border border-white/5 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-400 transition-all cursor-pointer hover:-translate-y-0.5"
                id="quick-action-kanban"
              >
                <Layers className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-bold">Go Kanban</span>
              </button>
            </div>

            {/* Sub actions (Export / Import / Invite) */}
            <div className="space-y-2 pt-1 border-t border-white/5">
              <button
                onClick={handleExportTasks}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#12151B]/50 hover:bg-[#12151B] border border-white/5 text-slate-300 hover:text-slate-100 transition-colors text-left text-xs font-semibold cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  Export CSV Workspace data
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
              </button>

              <div className="relative w-full">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                  id="import-csv-file-input"
                />
                <label
                  htmlFor="import-csv-file-input"
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#12151B]/50 hover:bg-[#12151B] border border-white/5 text-slate-300 hover:text-slate-100 transition-colors text-left text-xs font-semibold cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Upload className="h-3.5 w-3.5 text-slate-500" />
                    {importStatus || "Import CSV Scope list"}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                </label>
              </div>
            </div>

            {/* Invite Team Member Mini Form */}
            <div className="p-3.5 bg-[#12151B]/40 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Invite Collaborator</span>
              <form onSubmit={handleInviteMember} className="flex gap-1.5">
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-[#12151B] border border-white/5 focus:border-indigo-500/45 px-3 py-1.5 rounded-xl text-xs text-slate-200 outline-none"
                />
                <button
                  type="submit"
                  className="bg-indigo-600/90 hover:bg-indigo-600 text-white p-1.5 rounded-xl cursor-pointer hover:shadow-md"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              </form>
              {inviteSuccess && (
                <p className="text-[9px] font-bold text-emerald-400 animate-pulse">Invite successfully sent in background!</p>
              )}
            </div>
          </div>

          {/* SECTION 10: PERSONAL PRODUCTIVITY */}
          <div className="bg-[#181D26]/60 border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
            <h3 className="font-sans font-bold text-sm text-slate-200 border-b border-white/5 pb-2.5">Personal Metrics & Focus</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 bg-[#12151B]/80 p-3 rounded-2xl border border-white/5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Focus Score</span>
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4.5 w-4.5 text-amber-500" />
                  <span className="text-lg font-extrabold text-slate-200">{personalProductivity.focusScore}</span>
                </div>
              </div>

              <div className="space-y-1 bg-[#12151B]/80 p-3 rounded-2xl border border-white/5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Resolved Today</span>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="h-4.5 w-4.5 text-emerald-400" />
                  <span className="text-lg font-extrabold text-slate-200">{personalProductivity.completedToday}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Sprint Target Progress</span>
                <span className="text-slate-300 font-bold">{stats.completed}/{personalProductivity.weeklyGoal} tasks</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all"
                  style={{ width: `${personalProductivity.progressToGoal}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-medium bg-[#12151B]/50 p-2.5 rounded-xl">
              <span>Avg Streak: {personalProductivity.currentStreak} days</span>
              <span>Estimation: {personalProductivity.hoursWorked} hrs remaining</span>
            </div>
          </div>

          {/* SECTION 12: LIVE WORKSPACE ACTIVITY FEED (RECENT 3) */}
          <div className="bg-[#181D26]/60 border border-white/5 rounded-3xl p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-indigo-400 animate-pulse" />
                <h3 className="font-sans font-bold text-sm text-slate-200">Live Stream</h3>
              </div>
              <button
                onClick={() => onSwitchView("activity")}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
              >
                Full Stream <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 4).map((act, index) => (
                <div key={act.id} className="relative pl-4 border-l border-white/10 text-xs space-y-1">
                  <div className="absolute top-1.5 -left-1.5 h-3 w-3 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center">
                    <span className="h-1 w-1 rounded-full bg-indigo-400" />
                  </div>
                  <div className="text-[11px] leading-relaxed text-slate-300">
                    <span className="font-semibold text-slate-200">{act.userName}</span> {act.details}
                  </div>
                  <p className="text-[9px] text-slate-500">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
