/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Task, User } from "../types";
import { Check, Edit2, Sparkles, HelpCircle } from "lucide-react";

interface QuickUpdateFormProps {
  tasks: Task[];
  users: User[];
  onSuccess: () => void;
}

export default function QuickUpdateForm({ tasks, users, onSuccess }: QuickUpdateFormProps) {
  // Toggle between wireframe representation and a sleek modern dashboard widget
  const [isWireframeMode, setIsWireframeMode] = useState<boolean>(true);
  
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [employeeName, setEmployeeName] = useState<string>("");
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [completed, setCompleted] = useState<string>("false");
  
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync inputs when selected task changes
  useEffect(() => {
    if (selectedTaskId) {
      const task = tasks.find(t => t.id === selectedTaskId);
      if (task) {
        setTaskTitle(task.title);
        setCompleted(task.status === "completed" ? "true" : "false");
        
        // Find first assignee name if available
        if (task.assignees.length > 0) {
          const user = users.find(u => u.id === task.assignees[0]);
          if (user) {
            setEmployeeName(user.name);
          } else {
            setEmployeeName("");
          }
        } else {
          setEmployeeName("");
        }
      }
    } else {
      setTaskTitle("");
      setCompleted("false");
      setEmployeeName("");
    }
  }, [selectedTaskId, tasks, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) {
      setStatusMsg({ type: "error", text: "Please select a Task ID first!" });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/quick-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selectedTaskId,
          employeeName,
          taskTitle,
          completed: completed === "true"
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit task status.");
      }

      setStatusMsg({ type: "success", text: "Task updated in SQL-style database successfully!" });
      onSuccess(); // Trigger global reload
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-card-custom border border-custom rounded-2xl overflow-hidden shadow-xl" id="quick-update-widget">
      {/* Widget Header with Toggle */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-custom bg-sidebar-custom">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <h3 className="font-sans font-semibold text-sm text-title-custom">Task Assigner</h3>
        </div>
        
        <button
          onClick={() => setIsWireframeMode(!isWireframeMode)}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 bg-[#0F1115] hover:bg-indigo-600/20 text-slate-300 border border-custom hover:border-indigo-500/50 cursor-pointer"
          id="toggle-wireframe-mode"
          title="Toggle between MS Paint sketch style and Sleek Modern design"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>{isWireframeMode ? "Use Sleek UI" : "Use Paint Sketch"}</span>
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        {isWireframeMode ? (
          /* =========================================================================
             1. WIREFRAME SKETCH MODE: EXACTLY ACCORDING TO USER'S MS PAINT PHOTO
             ========================================================================= */
          <div 
            className="font-mono text-slate-900 bg-slate-200 p-6 rounded-lg border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
            style={{ fontFamily: '"Courier New", Courier, monospace' }}
            id="paint-wireframe-container"
          >
            {/* Title block from image */}
            <div className="border-2 border-slate-900 bg-slate-100 p-2.5 mb-6 text-center font-bold text-lg select-none">
              Task Management
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Task ID field */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-bold min-w-[130px] text-sm select-none">task Id:</span>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="flex-1 bg-white border-2 border-slate-950 text-xs px-2 py-1.5 focus:outline-none rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  id="paint-task-id-select"
                >
                  <option value="">-- Choose ID --</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.id}</option>
                  ))}
                </select>
              </div>

              {/* Employee Name field */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-bold min-w-[130px] text-sm select-none">Employee name:</span>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Enter employee..."
                  className="flex-1 bg-white border-2 border-slate-950 text-xs px-2 py-1.5 focus:outline-none rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder-slate-400"
                  id="paint-employee-name-input"
                />
              </div>

              {/* Task Title field with drop down box (task1, task2, task3, dropdown v) */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold min-w-[130px] text-sm mt-1.5 select-none text-slate-900">task title:</span>
                <div className="flex-1 border-2 border-slate-950 bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between" style={{ minHeight: '180px' }}>
                  <div className="text-slate-600 text-xs mb-1 font-bold pb-1 flex justify-between items-center select-none font-mono">
                    <span>drop down ☉ v</span>
                  </div>
                  <div className="text-slate-400 text-xs tracking-tighter select-none font-mono mb-2">
                    -----------------
                  </div>
                  
                  {/* Select Task Title Option */}
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="w-full bg-white border-2 border-slate-950 text-xs px-2 py-1.5 focus:outline-none mb-2 font-mono"
                  >
                    <option value="">-- Choose --</option>
                    {tasks.map(t => (
                      <option key={t.id} value={t.id}>{t.id}</option>
                    ))}
                  </select>

                  <div className="flex gap-2 items-center mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (tasks.length > 0 && !selectedTaskId) {
                          setSelectedTaskId(tasks[0].id);
                        }
                      }}
                      className="border-2 border-slate-950 bg-white hover:bg-slate-50 text-xs font-bold px-3 py-1 font-mono shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    >
                      Cust
                    </button>
                    
                    {/* Manual / Display input edit */}
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Custom title..."
                      className="flex-1 bg-white border border-slate-400 text-xs px-2 py-1 focus:outline-none font-mono"
                      disabled={!selectedTaskId}
                    />
                  </div>

                  <div className="mt-1 text-[11px] text-slate-700 flex flex-col gap-1 select-none font-mono">
                    <span>. task1: Design mockup</span>
                    <span>. task2: API setup</span>
                    <span>. task3: Kanban</span>
                  </div>
                </div>
              </div>

              {/* Completed: drop down box (true, false, dropdown v) */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold min-w-[130px] text-sm mt-1.5 select-none">Completed:</span>
                <div className="flex-1 border-2 border-slate-950 bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] min-h-[80px] flex flex-col justify-between">
                  <div className="text-slate-400 text-xs mb-1 font-bold border-b border-dashed border-slate-400 pb-1 flex justify-between items-center select-none">
                    <span>drop down v</span>
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  
                  <select
                    value={completed}
                    onChange={(e) => setCompleted(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-950 text-xs px-2 py-1 focus:outline-none"
                  >
                    <option value="false">false</option>
                    <option value="true">true</option>
                  </select>

                  <div className="mt-2 text-[10px] text-slate-500 flex justify-between select-none">
                    <span>[ true ]</span>
                    <span>[ false ]</span>
                  </div>
                </div>
              </div>

              {/* Submit button bottom right */}
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedTaskId}
                  className={`border-2 border-slate-950 bg-slate-100 hover:bg-amber-100 text-slate-950 font-bold px-6 py-2 select-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer ${
                    (!selectedTaskId || isSubmitting) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  id="paint-submit-button"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* =========================================================================
             2. MODERN HIGH-CONTRAST MODE: A GORGEOUS MODERN REDESIGN OF THE FORM
             ========================================================================= */
          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-slate-200" id="modern-update-form">
            <div className="bg-indigo-600/10 border border-indigo-500/20 p-3 rounded-lg text-xs text-indigo-200">
              This panel translates your MS Paint sketch into a functional live control. Select a Task ID to edit title, completeness status, and assignment in the database.
            </div>

            {/* Task selection */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Select Task ID</label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                id="modern-task-id-select"
              >
                <option value="">-- Choose a Task ID --</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.id} — {t.title}</option>
                ))}
              </select>
            </div>

            {/* Employee Name */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Employee Name (Assignee)</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Assignee Full Name..."
                className="w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm px-3 py-2.5 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                id="modern-employee-name-input"
              />
            </div>

            {/* Task Title */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Task Title</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task Title..."
                className="w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm px-3 py-2.5 focus:outline-none focus:border-indigo-500 placeholder-slate-600 disabled:opacity-40"
                disabled={!selectedTaskId}
                id="modern-task-title-input"
              />
            </div>

            {/* Completed */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Completed Status</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCompleted("true")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                    completed === "true"
                      ? "bg-emerald-600/20 text-emerald-400 border-emerald-500"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900"
                  }`}
                >
                  Completed (true)
                </button>
                <button
                  type="button"
                  onClick={() => setCompleted("false")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                    completed === "false"
                      ? "bg-slate-800 text-slate-300 border-slate-700"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900"
                  }`}
                >
                  Active (false)
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !selectedTaskId}
                className={`w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all duration-150 shadow-lg shadow-indigo-600/10 ${
                  (!selectedTaskId || isSubmitting) ? "opacity-40 cursor-not-allowed" : ""
                }`}
                id="modern-submit-button"
              >
                {isSubmitting ? "Updating Database..." : "Save Status Changes"}
              </button>
            </div>
          </form>
        )}

        {/* Status Message */}
        {statusMsg && (
          <div 
            className={`mt-4 p-3 rounded-lg text-xs font-medium border flex items-center gap-2 ${
              statusMsg.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}
          >
            {statusMsg.type === "success" && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
