/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Task, User, Project, Folder } from "../types";
import { MessageSquare, Paperclip, ChevronLeft, ChevronRight, Calendar, Bookmark } from "lucide-react";

interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  projects: Project[];
  folders: Folder[];
  onUpdateStatus: (taskId: string, newStatus: Task["status"]) => void;
  onEditTask: (task: Task) => void;
  onToggleFavorite: (task: Task) => void;
}

const COLUMNS: { id: Task["status"]; title: string; color: string; bg: string; text: string }[] = [
  { id: "todo", title: "To Do", color: "indigo-500", bg: "bg-indigo-500/10", text: "text-indigo-400" },
  { id: "in_progress", title: "In Progress", color: "amber-500", bg: "bg-amber-500/10", text: "text-amber-400" },
  { id: "review", title: "Under Review", color: "purple-500", bg: "bg-purple-500/10", text: "text-purple-400" },
  { id: "completed", title: "Completed", color: "emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-400" }
];

export default function KanbanBoard({
  tasks,
  users,
  projects,
  folders,
  onUpdateStatus,
  onEditTask,
  onToggleFavorite
}: KanbanBoardProps) {

  // Helper to change column status
  const cycleStatus = (task: Task, direction: "prev" | "next") => {
    const statuses: Task["status"][] = ["todo", "in_progress", "review", "completed"];
    const currIdx = statuses.indexOf(task.status);
    let nextIdx = currIdx + (direction === "next" ? 1 : -1);
    if (nextIdx >= 0 && nextIdx < statuses.length) {
      onUpdateStatus(task.id, statuses[nextIdx]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" id="kanban-board-view">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div key={col.id} className="flex flex-col bg-[#16191E] border border-white/5 rounded-2xl p-4 min-h-[500px]">
            
            {/* Column Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full bg-${col.color}`}></div>
                <h3 className="font-sans font-bold text-sm text-slate-200">{col.title}</h3>
                <span className="text-[11px] font-semibold text-slate-500 bg-[#0F1115] px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Task Card List */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[70vh]">
              {columnTasks.length === 0 ? (
                <div className="h-28 border border-dashed border-white/10 rounded-xl flex items-center justify-center p-4">
                  <span className="text-xs text-slate-600 font-medium italic">Empty Column</span>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.projectId);
                  const folder = folders.find((f) => f.id === task.folderId);
                  
                  // Get assignees users
                  const taskAssignees = users.filter((u) => task.assignees.includes(u.id));

                  return (
                    <div
                      key={task.id}
                      className="bg-[#1C2026] hover:bg-[#1C2026]/90 border border-white/5 hover:border-indigo-500/50 rounded-xl p-4 shadow-sm transition-all duration-200 group flex flex-col justify-between"
                      id={`kanban-card-${task.id}`}
                    >
                      <div>
                        {/* Card Header: Task ID, Favorite button, and Project tag */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[10px] font-semibold text-slate-500 tracking-wider">
                            {task.id}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onToggleFavorite(task)}
                              className={`p-1 rounded hover:bg-white/5 transition-all ${
                                task.isFavorite ? "text-amber-400" : "text-slate-600 hover:text-slate-400"
                              }`}
                              title={task.isFavorite ? "Remove favorite" : "Mark as favorite"}
                            >
                              <Bookmark className="h-3.5 w-3.5 fill-current" />
                            </button>
                            <span 
                              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                task.priority === "high"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  : task.priority === "medium"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-white/5 text-slate-400 border-white/5"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </div>

                        {/* Project / Folder display */}
                        {project && (
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                              {project.name}
                            </span>
                            {folder && (
                              <>
                                <span className="text-slate-600 text-[10px]">/</span>
                                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[90px]">
                                  {folder.name}
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Title */}
                        <h4 
                          onClick={() => onEditTask(task)}
                          className="font-sans font-semibold text-xs text-slate-200 hover:text-indigo-400 transition-all leading-snug cursor-pointer mb-2.5"
                        >
                          {task.title}
                        </h4>

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3.5">
                            {task.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] font-semibold text-indigo-400/80 bg-indigo-950/20 px-1.5 py-0.5 rounded border border-indigo-950/40"
                              >
                                #{tag}
                              </span>
                            ))}
                            {task.tags.length > 3 && (
                              <span className="text-[8px] font-bold text-slate-500 bg-slate-950 px-1 py-0.5 rounded">
                                +{task.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer: Date, Assignees, and status quick-cycle buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-900 mt-2">
                        {/* Due Date Indicator */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Calendar className="h-3 w-3 text-slate-600" />
                          <span className="font-mono">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "No date"}
                          </span>
                        </div>

                        {/* Assignees Avatars */}
                        <div className="flex items-center">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {taskAssignees.map((user) => (
                              <div
                                key={user.id}
                                className="inline-block h-5.5 w-5.5 rounded-full bg-slate-800 text-[9px] text-slate-200 font-bold border border-slate-950 flex items-center justify-center"
                                title={user.name}
                              >
                                {user.name.split(" ").map((n) => n[0]).join("")}
                              </div>
                            ))}
                          </div>

                          {/* Quick movement navigation triggers (Absolute high reliability instead of finicky HTML5 drag-and-drop) */}
                          <div className="flex items-center gap-1 ml-3 border-l border-slate-800 pl-2">
                            <button
                              onClick={() => cycleStatus(task, "prev")}
                              disabled={task.status === "todo"}
                              className="p-1 rounded hover:bg-slate-800 disabled:opacity-20 text-slate-400 disabled:hover:bg-transparent"
                              title="Move back"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => cycleStatus(task, "next")}
                              disabled={task.status === "completed"}
                              className="p-1 rounded hover:bg-slate-800 disabled:opacity-20 text-slate-400 disabled:hover:bg-transparent"
                              title="Move forward"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Sub counts */}
                      <div className="flex gap-2.5 mt-2 justify-start items-center text-[10px] text-slate-600">
                        {task.commentsCount && task.commentsCount > 0 ? (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {task.commentsCount}
                          </span>
                        ) : null}
                        {task.attachments && task.attachments.length > 0 ? (
                          <span className="flex items-center gap-1">
                            <Paperclip className="h-3 w-3" />
                            {task.attachments.length}
                          </span>
                        ) : null}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
