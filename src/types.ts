export type CampusRole = 
  | 'Platform Owner'
  | 'Institution Admin'
  | 'Department Admin'
  | 'Announcement Publisher'
  | 'Timetable Manager'
  | 'Moderator'
  | 'Teacher'
  | 'Class Representative'
  | 'CR'
  | 'Student'
  | 'Staff';

export type UserRole = CampusRole;

export const ALL_ASSIGNABLE_ROLES: CampusRole[] = [
  'Student',
  'Teacher',
  'Class Representative',
  'Staff',
  'Timetable Manager',
  'Announcement Publisher',
  'Department Admin',
  'Moderator',
  'Institution Admin'
];

export interface TeachingAssignment {
  subjectName: string;
  program: string;
  semester: string;
  section: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  photoURL?: string;
  loginProvider: 'google' | 'password';
  roles: string[];
  
  // Academic hierarchy references
  institution?: string;
  campus?: string;
  faculty?: string;
  department?: string;
  departmentId?: string;
  program?: string;
  programId?: string;
  batch?: string;
  academicYear?: string;
  semester?: string;
  section?: string;
  
  studentId?: string;
  bio?: string;
  teachingAssignments?: TeachingAssignment[];
  isProfileComplete?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AcademicDepartment {
  id: string;
  name: string;
  code: string;
  faculty?: string;
  headOfDepartment?: string;
  description?: string;
  programsCount?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface AcademicProgram {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  departmentName?: string;
  degreeType?: 'BS' | 'MS' | 'PhD' | 'Diploma';
  degreeLevel?: 'Undergraduate' | 'Graduate' | 'Postgraduate';
  durationYears?: string;
  totalSemesters?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface Notice {
  id: string;
  title: string;
  summary?: string;
  description: string;
  category: 'Academic' | 'Events' | 'Examinations' | 'Administrative' | 'General';
  priority: 'High' | 'Medium' | 'Normal';
  
  // Audience scope
  audienceScope: 'all' | 'department' | 'program' | 'section';
  targetDepartment?: string;
  targetProgram?: string;
  targetSemester?: string;
  targetSection?: string;
  
  authorName: string;
  authorUid: string;
  authorRole: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isImportant?: boolean;
  status?: 'published' | 'draft' | 'archived';
  createdAt: string;
}

export interface TimetableClass {
  id: string;
  subject: string;
  subjectCode?: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  instructor: string;
  room: string;
  
  departmentId?: string;
  programId?: string;
  programName?: string;
  batch?: string;
  semester?: string;
  section?: string;
  academicTerm?: string;
  sourcePdfId?: string;
  needsReview?: boolean;
  reviewNote?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface TimetablePdfUpload {
  id: string;
  fileName: string;
  term: string;
  academicYear: string;
  status: 'uploaded' | 'parsed' | 'reviewed' | 'published';
  entriesCount: number;
  programsCount: number;
  sectionsCount: number;
  reviewNeededCount: number;
  uploadedBy: string;
  uploadedAt: string;
  createdAt?: string;
  extractedEntries?: TimetableClass[];
}

export interface Material {
  id: string;
  title: string;
  subject: string;
  description: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  department?: string;
  program?: string;
  semester?: string;
  uploaderName: string;
  uploaderUid: string;
  createdAt: string;
  downloadUrl?: string;
}

export interface SubjectGroup {
  id: string;
  name: string;
  code: string;
  description: string;
  category?: 'official' | 'class' | 'subject' | 'community';
  program?: string;
  semester?: string;
  section?: string;
  createdBy: string;
  createdAt: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderUid: string;
  senderName: string;
  senderRole: string;
  text: string;
  createdAt: string;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'Books' | 'Electronics' | 'Calculators' | 'Stationery' | 'Furniture' | 'Hostel items' | 'Bikes' | 'Clothing' | 'Other';
  condition: 'Brand New' | 'Like New' | 'Good' | 'Fair';
  listingType: 'for_sale' | 'wanted' | 'free';
  campus: string;
  sellerUid: string;
  sellerName: string;
  sellerDepartment?: string;
  sellerProgram?: string;
  status: 'active' | 'reserved' | 'sold' | 'expired';
  imageUrl?: string;
  savedBy?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface MarketplaceMessage {
  id: string;
  listingId: string;
  listingTitle?: string;
  senderUid: string;
  senderName: string;
  recipientUid: string;
  text: string;
  createdAt: string;
}

export interface LostFoundItem {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  location: string;
  posterName: string;
  posterUid: string;
  status: 'open' | 'claimed' | 'resolved';
  date: string;
  contactInfo?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  recipientUid: string;
  title: string;
  message: string;
  type: 'notice' | 'message' | 'academic' | 'role' | 'marketplace' | 'timetable' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  actorName: string;
  actorEmail: string;
  action: string;
  target: string;
  details: string;
  createdAt: string;
}

export type NavigationPage = 
  | 'dashboard'
  | 'notices'
  | 'timetable'
  | 'materials'
  | 'groups'
  | 'marketplace'
  | 'lostfound'
  | 'notifications'
  | 'profile'
  | 'academic'
  | 'admin';
