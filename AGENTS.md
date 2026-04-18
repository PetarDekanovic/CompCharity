# Project Configuration & Reliability Requirements

## Database Strategy
- **Provider**: External MySQL Server (Hostinger)
- **Status**: Migration to Firebase is **FORBIDDEN**. 
- **Reasoning**: User requires a highly reliable backend without the read/write quotas associated with Firebase free tiers (which caused issues in previous projects like "wisefit").
- **Connectivity**: Prisma ORM is used for database interactions.

## File Handling
- Users will be uploading files (photos of devices for donation).
- The backend must handle file streams reliably.
- Metadata and file references should be stored in the primary MySQL database.

## Critical Instructions for AI Agent
- Do not attempt to replace MySQL with Firebase/Firestore.
- Every code modification must respect the existing MySQL/Prisma architecture.
- Prioritize performance and reliability in all backend operations.
- Maintain the `/api/system/check` and `/api/system/force-setup` endpoints as fallback diagnostics for the database connection.
