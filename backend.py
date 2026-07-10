import http.server
import socketserver
import json
import sqlite3
import os
import re
import datetime
import time
import random

PORT = 8000
DB_FILE = "src/db.sqlite"

def log_activity(cursor, user_id, user_name, task_id, task_title, action, details):
    act_id = f"act-{int(time.time() * 1000)}-{str(random.random())[2:6]}"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
    cursor.execute(
        "INSERT INTO activities (id, userId, userName, taskId, taskTitle, action, details, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (act_id, user_id, user_name, task_id, task_title, action, details, now)
    )

def init_db():
    # Ensure src directory exists
    os.makedirs("src", exist_ok=True)
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT,
        avatar TEXT
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT,
        isFavorite INTEGER,
        isShared INTEGER,
        sharedWith TEXT, -- JSON array of user IDs
        createdAt TEXT
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        projectId TEXT,
        description TEXT,
        createdAt TEXT,
        FOREIGN KEY(projectId) REFERENCES projects(id) ON DELETE CASCADE
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT,
        priority TEXT,
        dueDate TEXT,
        projectId TEXT,
        folderId TEXT,
        tags TEXT, -- JSON array of strings
        assignees TEXT, -- JSON array of user IDs
        isFavorite INTEGER,
        isArchived INTEGER,
        attachments TEXT, -- JSON array of attachment objects
        commentsCount INTEGER,
        createdAt TEXT,
        updatedAt TEXT,
        FOREIGN KEY(projectId) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY(folderId) REFERENCES folders(id) ON DELETE CASCADE
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        taskId TEXT,
        userId TEXT,
        content TEXT,
        timestamp TEXT,
        FOREIGN KEY(taskId) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        userId TEXT,
        userName TEXT,
        taskId TEXT,
        taskTitle TEXT,
        action TEXT,
        details TEXT,
        timestamp TEXT
    )
    """)
    
    conn.commit()
    
    # Seed data if tables are empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        # Load from src/db.json if it exists
        if os.path.exists("src/db.json"):
            try:
                with open("src/db.json", "r", encoding="utf-8") as f:
                    seed_data = json.load(f)
                
                # Seed Users
                for u in seed_data.get("users", []):
                    cursor.execute(
                        "INSERT INTO users (id, name, email, role, avatar) VALUES (?, ?, ?, ?, ?)",
                        (u.get("id"), u.get("name"), u.get("email"), u.get("role", "user"), u.get("avatar"))
                    )
                
                # Seed Projects
                for p in seed_data.get("projects", []):
                    cursor.execute(
                        "INSERT INTO projects (id, name, description, color, isFavorite, isShared, sharedWith, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        (
                            p.get("id"), 
                            p.get("name"), 
                            p.get("description"), 
                            p.get("color"), 
                            1 if p.get("isFavorite") else 0, 
                            1 if p.get("isShared") else 0, 
                            json.dumps(p.get("sharedWith", [])), 
                            p.get("createdAt")
                        )
                    )
                
                # Seed Folders
                for f in seed_data.get("folders", []):
                    cursor.execute(
                        "INSERT INTO folders (id, name, projectId, description, createdAt) VALUES (?, ?, ?, ?, ?)",
                        (f.get("id"), f.get("name"), f.get("projectId"), f.get("description"), f.get("createdAt"))
                    )
                
                # Seed Tasks
                for t in seed_data.get("tasks", []):
                    cursor.execute(
                        "INSERT INTO tasks (id, title, description, status, priority, dueDate, projectId, folderId, tags, assignees, isFavorite, isArchived, attachments, commentsCount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        (
                            t.get("id"),
                            t.get("title"),
                            t.get("description"),
                            t.get("status"),
                            t.get("priority"),
                            t.get("dueDate"),
                            t.get("projectId"),
                            t.get("folderId"),
                            json.dumps(t.get("tags", [])),
                            json.dumps(t.get("assignees", [])),
                            1 if t.get("isFavorite") else 0,
                            1 if t.get("isArchived") else 0,
                            json.dumps(t.get("attachments", [])),
                            t.get("commentsCount", 0),
                            t.get("createdAt"),
                            t.get("updatedAt")
                        )
                    )
                
                # Seed Comments
                for c in seed_data.get("comments", []):
                    cursor.execute(
                        "INSERT INTO comments (id, taskId, userId, content, timestamp) VALUES (?, ?, ?, ?, ?)",
                        (c.get("id"), c.get("taskId"), c.get("userId"), c.get("content"), c.get("timestamp"))
                    )
                
                # Seed Activities
                for act in seed_data.get("activities", []):
                    cursor.execute(
                        "INSERT INTO activities (id, userId, userName, taskId, taskTitle, action, details, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        (
                            act.get("id"),
                            act.get("userId"),
                            act.get("userName"),
                            act.get("taskId"),
                            act.get("taskTitle"),
                            act.get("action"),
                            act.get("details"),
                            act.get("timestamp")
                        )
                    )
                conn.commit()
                print("Seeded SQLite database successfully from db.json!")
            except Exception as e:
                print("Error seeding database from db.json:", e)
                conn.rollback()
    
    conn.close()

def get_all_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Users
    cursor.execute("SELECT * FROM users")
    users = [dict(row) for row in cursor.fetchall()]
    
    # Projects
    cursor.execute("SELECT * FROM projects")
    projects = []
    for row in cursor.fetchall():
        d = dict(row)
        d['isFavorite'] = bool(d['isFavorite'])
        d['isShared'] = bool(d['isShared'])
        d['sharedWith'] = json.loads(d['sharedWith']) if d['sharedWith'] else []
        projects.append(d)
        
    # Folders
    cursor.execute("SELECT * FROM folders")
    folders = [dict(row) for row in cursor.fetchall()]
    
    # Tasks
    cursor.execute("SELECT * FROM tasks")
    tasks = []
    for row in cursor.fetchall():
        d = dict(row)
        d['isFavorite'] = bool(d['isFavorite'])
        d['isArchived'] = bool(d['isArchived'])
        d['tags'] = json.loads(d['tags']) if d['tags'] else []
        d['assignees'] = json.loads(d['assignees']) if d['assignees'] else []
        d['attachments'] = json.loads(d['attachments']) if d['attachments'] else []
        tasks.append(d)
        
    # Comments
    cursor.execute("SELECT * FROM comments")
    comments = [dict(row) for row in cursor.fetchall()]
    
    # Activities
    cursor.execute("SELECT * FROM activities ORDER BY timestamp DESC")
    activities = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return {
        "users": users,
        "projects": projects,
        "folders": folders,
        "tasks": tasks,
        "comments": comments,
        "activities": activities
    }

class SQLBackendHandler(http.server.BaseHTTPRequestHandler):
    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def get_post_data(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        body = self.rfile.read(content_length)
        return json.loads(body.decode('utf-8'))

    def do_GET(self):
        try:
            # 1. GET ALL STATE
            if self.path == "/api/db":
                return self.send_json(get_all_db())

            # 2. USERS
            elif self.path == "/api/users":
                conn = sqlite3.connect(DB_FILE)
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute("SELECT * FROM users")
                users = [dict(r) for r in c.fetchall()]
                conn.close()
                return self.send_json(users)

            # 3. PROJECTS
            elif self.path == "/api/projects":
                conn = sqlite3.connect(DB_FILE)
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute("SELECT * FROM projects")
                projects = []
                for r in c.fetchall():
                    d = dict(r)
                    d['isFavorite'] = bool(d['isFavorite'])
                    d['isShared'] = bool(d['isShared'])
                    d['sharedWith'] = json.loads(d['sharedWith']) if d['sharedWith'] else []
                    projects.append(d)
                conn.close()
                return self.send_json(projects)

            # 4. FOLDERS
            elif self.path == "/api/folders":
                conn = sqlite3.connect(DB_FILE)
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute("SELECT * FROM folders")
                folders = [dict(r) for r in c.fetchall()]
                conn.close()
                return self.send_json(folders)

            # 5. TASKS
            elif self.path == "/api/tasks":
                conn = sqlite3.connect(DB_FILE)
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute("SELECT * FROM tasks")
                tasks = []
                for r in c.fetchall():
                    d = dict(r)
                    d['isFavorite'] = bool(d['isFavorite'])
                    d['isArchived'] = bool(d['isArchived'])
                    d['tags'] = json.loads(d['tags']) if d['tags'] else []
                    d['assignees'] = json.loads(d['assignees']) if d['assignees'] else []
                    d['attachments'] = json.loads(d['attachments']) if d['attachments'] else []
                    projects.append(d)
                    tasks.append(d)
                conn.close()
                return self.send_json(tasks)

            # 6. ACTIVITIES
            elif self.path == "/api/activities":
                conn = sqlite3.connect(DB_FILE)
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute("SELECT * FROM activities ORDER BY timestamp DESC")
                activities = [dict(r) for r in c.fetchall()]
                conn.close()
                return self.send_json(activities)

            # 7. TASK COMMENTS
            m_comments = re.match(r"^/api/tasks/([^/]+)/comments$", self.path)
            if m_comments:
                task_id = m_comments.group(1)
                conn = sqlite3.connect(DB_FILE)
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute("SELECT * FROM comments WHERE taskId = ? ORDER BY timestamp ASC", (task_id,))
                comments = [dict(r) for r in c.fetchall()]
                conn.close()
                return self.send_json(comments)

            # Default: 404
            return self.send_json({"error": "Endpoint not found"}, 404)

        except Exception as e:
            return self.send_json({"error": str(e)}, 500)

    def do_POST(self):
        try:
            # 1. CREATE USER
            if self.path == "/api/users":
                data = self.get_post_data()
                name = data.get("name")
                email = data.get("email")
                if not name or not email:
                    return self.send_json({"error": "Name and email are required"}, 400)
                usr_id = f"usr-{int(time.time() * 1000)}"
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()
                c.execute("INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, 'user')", (usr_id, name, email))
                conn.commit()
                conn.close()
                return self.send_json({"id": usr_id, "name": name, "email": email, "role": "user"})

            # 2. CREATE PROJECT
            elif self.path == "/api/projects":
                data = self.get_post_data()
                name = data.get("name")
                if not name:
                    return self.send_json({"error": "Project name is required"}, 400)
                prj_id = f"prj-{int(time.time() * 1000)}"
                desc = data.get("description", "")
                color = data.get("color", "indigo")
                is_favorite = 1 if data.get("isFavorite") else 0
                is_shared = 1 if data.get("isShared") else 0
                shared_with = json.dumps(data.get("sharedWith", []))
                now = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()
                c.execute(
                    "INSERT INTO projects (id, name, description, color, isFavorite, isShared, sharedWith, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (prj_id, name, desc, color, is_favorite, is_shared, shared_with, now)
                )
                log_activity(c, "usr-1", "Aarav Gogia", None, None, "create_project", f"created new project '{name}'")
                conn.commit()
                conn.close()
                return self.send_json({
                    "id": prj_id,
                    "name": name,
                    "description": desc,
                    "color": color,
                    "isFavorite": bool(is_favorite),
                    "isShared": bool(is_shared),
                    "sharedWith": data.get("sharedWith", []),
                    "createdAt": now
                })

            # 3. CREATE FOLDER
            elif self.path == "/api/folders":
                data = self.get_post_data()
                name = data.get("name")
                project_id = data.get("projectId")
                if not name or not project_id:
                    return self.send_json({"error": "Name and projectId are required"}, 400)
                fld_id = f"fld-{int(time.time() * 1000)}"
                desc = data.get("description", "")
                now = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()
                c.execute(
                    "INSERT INTO folders (id, name, projectId, description, createdAt) VALUES (?, ?, ?, ?, ?)",
                    (fld_id, name, project_id, desc, now)
                )
                log_activity(c, "usr-1", "Aarav Gogia", None, None, "create_folder", f"created folder '{name}' in project '{project_id}'")
                conn.commit()
                conn.close()
                return self.send_json({
                    "id": fld_id,
                    "name": name,
                    "projectId": project_id,
                    "description": desc,
                    "createdAt": now
                })

            # 4. CREATE TASK
            elif self.path == "/api/tasks":
                data = self.get_post_data()
                title = data.get("title")
                project_id = data.get("projectId")
                if not title or not project_id:
                    return self.send_json({"error": "Title and projectId are required"}, 400)
                tsk_id = f"TSK-{int(time.time() * 1000) % 100000}"
                desc = data.get("description", "")
                status = data.get("status", "todo")
                priority = data.get("priority", "medium")
                due_date = data.get("dueDate", "")
                folder_id = data.get("folderId")
                tags = json.dumps(data.get("tags", []))
                assignees = json.dumps(data.get("assignees", []))
                is_favorite = 1 if data.get("isFavorite") else 0
                is_archived = 1 if data.get("isArchived") else 0
                attachments = json.dumps([])
                comments_count = 0
                now = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()
                c.execute(
                    "INSERT INTO tasks (id, title, description, status, priority, dueDate, projectId, folderId, tags, assignees, isFavorite, isArchived, attachments, commentsCount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (tsk_id, title, desc, status, priority, due_date, project_id, folder_id, tags, assignees, is_favorite, is_archived, attachments, comments_count, now, now)
                )
                log_activity(c, "usr-1", "Aarav Gogia", tsk_id, title, "create_task", f"created task '{title}'")
                conn.commit()
                conn.close()
                return self.send_json({
                    "id": tsk_id,
                    "title": title,
                    "description": desc,
                    "status": status,
                    "priority": priority,
                    "dueDate": due_date,
                    "projectId": project_id,
                    "folderId": folder_id,
                    "tags": data.get("tags", []),
                    "assignees": data.get("assignees", []),
                    "isFavorite": bool(is_favorite),
                    "isArchived": bool(is_archived),
                    "attachments": [],
                    "commentsCount": 0,
                    "createdAt": now,
                    "updatedAt": now
                })

            # 5. ADD TASK COMMENTS
            m_add_comment = re.match(r"^/api/tasks/([^/]+)/comments$", self.path)
            if m_add_comment:
                task_id = m_add_comment.group(1)
                data = self.get_post_data()
                content = data.get("content")
                user_id = data.get("userId", "usr-1")
                if not content:
                    return self.send_json({"error": "Content is required"}, 400)
                com_id = f"com-{int(time.time() * 1000)}"
                now = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()
                # Get user details
                c.execute("SELECT name FROM users WHERE id = ?", (user_id,))
                user_row = c.fetchone()
                user_name = user_row[0] if user_row else "Aarav Gogia"
                # Insert comment
                c.execute(
                    "INSERT INTO comments (id, taskId, userId, content, timestamp) VALUES (?, ?, ?, ?, ?)",
                    (com_id, task_id, user_id, content, now)
                )
                # Get task title & increment comments count
                c.execute("SELECT title, commentsCount FROM tasks WHERE id = ?", (task_id,))
                task_row = c.fetchone()
                task_title = "Unknown Task"
                if task_row:
                    task_title = task_row[0]
                    new_cnt = task_row[1] + 1
                    c.execute("UPDATE tasks SET commentsCount = ?, updatedAt = ? WHERE id = ?", (new_cnt, now, task_id))
                # Log activity
                log_activity(c, user_id, user_name, task_id, task_title, "add_comment", f"commented: \"{content}\"")
                conn.commit()
                conn.close()
                return self.send_json({
                    "id": com_id,
                    "taskId": task_id,
                    "userId": user_id,
                    "content": content,
                    "timestamp": now
                })

            # 6. ADD TASK ATTACHMENTS
            m_add_attachment = re.match(r"^/api/tasks/([^/]+)/attachments$", self.path)
            if m_add_attachment:
                task_id = m_add_attachment.group(1)
                data = self.get_post_data()
                name = data.get("name")
                size = data.get("size", 0)
                type_ = data.get("type", "application/octet-stream")
                url = data.get("url", "")
                if not name:
                    return self.send_json({"error": "Attachment name is required"}, 400)
                att_id = f"att-{int(time.time() * 1000)}"
                now = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
                new_att = {
                    "id": att_id,
                    "name": name,
                    "size": size,
                    "type": type_,
                    "url": url,
                    "uploadedAt": now
                }
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()
                # Get existing attachments
                c.execute("SELECT attachments, title FROM tasks WHERE id = ?", (task_id,))
                row = c.fetchone()
                if row:
                    atts = json.loads(row[0]) if row[0] else []
                    atts.append(new_att)
                    c.execute("UPDATE tasks SET attachments = ?, updatedAt = ? WHERE id = ?", (json.dumps(atts), now, task_id))
                    log_activity(c, "usr-1", "Aarav Gogia", task_id, row[1], "add_attachment", f"attached file '{name}'")
                conn.commit()
                conn.close()
                return self.send_json(new_att)

            # 7. AUTH LOGIN
            elif self.path == "/api/auth/login":
                data = self.get_post_data()
                role = data.get("role")
                username = data.get("username")
                email = data.get("email")
                avatar = data.get("avatar")
                if not role or not username:
                    return self.send_json({"error": "Role and username are required."}, 400)
                clean_email = email or f"{username.lower().replace(' ', '.')}@taskverse.com"
                conn = sqlite3.connect(DB_FILE)
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute("SELECT * FROM users WHERE LOWER(name) = ? OR LOWER(email) = ?", (username.lower(), clean_email.lower()))
                row = c.fetchone()
                if not row:
                    usr_id = "usr-1" if role == "admin" else f"usr-{int(time.time() * 1000)}"
                    avatar_url = avatar or f"https://api.dicebear.com/7.x/bottts/svg?seed={username}"
                    c.execute(
                        "INSERT INTO users (id, name, email, role, avatar) VALUES (?, ?, ?, ?, ?)",
                        (usr_id, username, clean_email, role, avatar_url)
                    )
                    user_obj = {"id": usr_id, "name": username, "email": clean_email, "role": role, "avatar": avatar_url}
                else:
                    user_obj = dict(row)
                    user_obj["role"] = role
                    if avatar:
                        user_obj["avatar"] = avatar
                    c.execute("UPDATE users SET role = ?, avatar = ? WHERE id = ?", (role, user_obj["avatar"], user_obj["id"]))
                
                log_activity(c, user_obj["id"], user_obj["name"], None, None, "user_login", f"logged in securely as {'Administrator' if role == 'admin' else 'Standard User'}")
                conn.commit()
                conn.close()
                return self.send_json({"success": True, "user": user_obj})

            # 8. THE SPECIFIC WIREFRAME ENDPOINT ("Quick Update Form" submitted from user's MS Paint sketch)
            elif self.path == "/api/quick-update":
                data = self.get_post_data()
                task_id = data.get("taskId")
                employee_name = data.get("employeeName")
                task_title = data.get("taskTitle")
                completed = data.get("completed")
                if not task_id:
                    return self.send_json({"error": "Task ID is required for quick status update"}, 400)
                conn = sqlite3.connect(DB_FILE)
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                # Find task
                c.execute("SELECT * FROM tasks WHERE LOWER(id) = ? OR LOWER(title) = ?", (task_id.lower(), task_id.lower()))
                task_row = c.fetchone()
                if not task_row and task_title:
                    c.execute("SELECT * FROM tasks WHERE LOWER(title) = ?", (task_title.lower(),))
                    task_row = c.fetchone()
                if not task_row:
                    conn.close()
                    return self.send_json({"error": f"Task with ID/Title '{task_id}' not found."}, 404)
                task = dict(task_row)
                task_real_id = task["id"]
                is_completed = completed is True or completed == "true"
                new_status = "completed" if is_completed else "todo"
                assignee_id = "usr-1"
                if employee_name:
                    c.execute("SELECT id FROM users WHERE LOWER(name) = ?", (employee_name.lower(),))
                    u_row = c.fetchone()
                    if u_row:
                        assignee_id = u_row[0]
                    else:
                        assignee_id = f"usr-{int(time.time() * 1000)}"
                        c.execute(
                            "INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, 'user')",
                            (assignee_id, employee_name, f"{employee_name.lower().replace(' ', '.')}@company.com")
                        )
                # Update task details
                task_title_update = task_title if (task_title and task_title not in ["task1", "task2", "task3", "drop down v"]) else task["title"]
                assignees = json.loads(task["assignees"]) if task["assignees"] else []
                if employee_name and assignee_id not in assignees:
                    assignees.append(assignee_id)
                now = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
                c.execute(
                    "UPDATE tasks SET status = ?, assignees = ?, title = ?, updatedAt = ? WHERE id = ?",
                    (new_status, json.dumps(assignees), task_title_update, now, task_real_id)
                )
                log_activity(c, "usr-1", "Aarav Gogia", task_real_id, task_title_update, "quick_update", f"Quick-updated via MS Paint Wireframe Form (Completed: {is_completed}, Employee: {employee_name or 'Unassigned'})")
                conn.commit()
                
                # Fetch full state to return in the same format
                c.execute("SELECT * FROM users")
                all_users = [dict(r) for r in c.fetchall()]
                task["status"] = new_status
                task["assignees"] = assignees
                task["title"] = task_title_update
                task["updatedAt"] = now
                conn.close()
                return self.send_json({
                    "success": True,
                    "message": "Task quick-updated successfully",
                    "task": task,
                    "users": all_users
                })

            # Default: 404
            return self.send_json({"error": "Endpoint not found"}, 404)

        except Exception as e:
            return self.send_json({"error": str(e)}, 500)

    def do_PUT(self):
        try:
            # 1. UPDATE PROJECT
            m_project = re.match(r"^/api/projects/([^/]+)$", self.path)
            if m_project:
                prj_id = m_project.group(1)
                data = self.get_post_data()
                conn = sqlite3.connect(DB_FILE)
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                # Find original
                c.execute("SELECT * FROM projects WHERE id = ?", (prj_id,))
                row = c.fetchone()
                if not row:
                    conn.close()
                    return self.send_json({"error": "Project not found"}, 404)
                p = dict(row)
                name = data.get("name", p["name"])
                desc = data.get("description", p["description"])
                color = data.get("color", p["color"])
                is_fav = 1 if ("isFavorite" in data and data["isFavorite"]) else p["isFavorite"]
                is_shared = 1 if ("isShared" in data and data["isShared"]) else p["isShared"]
                shared_with = json.dumps(data.get("sharedWith", json.loads(p["sharedWith"]) if p["sharedWith"] else []))
                
                c.execute(
                    "UPDATE projects SET name = ?, description = ?, color = ?, isFavorite = ?, isShared = ?, sharedWith = ? WHERE id = ?",
                    (name, desc, color, is_fav, is_shared, shared_with, prj_id)
                )
                log_activity(c, "usr-1", "Aarav Gogia", None, None, "update_project", f"updated project '{name}'")
                conn.commit()
                conn.close()
                return self.send_json({
                    "id": prj_id,
                    "name": name,
                    "description": desc,
                    "color": color,
                    "isFavorite": bool(is_fav),
                    "isShared": bool(is_shared),
                    "sharedWith": json.loads(shared_with),
                    "createdAt": p["createdAt"]
                })

            # 2. UPDATE FOLDER
            m_folder = re.match(r"^/api/folders/([^/]+)$", self.path)
            if m_folder:
                fld_id = m_folder.group(1)
                data = self.get_post_data()
                conn = sqlite3.connect(DB_FILE)
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute("SELECT * FROM folders WHERE id = ?", (fld_id,))
                row = c.fetchone()
                if not row:
                    conn.close()
                    return self.send_json({"error": "Folder not found"}, 404)
                f = dict(row)
                name = data.get("name", f["name"])
                desc = data.get("description", f["description"])
                
                c.execute("UPDATE folders SET name = ?, description = ? WHERE id = ?", (name, desc, fld_id))
                log_activity(c, "usr-1", "Aarav Gogia", None, None, "update_folder", f"updated folder '{name}'")
                conn.commit()
                conn.close()
                return self.send_json({
                    "id": fld_id,
                    "name": name,
                    "projectId": f["projectId"],
                    "description": desc,
                    "createdAt": f["createdAt"]
                })

            # 3. UPDATE TASK
            m_task = re.match(r"^/api/tasks/([^/]+)$", self.path)
            if m_task:
                tsk_id = m_task.group(1)
                data = self.get_post_data()
                conn = sqlite3.connect(DB_FILE)
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute("SELECT * FROM tasks WHERE id = ?", (tsk_id,))
                row = c.fetchone()
                if not row:
                    conn.close()
                    return self.send_json({"error": "Task not found"}, 404)
                t = dict(row)
                title = data.get("title", t["title"])
                desc = data.get("description", t["description"])
                status = data.get("status", t["status"])
                priority = data.get("priority", t["priority"])
                due_date = data.get("dueDate", t["dueDate"])
                is_fav = 1 if ("isFavorite" in data and data["isFavorite"]) else t["isFavorite"]
                is_arch = 1 if ("isArchived" in data and data["isArchived"]) else t["isArchived"]
                tags = json.dumps(data.get("tags", json.loads(t["tags"]) if t["tags"] else []))
                assignees = json.dumps(data.get("assignees", json.loads(t["assignees"]) if t["assignees"] else []))
                attachments = json.dumps(data.get("attachments", json.loads(t["attachments"]) if t["attachments"] else []))
                now = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
                
                c.execute(
                    "UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, dueDate = ?, isFavorite = ?, isArchived = ?, tags = ?, assignees = ?, attachments = ?, updatedAt = ? WHERE id = ?",
                    (title, desc, status, priority, due_date, is_fav, is_arch, tags, assignees, attachments, now, tsk_id)
                )
                
                action_type = "update_task"
                log_msg = f"updated task '{title}'"
                if status != t["status"]:
                    action_type = "move_task"
                    log_msg = f"moved task '{title}' to {status.replace('_', ' ')}"
                
                log_activity(c, "usr-1", "Aarav Gogia", tsk_id, title, action_type, log_msg)
                conn.commit()
                conn.close()
                return self.send_json({
                    "id": tsk_id,
                    "title": title,
                    "description": desc,
                    "status": status,
                    "priority": priority,
                    "dueDate": due_date,
                    "projectId": t["projectId"],
                    "folderId": t["folderId"],
                    "tags": json.loads(tags),
                    "assignees": json.loads(assignees),
                    "isFavorite": bool(is_fav),
                    "isArchived": bool(is_arch),
                    "attachments": json.loads(attachments),
                    "commentsCount": t["commentsCount"],
                    "createdAt": t["createdAt"],
                    "updatedAt": now
                })

            # Default: 404
            return self.send_json({"error": "Endpoint not found"}, 404)

        except Exception as e:
            return self.send_json({"error": str(e)}, 500)

    def do_DELETE(self):
        try:
            # 1. DELETE PROJECT
            m_project = re.match(r"^/api/projects/([^/]+)$", self.path)
            if m_project:
                prj_id = m_project.group(1)
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()
                c.execute("SELECT name FROM projects WHERE id = ?", (prj_id,))
                row = c.fetchone()
                if not row:
                    conn.close()
                    return self.send_json({"error": "Project not found"}, 404)
                name = row[0]
                c.execute("DELETE FROM projects WHERE id = ?", (prj_id,))
                log_activity(c, "usr-1", "Aarav Gogia", None, None, "delete_project", f"deleted project '{name}'")
                conn.commit()
                conn.close()
                return self.send_json({"success": True, "message": f"Project '{name}' deleted successfully"})

            # 2. DELETE FOLDER
            m_folder = re.match(r"^/api/folders/([^/]+)$", self.path)
            if m_folder:
                fld_id = m_folder.group(1)
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()
                c.execute("SELECT name FROM folders WHERE id = ?", (fld_id,))
                row = c.fetchone()
                if not row:
                    conn.close()
                    return self.send_json({"error": "Folder not found"}, 404)
                name = row[0]
                c.execute("DELETE FROM folders WHERE id = ?", (fld_id,))
                log_activity(c, "usr-1", "Aarav Gogia", None, None, "delete_folder", f"deleted folder '{name}'")
                conn.commit()
                conn.close()
                return self.send_json({"success": True, "message": f"Folder '{name}' deleted successfully"})

            # 3. DELETE TASK
            m_task = re.match(r"^/api/tasks/([^/]+)$", self.path)
            if m_task:
                tsk_id = m_task.group(1)
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()
                c.execute("SELECT title FROM tasks WHERE id = ?", (tsk_id,))
                row = c.fetchone()
                if not row:
                    conn.close()
                    return self.send_json({"error": "Task not found"}, 404)
                title = row[0]
                c.execute("DELETE FROM tasks WHERE id = ?", (tsk_id,))
                log_activity(c, "usr-1", "Aarav Gogia", tsk_id, title, "delete_task", f"deleted task '{title}'")
                conn.commit()
                conn.close()
                return self.send_json({"success": True, "message": f"Task '{title}' deleted successfully"})

            # Default: 404
            return self.send_json({"error": "Endpoint not found"}, 404)

        except Exception as e:
            return self.send_json({"error": str(e)}, 500)

class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    pass

def run_server():
    init_db()
    server_address = ('127.0.0.1', PORT)
    httpd = ThreadingHTTPServer(server_address, SQLBackendHandler)
    print(f"Python SQLite relational backend running on http://127.0.0.1:{PORT}")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()
