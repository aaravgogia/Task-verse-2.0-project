/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Task, Project } from "../types";
import { ChevronLeft, ChevronRight, Plus, HelpCircle } from "lucide-react";

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onAddTaskWithDate: (dateStr: string) => void;
}

export default function CalendarView({ tasks, projects, onEditTask, onAddTaskWithDate }: CalendarViewProps) {
  // Set default initial calendar to July 2026 matching our virtual current date 2026-07-09
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(6); // 0-indexed, so 6 is July

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Fetch days of the month details
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Navigate Months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate calendar grid array
  const calendarCells: (number | null)[] = [];
  
  // Fill preceding empty slots
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  
  // Fill actual month days
  for (let d = 1; d <= daysCount; d++) {
    calendarCells.push(d);
  }

  // Group task entries by date string for rapid lookup
  const getTasksForDate = (dayNum: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, "0");
    const formattedDay = String(dayNum).padStart(2, "0");
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    
    return tasks.filter((t) => t.dueDate === dateStr);
  };

  const handleDayCellClick = (dayNum: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, "0");
    const formattedDay = String(dayNum).padStart(2, "0");
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onAddTaskWithDate(dateStr);
  };

  return (
    <div className="bg-[#16191E] border border-white/5 rounded-2xl p-5 shadow-sm" id="calendar-view-container">
      {/* Calendar Header Nav Controls */}
      <div className="flex items-center justify-between pb-5 border-b border-white/5 mb-5">
        <h3 className="font-sans font-bold text-base text-slate-100 flex items-center gap-2">
          <span>{MONTH_NAMES[currentMonth]} {currentYear}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
            System July 2026
          </span>
        </h3>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-white/5 bg-[#0F1115] hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-all"
            title="Previous Month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setCurrentYear(2026);
              setCurrentMonth(6); // July
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-white/5 bg-[#0F1115] hover:bg-white/5 text-slate-300 hover:text-slate-100 transition-all"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-white/5 bg-[#0F1115] hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-all"
            title="Next Month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Week Day Labels */}
      <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      {/* 35 / 42 Cells Grid block */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarCells.map((day, idx) => {
          if (day === null) {
            return (
              <div 
                key={`empty-${idx}`} 
                className="bg-[#0F1115]/20 border border-white/5 rounded-xl h-28 opacity-20"
              />
            );
          }

          const dayTasks = getTasksForDate(day);
          const isToday = currentYear === 2026 && currentMonth === 6 && day === 9; // July 9, 2026 is today!

          return (
            <div
              key={`day-${day}`}
              className={`bg-[#1C2026] border rounded-xl h-28 p-2 flex flex-col justify-between group transition-all relative ${
                isToday 
                  ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_8px_0_rgba(99,102,241,0.15)]" 
                  : "border-white/5 hover:border-white/10 hover:bg-[#1C2026]/80"
              }`}
              id={`calendar-day-${day}`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span 
                  className={`text-xs font-mono font-bold leading-none h-5 w-5 flex items-center justify-center rounded-full ${
                    isToday ? "bg-indigo-600 text-white" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  {day}
                </span>

                {/* Hover Add task button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDayCellClick(day);
                  }}
                  className="p-0.5 rounded hover:bg-white/5 text-slate-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Create task for this date"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Day Tasks entries list */}
              <div className="flex-1 mt-1.5 overflow-y-auto space-y-1 scrollbar-none">
                {dayTasks.map((t) => {
                  const proj = projects.find((p) => p.id === t.projectId);
                  return (
                    <button
                      key={t.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(t);
                      }}
                      className="w-full text-[10px] text-left truncate px-1.5 py-0.5 rounded font-medium border text-slate-300 hover:text-white transition-colors block border-white/5 hover:border-white/10 bg-[#0F1115] hover:bg-white/5 flex items-center gap-1"
                      title={`${t.id}: ${t.title}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
                      <span className="font-semibold text-slate-400 text-[9px] font-mono">{t.id}</span>
                      <span className="truncate">{t.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
