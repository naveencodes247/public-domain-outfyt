# Security Specification & Threat Model for OutFyt.co.in

## 1. System Context & Data Invariants

OutFyt.co.in is a curated fashion discovery platform with an Indian audience focus. The platform handles public catalog viewing, external affiliate link routing, and an administrator dashboard for content curation.

### Core Security Invariants
1. **Public Read Boundary**: Unauthenticated visitors and standard users may ONLY read outfits that have `status == 'published'`. Draft and archived outfits must be completely inaccessible to the public.
2. **Catalog Integrity & Administration**: Only verified administrative users (`isAdmin()`) can create, update, publish, archive, or delete `outfits` and `products`.
3. **Relational Consistency**: A `product` cannot be created or attached to a non-existent outfit. `outfitId` must refer to a real outfit document in `/outfits`.
4. **Privilege Escalation Prevention**: The `/admins` collection cannot be modified by non-administrators. No authenticated user can grant themselves admin rights via client SDK writes. Claims in client tokens are never trusted.
5. **Telemetry Abuse Prevention**: Click tracking (`/clickEvents`) permits append-only creation with strict schema and server-timestamp validation, but strictly prohibits client updates, deletions, and non-admin reads to prevent data harvesting and tampering.
6. **Temporal & Key Integrity**: Creation and update timestamps must enforce `request.time` server verification. `createdAt` is immutable. Shadow fields ("ghost properties") are rejected via strict key checking.
7. **Volumetric & Denial of Wallet Guards**: All string fields and collection sizes are strictly bounded by character length and array element caps.

---

## 2. The "Dirty Dozen" Adversarial Payloads

Below are twelve specific test payloads and attack vectors designed to challenge Identity, State, Integrity, and Schema bounds:

### Payload 1: Unauthenticated Outfit Creation
- **Target**: `POST /outfits/OUT-999`
- **Actor**: Unauthenticated (`request.auth == null`)
- **Payload**:
  ```json
  {
    "id": "OUT-999",
    "slug": "hacked-look",
    "title": "Hacked Outfit",
    "description": "Unauthorized submission",
    "category": "Casual",
    "tags": ["hack"],
    "heroImageUrl": "https://attacker.com/image.jpg",
    "status": "published",
    "createdAt": "2026-10-11T17:00:00Z",
    "updatedAt": "2026-10-11T17:00:00Z"
  }
  ```
- **Expected Result**: `PERMISSION_DENIED`

### Payload 2: Authenticated Non-Admin Outfit Creation
- **Target**: `POST /outfits/OUT-999`
- **Actor**: Authenticated user (`uid: "regular-user-456"`, non-admin)
- **Expected Result**: `PERMISSION_DENIED`

### Payload 3: Public Visitor Reading Draft Outfit
- **Target**: `GET /outfits/OUT-002` (where `status == "draft"`)
- **Actor**: Unauthenticated / standard visitor
- **Expected Result**: `PERMISSION_DENIED`

### Payload 4: Scraping Unfiltered Outfits List
- **Target**: `LIST /outfits` without `status == "published"` filter
- **Actor**: Unauthenticated visitor
- **Expected Result**: `PERMISSION_DENIED`

### Payload 5: Privilege Escalation via Self-Admin Write
- **Target**: `SET /admins/attacker-uid-123`
- **Actor**: Authenticated standard user (`uid: "attacker-uid-123"`)
- **Payload**:
  ```json
  {
    "email": "attacker@example.com",
    "role": "super_admin",
    "createdAt": "2026-10-11T17:00:00Z"
  }
  ```
- **Expected Result**: `PERMISSION_DENIED`

### Payload 6: Shadow Field Injection (Ghost Key Attack)
- **Target**: `UPDATE /outfits/OUT-001`
- **Actor**: Attacker trying to sneak unauthorized properties
- **Payload**:
  ```json
  {
    "title": "New Title",
    "isVerified": true,
    "systemRole": "admin"
  }
  ```
- **Expected Result**: `PERMISSION_DENIED`

### Payload 7: Client Timestamp Forgery
- **Target**: `CREATE /outfits/OUT-003`
- **Actor**: Admin payload attempting to supply manual/past client timestamp rather than server `request.time`
- **Payload**:
  ```json
  {
    "createdAt": "1999-01-01T00:00:00Z"
  }
  ```
- **Expected Result**: `PERMISSION_DENIED`

### Payload 8: Denial-of-Wallet Buffer Overflow Payload
- **Target**: `CREATE /outfits/OUT-999`
- **Actor**: Payload injecting 500KB string into title or 5,000 array items in tags
- **Payload**:
  ```json
  {
    "title": "A".repeat(500000),
    "tags": ["tag1", "tag2", ..., 5000 items]
  }
  ```
- **Expected Result**: `PERMISSION_DENIED`

### Payload 9: Mutation of Immutable `createdAt`
- **Target**: `UPDATE /outfits/OUT-001`
- **Actor**: Attempting to alter original document creation timestamp
- **Payload**:
  ```json
  {
    "createdAt": "2020-01-01T00:00:00Z",
    "updatedAt": "request.time"
  }
  ```
- **Expected Result**: `PERMISSION_DENIED`

### Payload 10: Orphaned Product Creation
- **Target**: `CREATE /products/PROD-999`
- **Actor**: Creating product pointing to non-existent outfit `outfitId: "NON_EXISTENT_ID"`
- **Expected Result**: `PERMISSION_DENIED`

### Payload 11: Telemetry Data Harvesting / Scraping
- **Target**: `LIST /clickEvents` or `GET /clickEvents/CLICK-123`
- **Actor**: Unauthenticated or non-admin user
- **Expected Result**: `PERMISSION_DENIED`

### Payload 12: ClickEvent Tampering or Deletion
- **Target**: `DELETE /clickEvents/CLICK-123` or `UPDATE /clickEvents/CLICK-123`
- **Actor**: Any user or visitor
- **Expected Result**: `PERMISSION_DENIED`

---

## 3. Implementation Verification Strategy

All rules are verified through unit and integration assertion suites evaluating both positive (authorized admin flows) and negative (adversarial, unverified, unauthenticated, and malformed) access attempts.
