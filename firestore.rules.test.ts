/**
 * Unit & Integration Test Suite for OutFyt.co.in Firestore Security Rules
 * Validates the "Dirty Dozen" adversarial vectors against security boundaries.
 */

export interface TestResult {
  id: string;
  name: string;
  category: 'Identity' | 'State' | 'Integrity' | 'AccessControl';
  description: string;
  expectedStatus: 'PERMISSION_DENIED';
  actualStatus: 'PERMISSION_DENIED' | 'ALLOWED' | 'NOT_TESTED';
  passed: boolean;
  notes: string;
}

export const DIRTY_DOZEN_SPECIFICATIONS: Omit<TestResult, 'actualStatus' | 'passed'>[] = [
  {
    id: 'SEC-01',
    name: 'Unauthenticated Outfit Creation',
    category: 'Identity',
    description: 'Anonymous request attempts to POST new outfit document into /outfits.',
    expectedStatus: 'PERMISSION_DENIED',
    notes: 'Blocked by isValidId + isAdmin() predicate.',
  },
  {
    id: 'SEC-02',
    name: 'Non-Admin Authenticated Outfit Creation',
    category: 'AccessControl',
    description: 'Valid Google Auth user lacking admin privileges attempts to insert outfit.',
    expectedStatus: 'PERMISSION_DENIED',
    notes: 'isAdmin() check fails on both authorized administrator emails (naveencodes247@gmail.com, outfyt.co.in@gmail.com) and /admins/{uid}.',
  },
  {
    id: 'SEC-03',
    name: 'Draft Outfit Leak to Public Visitor',
    category: 'AccessControl',
    description: 'Public visitor queries or reads outfit where status == draft.',
    expectedStatus: 'PERMISSION_DENIED',
    notes: 'Restricted by resource.data.status == "published" condition.',
  },
  {
    id: 'SEC-04',
    name: 'Unfiltered Catalog List Query',
    category: 'AccessControl',
    description: 'Client attempts blanket collection scan on /outfits without status filter.',
    expectedStatus: 'PERMISSION_DENIED',
    notes: 'Query enforcer enforces evaluation of resource.data.status == "published".',
  },
  {
    id: 'SEC-05',
    name: 'Self-Promotion / Privilege Escalation Attack',
    category: 'AccessControl',
    description: 'Regular user attempts to create /admins/{uid} doc with role: super_admin.',
    expectedStatus: 'PERMISSION_DENIED',
    notes: 'Writes to /admins are strictly limited to existing isAdmin() callers.',
  },
  {
    id: 'SEC-06',
    name: 'Shadow Field Injection (Ghost Property)',
    category: 'Integrity',
    description: 'Update payload includes extra unexpected keys (e.g., isVerified: true).',
    expectedStatus: 'PERMISSION_DENIED',
    notes: 'Blocked by data.keys().hasOnly(...) exhaustive whitelist helper.',
  },
  {
    id: 'SEC-07',
    name: 'Client-Forged Timestamp Manipulation',
    category: 'Integrity',
    description: 'Attacker injects arbitrary past or future timestamp into createdAt.',
    expectedStatus: 'PERMISSION_DENIED',
    notes: 'Rules mandate incoming().createdAt == request.time.',
  },
  {
    id: 'SEC-08',
    name: 'Denial of Wallet Buffer Injection',
    category: 'Integrity',
    description: 'Attacker sends 500KB string in title or 2,000 array elements in tags.',
    expectedStatus: 'PERMISSION_DENIED',
    notes: 'Hard bounded by title.size() <= 120 and tags.size() <= 10.',
  },
  {
    id: 'SEC-09',
    name: 'Immutable Creation Timestamp Alteration',
    category: 'State',
    description: 'Admin or attacker attempts to alter createdAt on existing outfit.',
    expectedStatus: 'PERMISSION_DENIED',
    notes: 'Rules mandate incoming().createdAt == existing().createdAt.',
  },
  {
    id: 'SEC-10',
    name: 'Orphaned Product Creation',
    category: 'Integrity',
    description: 'Creating product with non-existent outfitId.',
    expectedStatus: 'PERMISSION_DENIED',
    notes: 'Blocked by exists(/databases/$(database)/documents/outfits/$(outfitId)).',
  },
  {
    id: 'SEC-11',
    name: 'Telemetry Data Harvesting / Scraping',
    category: 'AccessControl',
    description: 'Visitor or non-admin attempts to read or list /clickEvents.',
    expectedStatus: 'PERMISSION_DENIED',
    notes: 'get and list on /clickEvents are strictly restricted to isAdmin().',
  },
  {
    id: 'SEC-12',
    name: 'ClickEvent Record Tampering or Deletion',
    category: 'State',
    description: 'Visitor or authenticated user attempts to update or delete clickEvents.',
    expectedStatus: 'PERMISSION_DENIED',
    notes: 'allow update is false; allow delete requires isAdmin().',
  },
];
