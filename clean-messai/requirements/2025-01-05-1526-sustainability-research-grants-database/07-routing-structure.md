# Routing Structure for Grants Database

**Feature:** Sustainability Research Grants Database  
**Integration:** MESSAi Platform Routing  

## Current Navigation Context

### Existing Main Navigation (app/layout.tsx)
- **Home** (`/`) - Design catalog
- **Designs** (`/designs`) - MFC design catalog  
- **Dashboard** (`/dashboard`) - User dashboard
- **Experiments** (`/experiments`) - *Referenced but no page exists*
- **Literature** (`/literature`) - Research papers database

### Proposed Integration
Add **Grants** between Literature and User section in sidebar navigation.

## Grants Database Routing Structure

### 1. Main Public Routes

#### `/grants` - Main Grants Database Page
- **Purpose**: Browse and search available grants
- **Access**: All authenticated users
- **Features**: Search, filters, pagination, export
- **Template**: Follow `/literature` page patterns
- **Components**: GrantCard, GrantFilters, SearchBar, Pagination

#### `/grants/[id]` - Individual Grant Detail Page
- **Purpose**: View grant details and track application
- **Access**: All authenticated users
- **Features**: Full grant info, application tracking, related papers
- **Template**: Follow `/literature/[id]` patterns
- **Components**: GrantDetail, ApplicationTracker, RelatedPapers

### 2. Admin Routes

#### `/grants/admin` - Admin Grant Management
- **Purpose**: Create, edit, and manage grants
- **Access**: ADMIN and SUPER_ADMIN roles only
- **Features**: CRUD operations, bulk management, analytics
- **Protection**: Role-based access control
- **Components**: AdminGrantList, GrantForm, BulkActions

#### `/grants/admin/create` - Create New Grant
- **Purpose**: Add new grants to database
- **Access**: ADMIN and SUPER_ADMIN roles only
- **Features**: Multi-section form, validation, preview
- **Template**: Follow `/literature/upload` patterns
- **Components**: GrantForm, FormSections, Validation

#### `/grants/admin/[id]/edit` - Edit Existing Grant
- **Purpose**: Modify grant information
- **Access**: ADMIN and SUPER_ADMIN roles only
- **Features**: Pre-populated form, version tracking
- **Components**: GrantForm, ChangeHistory

### 3. User Application Routes

#### `/grants/applications` - My Grant Applications
- **Purpose**: View user's application history and status
- **Access**: Authenticated users (own applications only)
- **Features**: Status tracking, notes, deadlines, export
- **Components**: ApplicationList, StatusBadge, DeadlineAlert

#### `/grants/applications/[id]` - Application Detail
- **Purpose**: Detailed view of specific application
- **Access**: Application owner only
- **Features**: Full application details, status history, notes
- **Components**: ApplicationDetail, StatusHistory, Notes

## API Routing Structure

### 1. Grant Management APIs

#### `GET /api/grants` - List Grants
- **Purpose**: Paginated grants listing with search/filters
- **Access**: Authenticated users
- **Features**: Pagination, search, filtering, sorting

#### `POST /api/grants` - Create Grant
- **Purpose**: Create new grant (admin only)
- **Access**: ADMIN and SUPER_ADMIN roles
- **Features**: Validation, data sanitization

#### `GET /api/grants/[id]` - Get Grant Details
- **Purpose**: Individual grant information
- **Access**: Authenticated users
- **Features**: Full grant data, related papers

#### `PUT /api/grants/[id]` - Update Grant
- **Purpose**: Modify grant information (admin only)
- **Access**: ADMIN and SUPER_ADMIN roles
- **Features**: Validation, audit logging

#### `DELETE /api/grants/[id]` - Delete Grant
- **Purpose**: Remove grant from database (admin only)
- **Access**: SUPER_ADMIN role only
- **Features**: Soft delete, dependency checking

### 2. Application Tracking APIs

#### `GET /api/grant-applications` - List User Applications
- **Purpose**: User's grant application history
- **Access**: Authenticated users (own data only)
- **Features**: Filtering, sorting, export

#### `POST /api/grant-applications` - Create Application
- **Purpose**: Start tracking a grant application
- **Access**: Authenticated users
- **Features**: Validation, duplicate prevention

#### `PUT /api/grant-applications/[id]` - Update Application
- **Purpose**: Modify application status or notes
- **Access**: Application owner only
- **Features**: Status validation, audit logging

#### `DELETE /api/grant-applications/[id]` - Remove Application
- **Purpose**: Stop tracking an application
- **Access**: Application owner only

### 3. Export APIs

#### `GET /api/grants/export` - Export Grants
- **Purpose**: CSV export of grants database
- **Access**: Authenticated users
- **Features**: Filtering, format options

#### `GET /api/grant-applications/export` - Export Applications
- **Purpose**: CSV export of user applications
- **Access**: Application owner only
- **Features**: Custom fields, date ranges

## Navigation Integration

### Updated app/layout.tsx Sidebar
```tsx
{/* Existing navigation items */}
<a href="/literature" className="...">Literature</a>

{/* New grants navigation */}
<a href="/grants" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
  Grants
</a>

{/* User section remains at bottom */}
```

## Route Protection Patterns

### Authentication Requirements
- **Public routes**: None (all require authentication)
- **User routes**: `/grants/*` (except admin)
- **Admin routes**: `/grants/admin/*` (ADMIN role required)
- **Application routes**: `/grants/applications/*` (owner only)

### Role-Based Access Control
```typescript
// Admin routes protection
const adminRoutes = ['/grants/admin', '/grants/admin/create', '/grants/admin/[id]/edit']
adminRoutes.forEach(route => requireRole(route, 'ADMIN'))

// User application routes protection
const applicationRoutes = ['/grants/applications', '/grants/applications/[id]']
applicationRoutes.forEach(route => requireAuth(route))
```

## URL Structure Consistency

### Following Existing Patterns
- **Literature**: `/literature`, `/literature/[id]`, `/literature/upload`
- **Grants**: `/grants`, `/grants/[id]`, `/grants/admin`
- **Settings**: `/settings`, `/settings/account`, `/settings/security`

### SEO and User-Friendly URLs
- `/grants` - Clear, semantic URL
- `/grants/sustainability-research-fund-2024` - Readable grant URLs
- `/grants/applications` - Clear application management

### Dynamic Route Parameters
- `[id]` for individual resources (grants, applications)
- Admin routes use `/admin` prefix for clear separation
- Consistent with existing `/literature` patterns

## Integration with Existing Features

### Literature Database Links
- Grant detail pages link to related research papers
- Paper detail pages show related grant opportunities
- Cross-referencing through GrantPaper junction table

### User Dashboard Integration
- Show upcoming grant deadlines
- Display recent applications
- Quick links to saved grants

### Notification Integration
- Email reminders for grant deadlines
- Status change notifications
- Weekly digest of new grants

This routing structure maintains consistency with the existing MESSAi platform patterns while providing clear, logical organization for the grants database feature.