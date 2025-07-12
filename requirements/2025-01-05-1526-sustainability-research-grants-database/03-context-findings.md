# Context Findings

**Phase 3: Targeted Context Gathering**

## Literature/Papers Feature Analysis

### Database Schema Pattern (`prisma/schema.prisma`)
The ResearchPaper model (lines 197-236) provides an excellent template for the Grant model:
- **Metadata fields**: title, abstract, DOI, journal, authors (JSON)
- **Classification**: systemType, keywords (JSON), organism types
- **Metrics**: powerOutput, efficiency, conductivity
- **Visibility**: isPublic boolean for access control
- **Relationships**: uploadedBy (User), ExperimentPaper junction table
- **Timestamps**: createdAt, updatedAt

### API Implementation (`app/api/papers/route.ts`)
Recent updates show sophisticated query patterns:
- **Pagination**: page/limit parameters with skip/take
- **Search**: Multi-field OR conditions across title, abstract, keywords, journal, authors
- **Visibility**: Complex OR logic combining public papers + user's own papers
- **Authentication**: getServerSession integration
- **Performance**: Promise.all for concurrent database queries

### Frontend Patterns (`app/literature/`)
- **List View**: Server-side pagination with client state management
- **Search Form**: Debounced input handling
- **Card Layout**: Metadata display with consistent styling
- **Upload Form**: Multi-section organization with dynamic arrays

## User Authentication & Permissions

### Role-Based Access Control (`prisma/schema.prisma`, `lib/auth/auth-utils.ts`)
- **User Roles**: USER, RESEARCHER, ADMIN, SUPER_ADMIN (string-based)
- **Permission System**: hasPermission() function for resource-action checking
- **Admin Features**: Role-based route protection patterns
- **Session Management**: NextAuth.js integration with role-based access

### Admin-Only Content Pattern
For grants database where only admins can add entries:
- Route protection: `session?.user?.role === 'ADMIN'`
- Form access control in middleware
- Data validation with role checking

## Application Tracking Patterns

### Status Management (`prisma/schema.prisma`)
Experiment model shows status tracking pattern:
- String-based status field with default values
- Status progression tracking in workflows
- Could adapt for grant application statuses: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED

### Notification System (`lib/email.ts`)
Email integration already exists for:
- User notifications
- Status updates
- Could extend for grant application deadlines and status changes

## Form and Data Management

### Multi-Section Forms (`app/literature/upload/page.tsx`)
Excellent patterns for grant entry forms:
- **Dynamic Arrays**: Add/remove functionality for authors, keywords
- **JSON Field Handling**: Consistent preprocessing for complex fields
- **Validation**: Client-side validation with server-side verification
- **Error Handling**: Contextual error messages

### File Upload Patterns
Existing file upload could be extended for grant documents:
- Document attachments
- Application materials
- Supporting files

## UI/UX Patterns

### LCARS Design System (`components/lcars/`)
- **LCARSButton**: Multiple variants (primary, secondary, danger, warning, success)
- **LCARSPanel**: Themed panels with border options
- **Color Consistency**: Orange (#FF9900), cyan (#99CCFF), standard grays

### Layout Patterns (`app/layout.tsx`)
- **Sidebar Navigation**: Expandable sidebar with icon-based navigation
- **Literature Section**: Already exists, can add "Grants" section
- **Responsive Design**: Tailwind-based responsive utilities

## Integration Patterns

### Literature Integration
Based on discovery answers, grants should integrate with research papers:
- **Junction Table**: Similar to ExperimentPaper model
- **Cross-References**: Link grants to funded research papers
- **Metadata Preservation**: Full grant information maintained

### Current Navigation Structure
Sidebar menu (lines 47-81) shows:
- Dashboard
- Designs
- Literature (existing)
- **Grants (new section)**

## Key Files for Implementation

### Database Schema Extensions
- `prisma/schema.prisma` - Add Grant and GrantApplication models
- Follow ResearchPaper pattern for metadata fields
- Add junction table for Grant-ResearchPaper relationships

### API Routes to Create
- `app/api/grants/route.ts` - CRUD operations (follow papers pattern)
- `app/api/grants/[id]/route.ts` - Individual grant operations
- `app/api/grant-applications/route.ts` - Application tracking

### Frontend Pages to Create
- `app/grants/page.tsx` - Main grants listing (adapt from literature)
- `app/grants/[id]/page.tsx` - Grant detail view
- `app/grants/create/page.tsx` - Admin-only grant creation
- `app/grants/applications/page.tsx` - User application tracking

### Components to Create/Adapt
- `components/grants/GrantCard.tsx` - Adapt from PaperCard
- `components/grants/GrantFilters.tsx` - Filter sidebar
- `components/grants/GrantForm.tsx` - Admin creation form
- `components/grants/ApplicationStatus.tsx` - Status tracking

## Reusable Patterns Identified

1. **Database Model**: ResearchPaper structure
2. **API Patterns**: papers/route.ts pagination and search
3. **Authentication**: Role-based access control
4. **Form Patterns**: Multi-section forms with dynamic arrays
5. **UI Components**: LCARS design system
6. **Navigation**: Sidebar menu structure
7. **Search/Filter**: Advanced filtering from papers API

## Technical Constraints

1. **Admin-Only Entry**: No user submission forms needed
2. **Public Access**: All grants visible to authenticated users
3. **Historical Data**: Include expired grants with status indicators
4. **Paper Integration**: Junction table for grant-paper relationships
5. **Application Tracking**: Status management for user applications

## Next Steps

The codebase provides excellent foundations for implementing the grants database feature. The literature/papers system offers comprehensive patterns that can be directly adapted for grants management while maintaining architectural consistency.