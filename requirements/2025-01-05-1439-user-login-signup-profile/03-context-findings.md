# Context Findings - Current System Analysis

## Current Authentication Architecture

### Technology Stack
- **Authentication**: NextAuth.js v4 with custom providers
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod) 
- **Validation**: Zod schemas
- **UI**: React Hook Form + LCARS design system (needs removal)
- **Session Management**: JWT tokens with 30-day expiry

### Key Issues Identified

#### 1. LCARS Theme Integration Problem
**Problem**: LCARS theming is tightly coupled throughout the codebase
- **Files affected**: 31 files contain LCARS references
- **Main issue**: Authentication components use LCARS classes extensively
- **UserMenu component**: Heavy LCARS styling (`bg-lcars-cyan`, `rounded-lcars`, etc.)
- **Auth pages**: Login, signup, and other auth pages use LCARS design tokens

**Files requiring theme refactoring**:
- `/components/UserMenu.tsx` - Extensive LCARS classes
- `/app/auth/login/page.tsx` - LCARS styled form  
- `/app/auth/signup/page.tsx` - LCARS themed interface
- `/app/auth/*` - All auth pages have LCARS styling
- `/components/onboarding/*` - Onboarding wizard uses LCARS
- `/app/settings/*` - Settings pages use LCARS components

#### 2. Missing Profile View Integration
**Problem**: Profile exists but isn't accessible from main navigation
- **Profile page exists**: `/app/profile/page.tsx` is fully functional
- **UserMenu exists**: `/components/UserMenu.tsx` has profile links
- **Layout issue**: Main layout (`/app/layout.tsx`) shows "Guest User" instead of authenticated user
- **Navigation gap**: No clear path to profile from main interface

**Root cause**: Layout doesn't integrate UserMenu or session state

### Database Schema Analysis

**Current User-related tables**:
- ✅ `User` - Core user data with roles, institution, research area
- ✅ `UserProfile` - Extended profile (avatar, interests, onboarding status, professional links)
- ✅ `UserSettings` - Preferences, notifications, theme settings
- ✅ `LoginAttempt` - Security tracking
- ✅ `PasswordReset` - Password reset functionality
- ✅ `ResearchPaper` - Research literature integration

**Needed for advanced features**:
- ❌ `UserConnection` - For research collaboration networking
- ❌ `Institution` - For verified institution management
- ❌ `ResearchProject` - For collaboration and project sharing
- ❌ `AdminLog` - For admin activity tracking
- ❌ `UserNotification` - For in-app notifications

### Current Functional Features

#### ✅ Working Authentication Features:
1. **Login/Signup**: Complete with validation and error handling
2. **Profile Management**: Full CRUD for user profiles
3. **Settings**: Account, security, notifications, preferences
4. **Password Reset**: Email-based reset flow
5. **Email Verification**: Complete verification system
6. **Onboarding**: Multi-step wizard for new users
7. **Role Management**: USER/RESEARCHER/ADMIN/SUPER_ADMIN roles
8. **Security**: Rate limiting, input validation, session management

#### ❌ Missing Features (Based on Requirements):
1. **Theme-agnostic UI**: Remove LCARS, implement clean modern design
2. **Profile accessibility**: Integrate profile into main navigation
3. **Research collaboration**: User discovery and networking features
4. **Publication tracking**: Enhanced research portfolio features
5. **Admin dashboard**: User management interface for admins
6. **Advanced networking**: Research collaboration tools

### Implementation Strategy

#### Phase 1: Theme Removal & UI Fixes
- Extract LCARS classes from auth components
- Implement clean, modern design system
- Fix layout integration for authenticated users
- Ensure profile accessibility from main navigation

#### Phase 2: Enhanced Profile Features
- Add research collaboration features
- Implement user discovery
- Enhanced publication tracking
- Professional networking capabilities

#### Phase 3: Admin Features
- Admin dashboard for user management
- Role assignment interface
- User activity monitoring
- Bulk operations

### File Modification Requirements

#### Critical Files Needing Changes:
1. **`/app/layout.tsx`** - Integrate UserMenu and session state
2. **`/components/UserMenu.tsx`** - Remove LCARS styling
3. **All `/app/auth/*` pages** - Remove LCARS theming
4. **`/components/onboarding/*`** - Convert to standard styling
5. **`/app/settings/*`** - Remove LCARS dependencies

#### Database Migrations Needed:
- New tables for collaboration features
- Enhanced user profile fields
- Admin activity tracking
- Notification system

### Technical Constraints
- NextAuth.js v4 architecture must be preserved
- Prisma schema changes need migrations
- Session management approach should remain
- Security features must be maintained
- Existing user data must be preserved