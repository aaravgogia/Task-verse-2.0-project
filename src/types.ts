/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'admin' | 'user';
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Attachment {
  id: string;
  name: string;
  size: number; // in bytes
  type: string; // mime type
  url: string;
  uploadedAt: string;
}

export interface Task {
  id: string; // e.g., "TSK-001"
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  projectId: string;
  folderId?: string; // optional folder
  tags: string[];
  assignees: string[]; // User IDs
  isFavorite: boolean;
  isArchived: boolean;
  attachments: Attachment[];
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string; // hex or tailwind class
  isFavorite: boolean;
  isShared: boolean;
  sharedWith: string[]; // User IDs
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  projectId: string;
  description?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  taskId?: string;
  taskTitle?: string;
  action: string; // 'create_task', 'update_status', 'edit_task', 'comment_add', etc.
  details: string;
  timestamp: string;
}
