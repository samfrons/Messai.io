# Requirements Specification: Sustainability Research Grants Database

**Project:** MESSAi MVP  
**Feature:** Sustainability Research Grants Database  
**Date:** 2025-01-05  
**Version:** 1.0

## Problem Statement

Researchers working on microbial electrochemical systems and sustainability projects need a centralized, searchable database of funding opportunities to support their research. Currently, researchers must manually search multiple funding organization websites, track application deadlines, and manage their grant applications across different platforms.

## Solution Overview

Implement a comprehensive grants database within the MESSAi platform that provides:
- Searchable catalog of sustainability research grants
- Application tracking and deadline management
- Integration with the existing research literature database
- Export capabilities for research management

## Functional Requirements

### 1. Grant Database Management (Admin-Only)
- **REQ-1.1**: Administrators can add new grants to the database
- **REQ-1.2**: Administrators can edit existing grant information
- **REQ-1.3**: Administrators can mark grants as active/inactive
- **REQ-1.4**: System maintains historical grants for reference
- **REQ-1.5**: Grants are publicly viewable by all authenticated users

### 2. Grant Search and Discovery
- **REQ-2.1**: Users can search grants by title, organization, and description
- **REQ-2.2**: Users can filter grants by category (Energy, Environment, Healthcare, Education)
- **REQ-2.3**: Users can filter by funding amount range
- **REQ-2.4**: Users can filter by application deadline
- **REQ-2.5**: Users can filter by grant status (active, expired)
- **REQ-2.6**: Search results display with pagination (10 grants per page)
- **REQ-2.7**: Users can sort results by deadline, amount, or relevance

### 3. Grant Information Display
- **REQ-3.1**: Grant cards display title, organization, amount, deadline, and category
- **REQ-3.2**: Grant detail pages show full description, eligibility requirements, and application URL
- **REQ-3.3**: Grant pages indicate status (active, expired, closing soon)
- **REQ-3.4**: Grant pages show related research papers when available
- **REQ-3.5**: Grant contact information and application links are prominently displayed

### 4. Application Tracking
- **REQ-4.1**: Users can save grants to their personal tracking list
- **REQ-4.2**: Users can record application status (draft, submitted, under review, approved, rejected)
- **REQ-4.3**: Users can add personal notes to tracked applications
- **REQ-4.4**: Users can view their application history and status
- **REQ-4.5**: Users can remove grants from their tracking list

### 5. Deadline Notifications
- **REQ-5.1**: System sends email reminders 30 days before application deadline
- **REQ-5.2**: System sends email reminders 7 days before application deadline
- **REQ-5.3**: System sends email reminders 1 day before application deadline
- **REQ-5.4**: Users can configure notification preferences
- **REQ-5.5**: Notifications are sent only for actively tracked grants

### 6. Literature Integration
- **REQ-6.1**: Grants can be linked to relevant research papers
- **REQ-6.2**: Research papers can display related grant opportunities
- **REQ-6.3**: Users can discover grants based on their paper interests
- **REQ-6.4**: Grant-paper relationships are maintained by administrators

### 7. Data Export
- **REQ-7.1**: Users can export their tracked grants to CSV
- **REQ-7.2**: Users can export search results to CSV
- **REQ-7.3**: Export includes grant details, application status, and personal notes
- **REQ-7.4**: Export functionality respects user privacy and access controls

## Technical Requirements

### Database Schema
- **TECH-1**: Extend `prisma/schema.prisma` with Grant and GrantApplication models
- **TECH-2**: Create GrantPaper junction table for literature integration
- **TECH-3**: Follow existing ResearchPaper model patterns for consistency
- **TECH-4**: Implement proper indexing for search performance

### API Implementation
- **TECH-5**: Create `/api/grants` endpoint following `/api/papers` patterns
- **TECH-6**: Implement GET (list/search), POST (admin create), PUT (admin update), DELETE (admin)
- **TECH-7**: Create `/api/grant-applications` endpoint for user tracking
- **TECH-8**: Implement proper authentication and role-based access control
- **TECH-9**: Add CSV export endpoints for data export functionality

### Frontend Implementation
- **TECH-10**: Create `/app/grants` pages following `/app/literature` structure
- **TECH-11**: Implement grants listing page with search and filters (`/grants`)
- **TECH-12**: Create grant detail pages with application tracking (`/grants/[id]`)
- **TECH-13**: Build admin interface for grant management (`/grants/admin`)
- **TECH-14**: Add grants navigation link to `app/layout.tsx` sidebar
- **TECH-15**: Implement responsive design using standard Tailwind CSS classes

### Integration Points
- **TECH-16**: Integrate with existing authentication system (`lib/auth`)
- **TECH-17**: Use existing email notification system (`lib/email.ts`)
- **TECH-18**: Follow existing pagination patterns from literature feature
- **TECH-19**: Maintain consistency with clean, modern design using Tailwind CSS

## Implementation Hints

### Database Models
```typescript
// Grant model based on ResearchPaper patterns
model Grant {
  id                      String   @id @default(cuid())
  title                   String
  organization            String
  description             String?
  amount                  Float?
  currency                String   @default("USD")
  applicationDeadline     DateTime?
  category                String   // JSON array: ["Energy", "Environment", etc.]
  eligibilityRequirements String?
  applicationUrl          String
  contactEmail            String?
  isActive                Boolean  @default(true)
  createdBy               String
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  user                    User     @relation(fields: [createdBy], references: [id])
  applications            GrantApplication[]
  papers                  GrantPaper[]
}

model GrantApplication {
  id        String   @id @default(cuid())
  grantId   String
  userId    String
  status    String   @default("SAVED") // SAVED, DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
  notes     String?
  appliedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  grant     Grant    @relation(fields: [grantId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
}
```

### Key File Modifications
1. **Navigation**: Add grants section to `app/layout.tsx` sidebar (between Literature and User section)
2. **Database**: Update `prisma/schema.prisma` with new models
3. **API Routes**: 
   - `app/api/grants/route.ts` (CRUD operations)
   - `app/api/grants/[id]/route.ts` (individual grant)
   - `app/api/grant-applications/route.ts` (application tracking)
   - `app/api/grants/export/route.ts` (CSV export)
4. **Pages**: 
   - `app/grants/page.tsx` (main listing)
   - `app/grants/[id]/page.tsx` (grant details)
   - `app/grants/admin/page.tsx` (admin management)
   - `app/grants/applications/page.tsx` (user applications)
5. **Components**: Create `components/grants/` directory with GrantCard, GrantFilters, ApplicationTracker, etc.

### Route Structure (see 07-routing-structure.md for details)
- **Public**: `/grants`, `/grants/[id]`, `/grants/applications`
- **Admin**: `/grants/admin`, `/grants/admin/create`, `/grants/admin/[id]/edit`
- **API**: `/api/grants/*`, `/api/grant-applications/*`

### Reusable Patterns
- **Search Implementation**: Copy from `app/api/papers/route.ts` advanced search patterns
- **Card Components**: Create GrantCard using standard Tailwind classes (following literature patterns)
- **Form Patterns**: Use `app/literature/upload/page.tsx` patterns for grant creation
- **Pagination**: Reuse pagination components from literature feature
- **UI Components**: Use clean, modern Tailwind styling without LCARS theme

## Acceptance Criteria

### Core Functionality
- [ ] Administrators can add, edit, and manage grants
- [ ] Users can search and filter grants effectively
- [ ] Users can track their grant applications
- [ ] Email notifications work for approaching deadlines
- [ ] Data export produces accurate CSV files
- [ ] Grants integrate with research literature

### User Experience
- [ ] Interface follows clean, modern design with standard Tailwind CSS
- [ ] Search results load within 2 seconds
- [ ] Mobile responsive design functions properly
- [ ] Navigation between grants and literature is intuitive
- [ ] Error messages are clear and helpful

### Technical Standards
- [ ] All API endpoints include proper authentication
- [ ] Database queries are optimized with appropriate indexes
- [ ] Code follows existing TypeScript patterns
- [ ] Tests pass for new functionality
- [ ] No console errors in browser

### Data Quality
- [ ] Grant information displays accurately
- [ ] Application status tracking works reliably
- [ ] Deadline calculations are correct
- [ ] Export data matches displayed information
- [ ] Historical grants remain accessible

## Assumptions

1. **Data Source**: Administrators will manually enter grant information (no automated data feeds)
2. **User Authentication**: All users must be authenticated to access grants database
3. **Email Delivery**: Existing email system (`lib/email.ts`) is reliable for notifications
4. **Storage**: Database can handle expected volume of grants and applications
5. **Performance**: Current hosting infrastructure supports additional database load
6. **Maintenance**: Administrators will keep grant information current and accurate

## Dependencies

- **Authentication System**: Requires existing NextAuth.js implementation
- **Email System**: Depends on configured email service in `lib/email.ts`
- **Database**: Requires Prisma ORM and database connection
- **UI Components**: Uses standard Tailwind CSS for clean, modern styling
- **Literature Feature**: Leverages existing patterns from research papers feature

## Success Metrics

- Users can find relevant grants within 3 search attempts
- Application tracking reduces missed deadlines by 80%
- Email notifications have 95% delivery success rate
- Data export generates accurate files for 100% of requests
- Feature adoption by 70% of active researchers within 30 days

---

*This requirements specification provides a comprehensive blueprint for implementing the sustainability research grants database feature while maintaining consistency with the existing MESSAi platform architecture and user experience.*