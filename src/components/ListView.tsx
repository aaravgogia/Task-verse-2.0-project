/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Task, User, Project, Folder } from "../types";
import { Search, ChevronDown, CheckCircle, Bookmark, Circle, Edit2, MessageSquare, Trash2, Calendar, FolderMinus, AlertCircle } from "lucide-react";

interface ListViewProps {
  tasks: Task[];
  users: User[];
  projects: Project[];
  folders: Folder[];
  onUpdateStatus: (taskId: string, newStatus: Task["status"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleFavorite: (task: Task) => void;
}

export default function ListView({
  tasks,
  users,
  projects,
  folders,
  onUpdateStatus,
  onEditTask,
  onDeleteTask,
  onToggleFavorite
}: ListViewProps) {
  
  // Filtering and Sorting States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"id" | "title" | "dueDate" | "priority">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Priority ranking mapping for sorting
  const PRIORITY_WEIGHTS = { high: 3, medium: 2, low: 1 };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          t.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comp = 0;
    if (sortField === "id" || sortField === "title" || sortField === "dueDate") {
      const valA = a[sortField] || "";
      const valB = b[sortField] || "";
      comp = valA.localeCompare(valB);
    } else if (sortField === "priority") {
      const valA = PRIORITY_WEIGHTS[a.priority];
      const valB = PRIORITY_WEIGHTS[b.priority];
      comp = valA - valB;
    }
    return sortOrder === "asc" ? comp : -comp;
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-4" id="list-view-container">
      {/* Filtering and Search Ribbon Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#16191E] border border-white/5 rounded-2xl p-4">
        
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, title, or description..."
            className="w-full bg-[#0F1115] border border-white/5 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none transition-all placeholder-slate-600"
            id="search-tasks-input"
          />
        </div>

        {/* Status Dropdown */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            id="status-filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Under Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Priority Dropdown */}
        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            id="priority-filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="high">🔴 High Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="low">🟢 Low Priority</option>
          </select>
        </div>

      </div>

      {/* Grid List Table */}
      <div className="bg-[#16191E] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#1C2026] text-[10px] uppercase font-bold tracking-wider text-slate-400">
                <th className="py-3 px-4 w-12 text-center">Fav</th>
                <th className="py-3 px-3 w-24 cursor-pointer hover:text-slate-200" onClick={() => handleSort("id")}>
                  Task ID {sortField === "id" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort("title")}>
                  Task Title {sortField === "title" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-3 px-4 w-32 cursor-pointer hover:text-slate-200" onClick={() => handleSort("priority")}>
                  Priority {sortField === "priority" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-3 px-4 w-36 cursor-pointer hover:text-slate-200" onClick={() => handleSort("dueDate")}>
                  Due Date {sortField === "dueDate" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-3 px-4 w-40">Assignees</th>
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-500 italic">
                    No matching tasks found. Adjust your filters or create a new task!
                  </td>
                </tr>
              ) : (
                sortedTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.projectId);
                  const folder = folders.find((f) => f.id === task.folderId);
                  const taskAssignees = users.filter((u) => task.assignees.includes(u.id));

                  const isTaskCompleted = task.status === "completed";

                  return (
                    <tr 
                      key={task.id}
                      className="hover:bg-[#1C2026]/40 transition-all text-xs text-slate-300 group"
                      id={`list-row-${task.id}`}
                    >
                      {/* Favorite Bookmark */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => onToggleFavorite(task)}
                          className={`hover:scale-110 transition-transform ${
                            task.isFavorite ? "text-amber-400" : "text-slate-700 hover:text-slate-500"
                          }`}
                        >
                          <Bookmark className="h-4 w-4 fill-current mx-auto" />
                        </button>
                      </td>

                      {/* ID with status toggle check */}
                      <td className="py-4 px-3 font-mono text-[11px] font-semibold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateStatus(task.id, isTaskCompleted ? "todo" : "completed")}
                            className="text-slate-600 hover:text-indigo-400 transition-colors"
                            title={isTaskCompleted ? "Mark active" : "Mark completed"}
                          >
                            {isTaskCompleted ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-slate-700" />
                            )}
                          </button>
                          <span>{task.id}</span>
                        </div>
                      </td>

                      {/* Title + Project Metadata */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span 
                            onClick={() => onEditTask(task)}
                            className={`font-medium text-slate-200 hover:text-indigo-400 cursor-pointer transition-all leading-normal ${
                              isTaskCompleted ? "line-through text-slate-500" : ""
                            }`}
                          >
                            {task.title}
                          </span>
                          
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                            {project && (
                              <span className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                                {project.name}
                              </span>
                            )}
                            {folder && (
                              <>
                                <span className="text-slate-700">/</span>
                                <span className="flex items-center gap-0.5 text-slate-400">
                                  {folder.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4">
                        <span 
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                            task.priority === "high"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : task.priority === "medium"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            task.priority === "high" ? "bg-rose-500" : task.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
                          }`}></span>
                          {task.priority}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-4 font-mono text-[10px] text-slate-400">
                        {task.dueDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-600" />
                            <span>{new Date(task.dueDate).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">No date</span>
                        )}
                      </td>

                      {/* Assignees circles */}
                      <td className="py-4 px-4">
                        <div className="flex -space-x-1 overflow-hidden">
                          {taskAssignees.map((user) => (
                            <div
                              key={user.id}
                              className="inline-block h-6 w-6 rounded-full bg-slate-800 text-[10px] text-slate-200 font-bold border border-slate-950 flex items-center justify-center cursor-help"
                              title={user.name}
                            >
                              {user.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                          ))}
                          {taskAssignees.length === 0 && (
                            <span className="text-[10px] text-slate-600 italic">Unassigned</span>
                          )}
                        </div>
                      </td>

                      {/* Row Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                            title="Edit task"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-all"
                            title="Delete task"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
