# DevPulse AI — Vertical Slice Development Prompts

---

# Vertical Slice 1 — Project Setup & Authentication System

## Goal

Build the complete authentication foundation with secure login/signup, GitHub OAuth, session handling, protected routes, and database integration.

---

## Frontend Requirements

### Screens

1. Landing Page
2. Login Page
3. Signup Page
4. Forgot Password Page
5. Dashboard Placeholder
6. Unauthorized Access Page

### Components

* Navbar
* Hero Section
* Auth Forms
* Social Login Buttons
* Toast Notifications
* Loading Spinners
* Protected Route Wrapper

### Buttons

* Sign Up
* Login
* Continue with GitHub
* Logout
* Forgot Password
* Go to Dashboard

### Frontend Logic

* Form validation using Zod
* JWT token storage
* Session persistence
* Redirect after login
* Protected routes middleware
* Dark/light theme toggle

---

## Backend Requirements

### APIs

#### Auth APIs

* POST `/api/auth/register`
* POST `/api/auth/login`
* POST `/api/auth/logout`
* POST `/api/auth/refresh`
* GET `/api/auth/me`

### OAuth APIs

* GET `/api/auth/github`
* GET `/api/auth/github/callback`

---

## Backend Logic

### Registration Logic

* Validate email uniqueness
* Hash password using bcrypt
* Create JWT access token
* Create refresh token
* Store user session

### Login Logic

* Compare hashed password
* Generate access token
* Generate refresh token
* Return user profile

### GitHub OAuth Logic

* Redirect to GitHub consent
* Fetch GitHub profile
* Auto-create user account
* Store GitHub username

### Middleware

* JWT verification middleware
* Role validation middleware
* Route protection middleware

---

## Database Schema

### Users Table

```sql
id UUID PRIMARY KEY
name VARCHAR(255)
email VARCHAR(255) UNIQUE
password TEXT
github_username VARCHAR(255)
role VARCHAR(50)
created_at TIMESTAMP
updated_at TIMESTAMP
```

### Sessions Table

```sql
id UUID PRIMARY KEY
user_id UUID
refresh_token TEXT
expires_at TIMESTAMP
created_at TIMESTAMP
```

---

## User Flow

### Signup Flow

Landing → Signup → Email Validation → Dashboard

### Login Flow

Login → JWT Generation → Dashboard Access

### OAuth Flow

GitHub Login → GitHub Consent → Callback → Dashboard

---

## TDD Requirements

### Unit Tests

* Password hashing
* JWT creation
* Email validation
* OAuth callback handling

### Integration Tests

* Register endpoint
* Login endpoint
* Protected routes

### E2E Tests

* Full signup flow
* Full login flow
* Logout flow

---

# Vertical Slice 2 — Portfolio Dashboard System

## Goal

Build the developer portfolio management dashboard.

---

## Frontend Requirements

### Screens

1. Dashboard Home
2. Edit Profile Page
3. Social Links Manager
4. Resume Upload Page
5. Public Portfolio Preview

### Components

* Sidebar
* Profile Card
* Skills Tags
* Resume Viewer
* Social Icons
* Analytics Summary Cards

### Buttons

* Save Profile
* Upload Resume
* Add Skill
* Remove Skill
* Publish Portfolio

---

## Backend APIs

### Profile APIs

* GET `/api/profile`
* PUT `/api/profile/update`
* POST `/api/profile/upload-resume`
* GET `/api/profile/public/:username`

---

## Backend Logic

### Profile Update Logic

* Validate profile fields
* Upload image to cloud storage
* Generate portfolio slug
* Store social links

### Resume Upload Logic

* Validate PDF/DOC files
* Store securely
* Generate public URL

---

## Database Schema

### Profiles Table

```sql
id UUID PRIMARY KEY
user_id UUID
bio TEXT
headline VARCHAR(255)
location VARCHAR(255)
resume_url TEXT
profile_image TEXT
portfolio_slug VARCHAR(255)
created_at TIMESTAMP
```

### Skills Table

```sql
id UUID PRIMARY KEY
user_id UUID
skill_name VARCHAR(255)
skill_level INTEGER
```

### Social Links Table

```sql
id UUID PRIMARY KEY
user_id UUID
platform VARCHAR(255)
url TEXT
```

---

## User Flow

Dashboard → Edit Profile → Save Changes → Public Portfolio Update

---

## TDD Requirements

### Unit Tests

* Profile validation
* Resume upload validation

### Integration Tests

* Profile update API
* Resume upload API

### E2E Tests

* Edit profile flow
* Publish portfolio flow

---

# Vertical Slice 3 — GitHub Live Analytics Module

## Goal

Build real-time GitHub analytics integration.

---

## Frontend Requirements

### Screens

1. GitHub Analytics Dashboard
2. Repository Details Page
3. Contribution Heatmap Page

### Components

* Commit Charts
* Repository Cards
* Language Pie Charts
* Contribution Calendar
* Live Activity Feed

### Buttons

* Sync GitHub
* Refresh Stats
* View Repository
* Connect GitHub

---

## Backend APIs

### GitHub APIs

* GET `/api/github/profile`
* GET `/api/github/repos`
* GET `/api/github/commits`
* GET `/api/github/languages`
* POST `/api/github/sync`

---

## Backend Logic

### GitHub Sync Logic

* Fetch repositories
* Fetch commits
* Store analytics cache
* Schedule cron sync jobs

### Analytics Logic

* Calculate daily commits
* Calculate language usage
* Generate contribution metrics

---

## Database Schema

### GitHub Repositories Table

```sql
id UUID PRIMARY KEY
user_id UUID
repo_name VARCHAR(255)
stars INTEGER
forks INTEGER
language VARCHAR(255)
repo_url TEXT
```

### GitHub Commits Table

```sql
id UUID PRIMARY KEY
user_id UUID
repo_id UUID
commit_count INTEGER
commit_date TIMESTAMP
```

---

## User Flow

Dashboard → Connect GitHub → Sync Data → View Analytics

---

## TDD Requirements

### Unit Tests

* GitHub API parsing
* Commit aggregation logic

### Integration Tests

* GitHub sync endpoint
* Repository fetch endpoint

### E2E Tests

* GitHub connection flow
* Analytics rendering flow

---

# Vertical Slice 4 — LeetCode Analytics Module

## Goal

Build LeetCode statistics tracking system.

---

## Frontend Requirements

### Screens

1. LeetCode Dashboard
2. Contest Analytics Page
3. Skill Breakdown Page

### Components

* Progress Rings
* Contest Rating Graphs
* Difficulty Breakdown
* Daily Streak Tracker

### Buttons

* Connect LeetCode
* Refresh Stats
* View Profile

---

## Backend APIs

### LeetCode APIs

* GET `/api/leetcode/profile`
* GET `/api/leetcode/stats`
* POST `/api/leetcode/sync`

---

## Backend Logic

### Sync Logic

* Fetch LeetCode stats
* Calculate streaks
* Store rankings
* Cache responses

---

## Database Schema

### LeetCode Stats Table

```sql
id UUID PRIMARY KEY
user_id UUID
total_solved INTEGER
easy_count INTEGER
medium_count INTEGER
hard_count INTEGER
contest_rating INTEGER
global_rank INTEGER
```

---

## TDD Requirements

### Unit Tests

* LeetCode data parsing
* Ranking calculations

### Integration Tests

* Stats sync endpoint

### E2E Tests

* LeetCode connection flow

---

# Vertical Slice 5 — Real-Time Coding Activity System

## Goal

Build live coding presence and WebSocket architecture.

---

## Frontend Requirements

### Screens

1. Live Activity Feed
2. Online Presence Dashboard

### Components

* Live Status Indicator
* Real-Time Feed
* WebSocket Status Badge
* Activity Timeline

### Buttons

* Start Activity
* Stop Activity
* Refresh Feed

---

## Backend APIs

### Activity APIs

* POST `/api/activity/start`
* POST `/api/activity/stop`
* GET `/api/activity/live`

---

## Backend Logic

### WebSocket Logic

* Real-time broadcasting
* Online presence tracking
* Heartbeat mechanism
* Auto reconnect handling

---

## Database Schema

### Activity Table

```sql
id UUID PRIMARY KEY
user_id UUID
activity_type VARCHAR(255)
repo_name VARCHAR(255)
started_at TIMESTAMP
ended_at TIMESTAMP
```

---

## TDD Requirements

### Unit Tests

* WebSocket event handlers
* Activity state logic

### Integration Tests

* Live activity APIs

### E2E Tests

* Real-time feed updates

---

# Vertical Slice 6 — Deployment Monitoring Module

## Goal

Build deployment health monitoring system.

---

## Frontend Requirements

### Screens

1. Deployment Dashboard
2. Service Health Page

### Components

* Uptime Charts
* Deployment Status Cards
* Response Time Graphs

### Buttons

* Add Deployment
* Check Status
* Remove Deployment

---

## Backend APIs

### Deployment APIs

* POST `/api/deployments/add`
* GET `/api/deployments/status`
* DELETE `/api/deployments/remove`

---

## Backend Logic

### Monitoring Logic

* Cron-based health checks
* Downtime alerts
* Response latency tracking

---

## Database Schema

### Deployments Table

```sql
id UUID PRIMARY KEY
user_id UUID
project_name VARCHAR(255)
deployment_url TEXT
status VARCHAR(50)
uptime FLOAT
response_time INTEGER
```

---

## TDD Requirements

### Unit Tests

* Health checker logic
* Uptime calculation

### Integration Tests

* Deployment APIs

### E2E Tests

* Deployment monitoring flow

---

# Vertical Slice 7 — Blog & Learning Tracker Module

## Goal

Build blogging and learning progress system.

---

## Frontend Requirements

### Screens

1. Blog Dashboard
2. Learning Tracker Page

### Components

* Blog Cards
* Progress Bars
* Learning Timeline
* Skill Charts

### Buttons

* Add Skill
* Update Progress
* Sync Blogs

---

## Backend APIs

### Blog APIs

* GET `/api/blogs`
* POST `/api/blogs/sync`

### Learning APIs

* POST `/api/learning/add`
* PUT `/api/learning/update`

---

## Database Schema

### Blogs Table

```sql
id UUID PRIMARY KEY
user_id UUID
title VARCHAR(255)
url TEXT
published_at TIMESTAMP
```

### Learning Table

```sql
id UUID PRIMARY KEY
user_id UUID
skill_name VARCHAR(255)
progress INTEGER
resource_url TEXT
```

---

## TDD Requirements

### Unit Tests

* Blog parser
* Progress calculations

### Integration Tests

* Blog sync APIs

### E2E Tests

* Learning tracker workflow

---

# Vertical Slice 8 — Admin Panel & Analytics

## Goal

Build complete admin management and analytics system.

---

## Frontend Requirements

### Screens

1. Admin Dashboard
2. User Management Page
3. Analytics Page
4. Error Logs Page

### Components

* Data Tables
* Charts
* Filters
* Search Bars

### Buttons

* Delete User
* Ban User
* Export Analytics

---

## Backend APIs

### Admin APIs

* GET `/api/admin/users`
* DELETE `/api/admin/user/:id`
* GET `/api/admin/analytics`

---

## Backend Logic

### Admin Logic

* Role validation
* Analytics aggregation
* Error logging system

---

## Database Schema

### Logs Table

```sql
id UUID PRIMARY KEY
type VARCHAR(255)
message TEXT
created_at TIMESTAMP
```

---

## TDD Requirements

### Unit Tests

* Admin authorization
* Analytics calculations

### Integration Tests

* Admin APIs

### E2E Tests

* User management flow
