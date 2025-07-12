# Requirements Specification - User Login, Signup, and Profile Management Enhancement

## Problem Statement

MESSAi has a comprehensive authentication system but suffers from two critical issues:
1. **LCARS theme coupling** - Authentication components are tightly coupled with LCARS theming that needs to be removed from the main branch
2. **Profile accessibility** - Users cannot access their profile after signing in due to layout integration issues

Additionally, the platform needs enhanced features for research collaboration, publication tracking, and administrative management to better serve the research community.

## Solution Overview

Enhance the existing well-architected NextAuth.js authentication system by:
- Removing LCARS theming while maintaining functionality
- Fixing profile view accessibility
- Adding advanced research collaboration features
- Implementing admin dashboard capabilities
- Creating a modular, easily customizable design system

## Functional Requirements

### 1. Theme Removal & UI Modernization

#### 1.1 Remove LCARS Dependencies
- **Scope**: Remove LCARS classes from 31 affected files
- **Approach**: Replace with standard Tailwind CSS classes
- **Design**: Implement modular styling for easy future customization
- **Files affected**:
  - `/components/UserMenu.tsx` - Remove `bg-lcars-*`, `rounded-lcars` classes
  - `/app/auth/login/page.tsx` - Convert to standard form styling
  - `/app/auth/signup/page.tsx` - Modernize registration interface
  - All `/app/auth/*` pages - Standardize authentication UI
  - `/components/onboarding/*` - Remove LCARS from wizard
  - `/app/settings/*` - Convert settings pages

#### 1.2 Layout Integration Fix
- **Problem**: `/app/layout.tsx` shows hardcoded "Guest User" instead of session-aware interface
- **Solution**: Replace hardcoded user section with `UserMenu` component
- **Result**: Authenticated users see profile access, unauthenticated see login/signup buttons

### 2. Enhanced Profile Management

#### 2.1 Profile Accessibility
- **Current**: Profile page exists but isn't accessible from main navigation
- **Enhancement**: Integrate UserMenu into main layout for profile access
- **Features**: Direct links to profile, settings, logout from any page

#### 2.2 Research Collaboration Features
- **User Discovery**: Search and find other researchers by expertise, institution
- **Professional Networking**: Send connection requests, build research networks
- **Collaboration Tools**: Share projects, form research groups
- **Institution Verification**: Verify and manage institutional affiliations

#### 2.3 Enhanced Publication Tracking
- **ORCID Integration**: Import publications from ORCID profiles
- **Publication Portfolio**: Display user's research papers and contributions
- **Research Metrics**: Track citations, impact metrics, collaboration history
- **Literature Integration**: Connect with existing ResearchPaper database

### 3. Administrative Features

#### 3.1 User Management Dashboard
- **Access Control**: ADMIN and SUPER_ADMIN roles only
- **Capabilities**:
  - View all users with search and filtering
  - Edit user details and status
  - Deactivate/reactivate accounts
  - Bulk operations for user management

#### 3.2 Role Assignment Interface
- **ADMIN privileges**: Assign USER and RESEARCHER roles
- **SUPER_ADMIN privileges**: Assign any role including ADMIN
- **Audit Trail**: Log all role changes and administrative actions

#### 3.3 System Monitoring
- **User Activity**: Track login history, experiment activity
- **Analytics**: Platform usage statistics and research trends
- **Security Monitoring**: Failed login attempts, suspicious activity

## Technical Requirements

### 1. Database Schema Extensions

#### 1.1 New Tables Required
```sql
-- Research collaboration networking
CREATE TABLE UserConnection (
  id: String @id @default(cuid())
  requesterId: String
  receiverId: String  
  status: String -- 'pending', 'accepted', 'declined'
  connectionType: String -- 'colleague', 'collaborator', 'mentor'
  createdAt: DateTime @default(now())
  -- Relations and indexes
)

-- Collaborative research projects
CREATE TABLE ResearchProject (
  id: String @id @default(cuid())
  title: String
  description: String
  ownerId: String
  collaborators: String -- JSON array of user IDs
  status: String -- 'planning', 'active', 'completed'
  isPublic: Boolean @default(false)
  -- Relations and indexes
)

-- Verified institutions
CREATE TABLE Institution (
  id: String @id @default(cuid()) 
  name: String
  domain: String @unique
  verified: Boolean @default(false)
  country: String
  -- Relations and indexes
)

-- Admin activity logging
CREATE TABLE AdminLog (
  id: String @id @default(cuid())
  adminId: String
  action: String
  targetUserId: String?
  details: String -- JSON
  createdAt: DateTime @default(now())
  -- Relations and indexes
)

-- In-app notifications
CREATE TABLE UserNotification (
  id: String @id @default(cuid())
  userId: String
  type: String -- 'connection_request', 'project_invite', etc.
  title: String
  message: String
  read: Boolean @default(false)
  createdAt: DateTime @default(now())
  -- Relations and indexes
)
```

#### 1.2 Enhanced User-Paper Relationships
- Extend existing ResearchPaper relationships
- Add user-publication ownership and collaboration tracking
- ORCID integration fields

### 2. File Modifications

#### 2.1 Critical Files Requiring Changes
1. **`/app/layout.tsx`**
   - Replace hardcoded user section with UserMenu component
   - Import and integrate session-aware navigation

2. **`/components/UserMenu.tsx`** 
   - Remove all LCARS classes (`bg-lcars-*`, `rounded-lcars`, etc.)
   - Implement with standard Tailwind classes
   - Maintain existing functionality and structure

3. **Authentication Pages** (`/app/auth/*`)
   - Remove LCARS theming from all auth pages
   - Implement clean, modern design with standard Tailwind
   - Ensure forms remain accessible and functional

4. **Settings Pages** (`/app/settings/*`)
   - Convert from LCARS to standard styling
   - Maintain existing functionality
   - Ensure responsive design

5. **Onboarding Components** (`/components/onboarding/*`)
   - Remove LCARS dependencies
   - Implement modern wizard interface
   - Preserve multi-step flow logic

#### 2.2 New Files Required
- `/app/admin/page.tsx` - Admin dashboard
- `/app/admin/users/page.tsx` - User management interface
- `/app/admin/roles/page.tsx` - Role assignment interface
- `/components/admin/*` - Admin-specific components
- `/app/api/admin/*` - Admin API endpoints
- `/app/api/collaboration/*` - Collaboration API endpoints

### 3. Implementation Patterns

#### 3.1 Styling Approach
- **Framework**: Continue using Tailwind CSS
- **Modularity**: Create design token variables for easy customization
- **Structure**: Implement component-level style modules where needed
- **Future-proofing**: Use CSS custom properties for themeable values

#### 3.2 Security Requirements
- **Authentication**: Preserve existing NextAuth.js architecture
- **Authorization**: Leverage existing role-based access control
- **Data Protection**: Maintain existing validation and sanitization
- **Admin Access**: Implement additional checks for admin features

#### 3.3 API Design
- **RESTful**: Follow existing API patterns in `/app/api/`
- **Validation**: Use existing Zod schemas, extend as needed
- **Error Handling**: Maintain consistent error response format
- **Rate Limiting**: Apply to new admin and collaboration endpoints

## Implementation Hints

### 1. Theme Removal Strategy
```typescript
// Before (LCARS)
className="bg-lcars-cyan hover:bg-lcars-blue rounded-lcars"

// After (Standard Tailwind)  
className="bg-blue-500 hover:bg-blue-600 rounded-lg"

// Future-ready (CSS Variables)
className="bg-primary-500 hover:bg-primary-600 rounded-lg"
```

### 2. Layout Integration Pattern
```typescript
// In app/layout.tsx - Replace hardcoded section with:
import { UserMenu } from '@/components/UserMenu'

// Replace the hardcoded user section (lines 84-93) with:
<div className="p-4 border-t border-gray-200 dark:border-gray-800">
  <UserMenu />
</div>
```

### 3. Admin Route Protection
```typescript
// Use existing middleware.ts pattern:
if (pathname.startsWith('/admin')) {
  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
}
```

## Acceptance Criteria

### 1. Theme Removal
- [ ] All LCARS classes removed from authentication components
- [ ] Authentication flows function identically with new styling
- [ ] Design is easily customizable for future theme changes
- [ ] No visual regressions in form functionality

### 2. Profile Access
- [ ] Authenticated users can access profile from main navigation
- [ ] UserMenu displays correctly in main layout
- [ ] Profile, settings, and logout are accessible from any page
- [ ] Unauthenticated users see login/signup options

### 3. Enhanced Features
- [ ] Research collaboration tools are functional
- [ ] Publication tracking integrates with existing literature database
- [ ] Admin dashboard provides user management capabilities
- [ ] Role assignment works with existing access control

### 4. Technical Quality
- [ ] All existing tests pass
- [ ] New features have test coverage
- [ ] Database migrations run successfully
- [ ] Performance impact is minimal
- [ ] Security model is maintained

## Assumptions

### 1. Design Assumptions
- Modern, clean design is preferred over themed interfaces
- Standard Tailwind classes provide sufficient styling flexibility
- Component modularity allows for easy future customization

### 2. Feature Assumptions
- Research collaboration features will be used primarily by RESEARCHER and ADMIN roles
- Publication tracking should leverage existing literature database
- Administrative features should follow existing security patterns

### 3. Technical Assumptions
- NextAuth.js v4 architecture remains the preferred authentication solution
- Prisma ORM continues to be used for database operations
- Existing validation and security measures are sufficient as a base

## Dependencies

### 1. External Dependencies
- No new major dependencies required
- Leverage existing NextAuth.js, Prisma, Zod, Tailwind CSS stack

### 2. Internal Dependencies  
- Must preserve existing authentication and authorization systems
- Database migrations must not affect existing user data
- Changes must maintain backward compatibility with existing APIs

## Migration Strategy

### 1. Phase 1: Core Fixes (Priority 1)
- Remove LCARS theming from authentication components
- Fix layout integration for profile access
- Ensure existing functionality is preserved

### 2. Phase 2: Enhanced Features (Priority 2)
- Implement research collaboration features
- Add enhanced publication tracking
- Create new database tables and relationships

### 3. Phase 3: Administrative Features (Priority 3)
- Build admin dashboard and user management
- Implement role assignment interface
- Add system monitoring and analytics