export type CampusRole = 
  | 'Student'
  | 'Teacher'
  | 'Class Representative'
  | 'CR'
  | 'Staff'
  | 'Announcement Publisher'
  | 'Timetable Manager'
  | 'Moderator'
  | 'Institution Admin';

export type UserRole = CampusRole;

export const ALL_ASSIGNABLE_ROLES: CampusRole[] = [
  'Student',
  'Teacher',
  'Class Representative',
  'CR',
  'Staff',
  'Announcement Publisher',
  'Timetable Manager',
  'Moderator',
  'Institution Admin'
];

export interface UserProfile {
  uid: string;
  name: string;
  username: string;
  email: string;
  loginProvider: 'google' | 'password';
  roles: string[];
  department?: string;
  program?: string;
  semester?: string;
  studentId?: string;
  bio?: string;
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'High' | 'Medium' | 'Normal';
  authorName: string;
  authorUid: string;
  authorRole: string;
  createdAt: string;
}

export interface TimetableClass {
  id: string;
  subject: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  instructor: string;
  room: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Material {
  id: string;
  title: string;
  subject: string;
  description: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploaderName: string;
  uploaderUid: string;
  createdAt: string;
  downloadUrl?: string;
  storagePath?: string;
}

export interface SubjectGroup {
  id: string;
  name: string;
  code: string;
  description: string;
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
  imageUrl: string;
  sellerUid: string;
  sellerName: string;
  sellerDepartment: string;
  sellerProgram: string;
  status: 'active' | 'reserved' | 'sold';
  createdAt: string;
  updatedAt?: string;
}

export interface MarketplaceMessage {
  id: string;
  listingId: string;
  listingTitle: string;
  senderUid: string;
  senderName: string;
  receiverUid: string;
  text: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  recipientUid: string;
  title: string;
  message: string;
  type: 'notice' | 'message' | 'academic' | 'role' | 'system' | 'marketplace';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export type NavigationPage = 
  | 'dashboard'
  | 'notices'
  | 'timetable'
  | 'materials'
  | 'groups'
  | 'lostfound'
  | 'marketplace'
  | 'notifications'
  | 'profile'
  | 'owner-admin'
  | 'admin';

export type OwnerAdminTab =
  | 'users'
  | 'roles'
  | 'database'
  | 'system';
