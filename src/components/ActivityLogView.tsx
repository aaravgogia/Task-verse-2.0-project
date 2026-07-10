/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ActivityLog } from "../types";
import { Activity, Clock, User, CheckSquare, PlusCircle, Paperclip, MessageSquare, AlertCircle } from "lucide-react";

interface ActivityLogViewProps {
  activities: ActivityLog[];
}

export default function ActivityLogView({ activities }: ActivityLogViewProps) {
  
  // Choose icon based on activity action
  const getActionIcon = (action: string) => {
    switch (action) {
      case "create_task":
        return <PlusCircle className="h-4 w-4 text-emerald-400" />;
      case "update_status":
        return <CheckSquare className="h-4 w-4 text-indigo-400" />;
      case "add_attachment":
        return <Paperclip className="h-4 w-4 text-amber-400" />;
      case "comment_add":
        return <MessageSquare className="h-4 w-4 text-purple-400" />;
      case "quick_update":
        return <Activity className="h-4 w-4 text-indigo-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-[#16191E] border border-white/5 rounded-2xl p-5 shadow-sm" id="activity-log-view">
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
        <h3 className="font-sans font-bold text-sm text-slate-200">Workspace Activity Audit Log</h3>
        <span className="text-[10px] font-mono font-semibold text-slate-500 bg-[#0F1115] border border-white/5 px-2.5 py-1 rounded-lg">
          Live Sync active
        </span>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2" id="activities-feed">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-10">No activities recorded in the database yet.</p>
        ) : (
          activities.map((act) => {
            return (
              <div 
                key={act.id} 
                className="flex gap-3 items-start bg-[#1C2026] hover:bg-[#1C2026]/80 border border-white/5 hover:border-white/10 rounded-xl p-3.5 transition-all"
              >
                {/* Event Icon badge */}
                <div className="h-8 w-8 rounded-lg bg-[#0F1115] border border-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getActionIcon(act.action)}
                </div>

                {/* Event details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-xs font-semibold text-slate-300">
                      {act.userName}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" />
                      {new Date(act.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="font-bold text-slate-300">{act.userName}</span> {act.details.replace(act.userName, "").trim()}
                  </p>

                  {/* Associated Task ID if available */}
                  {act.taskId && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                      <span className="font-mono bg-[#0F1115] border border-white/5 px-1.5 py-0.5 rounded text-[9px] text-indigo-400 font-bold">
                        {act.taskId}
                      </span>
                      {act.taskTitle && <span className="truncate max-w-[220px]"> — {act.taskTitle}</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
