import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  or, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, PERMANENT_OWNER_EMAIL } from '../firebase';
import { 
  Notice, 
  TimetableClass, 
  TimetablePdfUpload,
  Material, 
  SubjectGroup, 
  GroupMessage, 
  LostFoundItem, 
  NotificationItem, 
  UserProfile,
  AcademicDepartment,
  AcademicProgram,
  MarketplaceListing,
  MarketplaceMessage,
  AuditLog
} from '../types';

// ==========================================
// AUDIT LOGS
// ==========================================
export async function logAuditEvent(
  actor: { uid: string; name: string; email: string },
  action: string,
  target: string,
  details: string
) {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      actorUid: actor.uid,
      actorName: actor.name,
      actorEmail: actor.email,
      action,
      target,
      details,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Audit log write error:', err);
  }
}

export function subscribeAuditLogs(callback: (logs: AuditLog[]) => void) {
  const colRef = collection(db, 'audit_logs');
  return onSnapshot(colRef, (snapshot) => {
    const list: AuditLog[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as AuditLog));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list.slice(0, 50));
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, 'audit_logs');
  });
}

// ==========================================
// ACADEMIC STRUCTURE (Dynamic in Firestore)
// ==========================================
export function subscribeDepartments(callback: (depts: AcademicDepartment[]) => void) {
  const colRef = collection(db, 'academic_departments');
  return onSnapshot(colRef, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AcademicDepartment));
    list.sort((a, b) => a.name.localeCompare(b.name));
    callback(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, 'academic_departments');
  });
}

export async function saveDepartment(data: Omit<AcademicDepartment, 'id'>, id?: string) {
  try {
    if (id) {
      await updateDoc(doc(db, 'academic_departments', id), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return id;
    } else {
      const docRef = await addDoc(collection(db, 'academic_departments'), {
        ...data,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    }
  } catch (err) {
    handleFirestoreError(err, id ? OperationType.UPDATE : OperationType.CREATE, 'academic_departments');
    throw err;
  }
}

export const createDepartment = saveDepartment;

export async function deleteDepartment(id: string) {
  try {
    await deleteDoc(doc(db, 'academic_departments', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `academic_departments/${id}`);
    throw err;
  }
}

export function subscribePrograms(callback: (programs: AcademicProgram[]) => void) {
  const colRef = collection(db, 'academic_programs');
  return onSnapshot(colRef, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AcademicProgram));
    list.sort((a, b) => a.name.localeCompare(b.name));
    callback(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, 'academic_programs');
  });
}

export async function saveProgram(data: Omit<AcademicProgram, 'id'>, id?: string) {
  try {
    if (id) {
      await updateDoc(doc(db, 'academic_programs', id), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return id;
    } else {
      const docRef = await addDoc(collection(db, 'academic_programs'), {
        ...data,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    }
  } catch (err) {
    handleFirestoreError(err, id ? OperationType.UPDATE : OperationType.CREATE, 'academic_programs');
    throw err;
  }
}

export const createProgram = saveProgram;

export async function deleteProgram(id: string) {
  try {
    await deleteDoc(doc(db, 'academic_programs', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `academic_programs/${id}`);
    throw err;
  }
}

// ==========================================
// NOTICES & TARGETED ANNOUNCEMENTS
// ==========================================
export function subscribeNotices(callback: (notices: Notice[]) => void) {
  const colRef = collection(db, 'notices');
  return onSnapshot(colRef, (snapshot) => {
    const list: Notice[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Notice));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'notices');
  });
}

// User-personalized notice subscription with audience filtering
export function subscribePersonalizedNotices(
  userProfile: UserProfile | null, 
  callback: (notices: Notice[]) => void
) {
  const colRef = collection(db, 'notices');
  return onSnapshot(colRef, (snapshot) => {
    const allNotices: Notice[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Notice));

    // Filter by audience targeting:
    const filtered = allNotices.filter(notice => {
      // If admin or publisher, they see all
      if (
        userProfile?.email?.toLowerCase() === PERMANENT_OWNER_EMAIL.toLowerCase() ||
        userProfile?.roles?.some(r => ['Institution Admin', 'Announcement Publisher'].includes(r))
      ) {
        return true;
      }

      // 1. University-wide announcement
      if (!notice.audienceScope || notice.audienceScope === 'all') return true;

      // 2. Department-wide
      if (notice.audienceScope === 'department') {
        if (!notice.targetDepartment) return true;
        return notice.targetDepartment === userProfile?.department || 
               notice.targetDepartment === userProfile?.departmentId;
      }

      // 3. Degree Program
      if (notice.audienceScope === 'program') {
        if (!notice.targetProgram) return true;
        return notice.targetProgram === userProfile?.program || 
               notice.targetProgram === userProfile?.programId;
      }

      // 4. Section & Semester specific
      if (notice.audienceScope === 'section') {
        const matchesProgram = !notice.targetProgram || notice.targetProgram === userProfile?.program;
        const matchesSemester = !notice.targetSemester || notice.targetSemester === userProfile?.semester;
        const matchesSection = !notice.targetSection || notice.targetSection === userProfile?.section;
        return matchesProgram && matchesSemester && matchesSection;
      }

      return true;
    });

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(filtered);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'notices');
  });
}

export async function createNotice(data: Omit<Notice, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'notices'), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'notices');
    throw error;
  }
}

export async function deleteNotice(id: string) {
  try {
    await deleteDoc(doc(db, 'notices', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `notices/${id}`);
    throw error;
  }
}

// ==========================================
// TIMETABLE & AUTOMATION
// ==========================================
export function subscribeTimetable(callback: (classes: TimetableClass[]) => void) {
  const colRef = collection(db, 'timetable');
  return onSnapshot(colRef, (snapshot) => {
    const list: TimetableClass[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as TimetableClass));
    list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'timetable');
  });
}

// Targeted timetable filtering:
export function subscribePersonalizedTimetable(
  userProfile: UserProfile | null,
  callback: (classes: TimetableClass[]) => void
) {
  const colRef = collection(db, 'timetable');
  return onSnapshot(colRef, (snapshot) => {
    const all = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as TimetableClass));

    if (!userProfile) {
      callback(all);
      return;
    }

    const isTeacher = userProfile.roles?.includes('Teacher');
    const isOwner = userProfile.email?.toLowerCase() === PERMANENT_OWNER_EMAIL.toLowerCase();
    const isAdmin = isOwner || userProfile.roles?.some(r => ['Institution Admin', 'Timetable Manager'].includes(r));

    if (isAdmin) {
      callback(all);
      return;
    }

    if (isTeacher) {
      // Filter by teacher name or teaching assignments
      const teacherNameLower = (userProfile.name || '').toLowerCase();
      const teacherClasses = all.filter(c => 
        (c.instructor && c.instructor.toLowerCase().includes(teacherNameLower)) ||
        userProfile.teachingAssignments?.some(ta => ta.subjectName === c.subject)
      );
      // If teacher has classes assigned, show those; otherwise show all with note
      callback(teacherClasses.length > 0 ? teacherClasses : all);
      return;
    }

    // Student filter: Match program, semester, section
    const studentClasses = all.filter(c => {
      let matches = true;
      if (userProfile.program && c.programName) {
        matches = matches && (
          c.programName.toLowerCase().includes(userProfile.program.toLowerCase()) ||
          userProfile.program.toLowerCase().includes(c.programName.toLowerCase())
        );
      }
      if (userProfile.semester && c.semester) {
        matches = matches && (
          c.semester.toLowerCase() === userProfile.semester.toLowerCase() ||
          c.semester.replace(/\D/g, '') === userProfile.semester.replace(/\D/g, '')
        );
      }
      if (userProfile.section && c.section) {
        matches = matches && (
          c.section.toLowerCase() === userProfile.section.toLowerCase()
        );
      }
      return matches;
    });

    callback(studentClasses.length > 0 ? studentClasses : all);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'timetable');
  });
}

export async function saveTimetableBatch(entries: TimetableClass[], pdfUploadMeta?: Omit<TimetablePdfUpload, 'id'>) {
  try {
    const batch = writeBatch(db);
    
    // Save PDF record if provided
    if (pdfUploadMeta) {
      const pdfDocRef = doc(collection(db, 'timetable_pdfs'));
      batch.set(pdfDocRef, {
        ...pdfUploadMeta,
        createdAt: new Date().toISOString()
      });
    }

    // Save timetable entries
    for (const item of entries) {
      const classRef = doc(collection(db, 'timetable'));
      const { id, ...dataWithoutId } = item;
      batch.set(classRef, {
        ...dataWithoutId,
        updatedAt: new Date().toISOString()
      });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'timetable');
    throw error;
  }
}

export async function saveTimetableClass(data: Omit<TimetableClass, 'id'>, id?: string) {
  try {
    if (id) {
      await updateDoc(doc(db, 'timetable', id), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return id;
    } else {
      const docRef = await addDoc(collection(db, 'timetable'), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    }
  } catch (error) {
    handleFirestoreError(error, id ? OperationType.UPDATE : OperationType.CREATE, 'timetable');
    throw error;
  }
}

export async function deleteTimetableClass(id: string) {
  try {
    await deleteDoc(doc(db, 'timetable', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `timetable/${id}`);
    throw error;
  }
}

export async function clearAllTimetableClasses() {
  try {
    const snap = await getDocs(collection(db, 'timetable'));
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'timetable');
    throw error;
  }
}

export function subscribeTimetablePdfs(callback: (uploads: TimetablePdfUpload[]) => void) {
  const colRef = collection(db, 'timetable_pdfs');
  return onSnapshot(colRef, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TimetablePdfUpload));
    list.sort((a, b) => new Date(b.createdAt || b.uploadedAt).getTime() - new Date(a.createdAt || a.uploadedAt).getTime());
    callback(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, 'timetable_pdfs');
  });
}

// ==========================================
// CAMPUS MARKETPLACE
// ==========================================
export function subscribeMarketplace(callback: (listings: MarketplaceListing[]) => void) {
  const colRef = collection(db, 'marketplace');
  return onSnapshot(colRef, (snapshot) => {
    const list: MarketplaceListing[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as MarketplaceListing));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'marketplace');
  });
}

export async function createMarketplaceListing(data: Omit<MarketplaceListing, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'marketplace'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'marketplace');
    throw error;
  }
}

export async function updateMarketplaceListing(id: string, data: Partial<MarketplaceListing>) {
  try {
    await updateDoc(doc(db, 'marketplace', id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `marketplace/${id}`);
    throw error;
  }
}

export async function deleteMarketplaceListing(id: string) {
  try {
    await deleteDoc(doc(db, 'marketplace', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `marketplace/${id}`);
    throw error;
  }
}

export function subscribeMarketplaceMessages(
  listingId: string,
  userUid: string | undefined,
  callback: (messages: MarketplaceMessage[]) => void
) {
  const colRef = collection(db, 'marketplace', listingId, 'messages');
  if (!userUid) {
    callback([]);
    return () => {};
  }
  const messagesQuery = query(
    colRef,
    or(
      where('senderUid', '==', userUid),
      where('recipientUid', '==', userUid)
    )
  );
  return onSnapshot(messagesQuery, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MarketplaceMessage));
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    callback(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, `marketplace/${listingId}/messages`);
  });
}

export async function sendMarketplaceMessage(
  listingId: string, 
  listingTitle: string,
  recipientUid: string, 
  text: string, 
  user: UserProfile
) {
  try {
    await addDoc(collection(db, 'marketplace', listingId, 'messages'), {
      listingId,
      listingTitle,
      senderUid: user.uid,
      senderName: user.name,
      recipientUid,
      text: text.trim(),
      createdAt: new Date().toISOString()
    });

    // Notifications for cross-user actions should be generated by a trusted
    // backend/Cloud Function. Do not let a client inject arbitrary inbox items.
    // The message itself is already stored and updates in real time.
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `marketplace/${listingId}/messages`);
    throw err;
  }
}

export async function reportMarketplaceListing(listingId: string, listingTitle: string, reason: string, reporter: UserProfile) {
  try {
    await addDoc(collection(db, 'marketplace_reports'), {
      listingId,
      listingTitle,
      reason,
      reporterUid: reporter.uid,
      reporterName: reporter.name,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'marketplace_reports');
    throw err;
  }
}

// ==========================================
// MATERIALS
// ==========================================
export function subscribeMaterials(callback: (materials: Material[]) => void) {
  const colRef = collection(db, 'materials');
  return onSnapshot(colRef, (snapshot) => {
    const list: Material[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Material));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'materials');
  });
}

export async function createMaterial(data: Omit<Material, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'materials'), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'materials');
    throw error;
  }
}

export async function deleteMaterial(id: string) {
  try {
    await deleteDoc(doc(db, 'materials', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `materials/${id}`);
    throw error;
  }
}

// ==========================================
// SUBJECT GROUPS & CHAT
// ==========================================
export function subscribeGroups(callback: (groups: SubjectGroup[]) => void) {
  const colRef = collection(db, 'groups');
  return onSnapshot(colRef, (snapshot) => {
    const list: SubjectGroup[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as SubjectGroup));
    list.sort((a, b) => a.name.localeCompare(b.name));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'groups');
  });
}

export async function createGroup(name: string, code: string, description: string, user: UserProfile, category: 'official' | 'class' | 'subject' | 'community' = 'subject') {
  try {
    const docRef = await addDoc(collection(db, 'groups'), {
      name,
      code,
      description,
      category,
      createdBy: user.uid,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'groups');
    throw error;
  }
}

export function subscribeGroupMessages(groupId: string, callback: (messages: GroupMessage[]) => void) {
  const colRef = collection(db, 'groups', groupId, 'messages');
  return onSnapshot(colRef, (snapshot) => {
    const list: GroupMessage[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as GroupMessage));
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `groups/${groupId}/messages`);
  });
}

export async function sendGroupMessage(groupId: string, text: string, user: UserProfile) {
  try {
    const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'Student';
    await addDoc(collection(db, 'groups', groupId, 'messages'), {
      groupId,
      senderUid: user.uid,
      senderName: user.name,
      senderRole: primaryRole,
      text: text.trim(),
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `groups/${groupId}/messages`);
    throw error;
  }
}

export async function deleteGroupMessage(groupId: string, messageId: string) {
  try {
    await deleteDoc(doc(db, 'groups', groupId, 'messages', messageId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `groups/${groupId}/messages/${messageId}`);
    throw error;
  }
}

// ==========================================
// LOST & FOUND
// ==========================================
export function subscribeLostFound(callback: (items: LostFoundItem[]) => void) {
  const colRef = collection(db, 'lost_found');
  return onSnapshot(colRef, (snapshot) => {
    const list: LostFoundItem[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as LostFoundItem));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'lost_found');
  });
}

export async function createLostFound(data: Omit<LostFoundItem, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'lost_found'), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'lost_found');
    throw error;
  }
}

export async function updateLostFoundStatus(itemId: string, status: 'open' | 'claimed' | 'resolved') {
  try {
    await updateDoc(doc(db, 'lost_found', itemId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `lost_found/${itemId}`);
    throw error;
  }
}

export async function deleteLostFound(itemId: string) {
  try {
    await deleteDoc(doc(db, 'lost_found', itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `lost_found/${itemId}`);
    throw error;
  }
}

// ==========================================
// NOTIFICATIONS
// ==========================================
export function subscribeNotifications(uid: string, callback: (notifications: NotificationItem[]) => void) {
  const colRef = collection(db, 'notifications');
  const q = query(colRef, where('recipientUid', '==', uid));
  return onSnapshot(q, (snapshot) => {
    const list: NotificationItem[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as NotificationItem));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'notifications');
  });
}

export async function markNotificationRead(id: string) {
  try {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
    throw error;
  }
}

export async function createNotification(data: Omit<NotificationItem, 'id' | 'createdAt'>) {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...data,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'notifications');
  }
}

// ==========================================
// USERS & ROLES (OWNER ADMIN)
// ==========================================
export function subscribeAllUsers(callback: (users: UserProfile[]) => void) {
  const colRef = collection(db, 'users');
  return onSnapshot(colRef, (snapshot) => {
    const allUsers: UserProfile[] = snapshot.docs
      .map(docSnap => ({
        uid: docSnap.id,
        ...docSnap.data()
      } as UserProfile))
      // EXCLUDE permanent owner completely from standard user lists
      .filter(u => u.email?.toLowerCase() !== PERMANENT_OWNER_EMAIL.toLowerCase());

    allUsers.sort((a, b) => (a.name || a.username).localeCompare(b.name || b.username));
    callback(allUsers);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'users');
  });
}

export async function assignUserRoles(targetUid: string, roles: string[]) {
  try {
    await updateDoc(doc(db, 'users', targetUid), {
      roles
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${targetUid}`);
    throw error;
  }
}

export const subscribeUsers = subscribeAllUsers;
export const updateUserRoles = assignUserRoles;

export async function deleteUserDoc(targetUid: string) {
  try {
    await deleteDoc(doc(db, 'users', targetUid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${targetUid}`);
    throw error;
  }
}

// ==========================================
// BOOTSTRAP PAF-IAST STRUCTURE & DEFAULTS
// ==========================================
export async function bootstrapPAFDefaults(userUid: string) {
  try {
    // 1. Bootstrap Academic Departments if empty
    const deptSnap = await getDocs(collection(db, 'academic_departments'));
    if (deptSnap.empty) {
      const pafDepts: Omit<AcademicDepartment, 'id'>[] = [
        { name: 'Computer Science', code: 'CS', faculty: 'Faculty of Computing' },
        { name: 'Artificial Intelligence', code: 'AI', faculty: 'Faculty of Computing' },
        { name: 'Data Science', code: 'DS', faculty: 'Faculty of Computing' },
        { name: 'Software Engineering', code: 'SE', faculty: 'Faculty of Computing' },
        { name: 'Electrical Engineering', code: 'EE', faculty: 'Faculty of Engineering' },
        { name: 'Mechanical & Manufacturing', code: 'ME', faculty: 'Faculty of Engineering' },
        { name: 'Civil & Environmental', code: 'CE', faculty: 'Faculty of Engineering' },
        { name: 'Chemical Engineering', code: 'CHE', faculty: 'Faculty of Chemical & Materials' },
        { name: 'Biomedical Sciences', code: 'BMS', faculty: 'Faculty of Health Sciences' }
      ];
      for (const d of pafDepts) {
        await addDoc(collection(db, 'academic_departments'), {
          ...d,
          createdAt: new Date().toISOString()
        });
      }
    }

    // 2. Bootstrap Academic Programs if empty
    const progSnap = await getDocs(collection(db, 'academic_programs'));
    if (progSnap.empty) {
      const pafPrograms: Omit<AcademicProgram, 'id'>[] = [
        { name: 'BS Artificial Intelligence', code: 'BS-AI', departmentId: 'AI', departmentName: 'Artificial Intelligence', degreeType: 'BS', totalSemesters: 8 },
        { name: 'BS Data Science', code: 'BS-DS', departmentId: 'DS', departmentName: 'Data Science', degreeType: 'BS', totalSemesters: 8 },
        { name: 'BS Computer Science', code: 'BS-CS', departmentId: 'CS', departmentName: 'Computer Science', degreeType: 'BS', totalSemesters: 8 },
        { name: 'BS Software Engineering', code: 'BS-SE', departmentId: 'SE', departmentName: 'Software Engineering', degreeType: 'BS', totalSemesters: 8 },
        { name: 'BS Electrical Engineering', code: 'BS-EE', departmentId: 'EE', departmentName: 'Electrical Engineering', degreeType: 'BS', totalSemesters: 8 },
        { name: 'MS Data Science', code: 'MS-DS', departmentId: 'DS', departmentName: 'Data Science', degreeType: 'MS', totalSemesters: 4 },
        { name: 'MS Artificial Intelligence', code: 'MS-AI', departmentId: 'AI', departmentName: 'Artificial Intelligence', degreeType: 'MS', totalSemesters: 4 }
      ];
      for (const p of pafPrograms) {
        await addDoc(collection(db, 'academic_programs'), {
          ...p,
          createdAt: new Date().toISOString()
        });
      }
    }

    // 3. Bootstrap Subject Groups if empty
    const groupSnap = await getDocs(collection(db, 'groups'));
    if (groupSnap.empty) {
      const defaultGroups = [
        { 
          name: 'BS AI (2024) • Class Hub', 
          code: 'AI-2024-HUB', 
          description: 'Official class representative and academic group for BS Artificial Intelligence Batch 2024.',
          category: 'class' as const
        },
        { 
          name: 'Machine Learning & Neural Networks', 
          code: 'AI-301-SUBJ', 
          description: 'Course study group, problem sets, Kaggle discussions, and lecture follow-ups.',
          category: 'subject' as const
        },
        { 
          name: 'Data Science & Analytics Community', 
          code: 'DS-FORUM', 
          description: 'Cross-batch discussion on Big Data, Python libraries, research, and internships.',
          category: 'community' as const
        },
        { 
          name: 'PAF Campus Life & Clubs', 
          code: 'PAF-CAMPUS', 
          description: 'University societies, sports fixtures, tech fests, and cultural events.',
          category: 'official' as const
        }
      ];
      for (const g of defaultGroups) {
        const docRef = await addDoc(collection(db, 'groups'), {
          ...g,
          createdBy: userUid,
          createdAt: new Date().toISOString()
        });
        await addDoc(collection(db, 'groups', docRef.id, 'messages'), {
          groupId: docRef.id,
          senderUid: userUid,
          senderName: 'Connect PAF System',
          senderRole: 'Institution Admin',
          text: `Welcome to ${g.name}! Feel free to discuss academic resources and university schedules.`,
          createdAt: new Date().toISOString()
        });
      }
    }

    // 4. Bootstrap Marketplace if empty
    const marketSnap = await getDocs(collection(db, 'marketplace'));
    if (marketSnap.empty) {
      const sampleListings: Omit<MarketplaceListing, 'id' | 'createdAt'>[] = [
        {
          title: 'Casio fx-991EX ClassWiz Scientific Calculator',
          description: 'Original Casio fx-991EX. Barely used during 1st semester calculus and linear algebra. Solar + battery working perfectly.',
          price: 4200,
          category: 'Calculators',
          condition: 'Like New',
          listingType: 'for_sale',
          campus: 'Main Campus, Mang',
          sellerUid: userUid,
          sellerName: 'Ahmed Raza',
          sellerDepartment: 'Computer Science',
          sellerProgram: 'BS Computer Science',
          status: 'active',
          imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=60'
        },
        {
          title: 'Artificial Intelligence: A Modern Approach (4th Edition)',
          description: 'Russell & Norvig, hardcover edition. Essential textbook for AI-301 and introductory machine learning courses.',
          price: 2800,
          category: 'Books',
          condition: 'Good',
          listingType: 'for_sale',
          campus: 'Main Campus, Mang',
          sellerUid: userUid,
          sellerName: 'Zainab Bibi',
          sellerDepartment: 'Artificial Intelligence',
          sellerProgram: 'BS Artificial Intelligence',
          status: 'active',
          imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60'
        },
        {
          title: 'Arduino Mega 2560 R3 + Sensor Starter Kit',
          description: 'Complete kit with jumper wires, breadboard, ultrasonic sensor, LCD module, and stepper motor. Perfect for EE & Embedded projects.',
          price: 5500,
          category: 'Electronics',
          condition: 'Like New',
          listingType: 'for_sale',
          campus: 'Main Campus, Mang',
          sellerUid: userUid,
          sellerName: 'Hamza Farooq',
          sellerDepartment: 'Electrical Engineering',
          sellerProgram: 'BS Electrical Engineering',
          status: 'active',
          imageUrl: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500&auto=format&fit=crop&q=60'
        },
        {
          title: 'Study Desk Lamp with USB Charging Port',
          description: 'Compact LED lamp with 3 brightness modes. Great for hostel night study sessions. Selling because graduating.',
          price: 1500,
          category: 'Hostel items',
          condition: 'Good',
          listingType: 'for_sale',
          campus: 'Hostel Block B',
          sellerUid: userUid,
          sellerName: 'Bilal Khan',
          sellerDepartment: 'Data Science',
          sellerProgram: 'BS Data Science',
          status: 'active',
          imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60'
        }
      ];

      for (const item of sampleListings) {
        await addDoc(collection(db, 'marketplace'), {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    // 5. Bootstrap sample notices if empty
    const noticeSnap = await getDocs(collection(db, 'notices'));
    if (noticeSnap.empty) {
      const sampleNotices: Omit<Notice, 'id' | 'createdAt'>[] = [
        {
          title: 'Fall 2026 Academic Term Registration & Fee Clearance',
          description: 'All undergraduate and graduate students must complete subject enrolment and clearance before September 25, 2026. Late fee charges will apply thereafter.',
          category: 'Academic',
          priority: 'High',
          audienceScope: 'all',
          authorName: 'Academic Registrar Office',
          authorUid: userUid,
          authorRole: 'Institution Admin',
          isImportant: true,
          status: 'published'
        },
        {
          title: 'AI & Data Science Hackathon 2026 Registrations Open',
          description: 'Join the premier annual PAF-IAST Computing Challenge. Form teams of 3 to 4 students. Tracks include Computer Vision, Generative AI, and Autonomous Systems.',
          category: 'Events',
          priority: 'Medium',
          audienceScope: 'department',
          targetDepartment: 'Artificial Intelligence',
          authorName: 'Dr. Tariq Mahmood',
          authorUid: userUid,
          authorRole: 'Teacher',
          isImportant: false,
          status: 'published'
        },
        {
          title: 'Section A - Machine Learning Lab Shift Notice',
          description: 'Due to scheduled GPU server maintenance, the AI-301L Lab for BS AI Section A on Wednesday will be conducted in Deep Learning Lab 2 from 11:30 AM.',
          category: 'Academic',
          priority: 'High',
          audienceScope: 'section',
          targetProgram: 'BS Artificial Intelligence',
          targetSemester: 'Semester 3',
          targetSection: 'Section A',
          authorName: 'Engr. Bilal Hashmi',
          authorUid: userUid,
          authorRole: 'Teacher',
          isImportant: true,
          status: 'published'
        }
      ];

      for (const n of sampleNotices) {
        await addDoc(collection(db, 'notices'), {
          ...n,
          createdAt: new Date().toISOString()
        });
      }
    }

    // 6. Bootstrap sample timetable if empty
    const ttSnap = await getDocs(collection(db, 'timetable'));
    if (ttSnap.empty) {
      const sampleClasses: Omit<TimetableClass, 'id'>[] = [
        {
          subject: 'Machine Learning',
          subjectCode: 'AI-301',
          day: 'Monday',
          startTime: '08:30',
          endTime: '10:00',
          instructor: 'Dr. Tariq Mahmood',
          room: 'Lab 4 (AI Center)',
          programName: 'BS Artificial Intelligence',
          programId: 'prog-ai',
          batch: '2024',
          semester: 'Semester 3',
          section: 'Section A',
          academicTerm: 'Fall 2026'
        },
        {
          subject: 'Data Structures & Algorithms',
          subjectCode: 'CS-201',
          day: 'Monday',
          startTime: '10:15',
          endTime: '11:45',
          instructor: 'Engr. Sarah Khan',
          room: 'Hall B-201',
          programName: 'BS Artificial Intelligence',
          programId: 'prog-ai',
          batch: '2024',
          semester: 'Semester 3',
          section: 'Section A',
          academicTerm: 'Fall 2026'
        },
        {
          subject: 'Linear Algebra & Applications',
          subjectCode: 'MT-202',
          day: 'Tuesday',
          startTime: '09:00',
          endTime: '10:30',
          instructor: 'Dr. Usman Farooq',
          room: 'Lecture Room 102',
          programName: 'BS Artificial Intelligence',
          programId: 'prog-ai',
          batch: '2024',
          semester: 'Semester 3',
          section: 'Section A',
          academicTerm: 'Fall 2026'
        },
        {
          subject: 'Artificial Intelligence Lab',
          subjectCode: 'AI-301L',
          day: 'Wednesday',
          startTime: '11:30',
          endTime: '14:00',
          instructor: 'Engr. Bilal Hashmi',
          room: 'Deep Learning Lab',
          programName: 'BS Artificial Intelligence',
          programId: 'prog-ai',
          batch: '2024',
          semester: 'Semester 3',
          section: 'Section A',
          academicTerm: 'Fall 2026'
        },
        {
          subject: 'Probability & Statistics',
          subjectCode: 'MT-301',
          day: 'Thursday',
          startTime: '08:30',
          endTime: '10:00',
          instructor: 'Dr. Ayesha Malik',
          room: 'Hall B-201',
          programName: 'BS Artificial Intelligence',
          programId: 'prog-ai',
          batch: '2024',
          semester: 'Semester 3',
          section: 'Section A',
          academicTerm: 'Fall 2026'
        },
        {
          subject: 'Database Systems',
          subjectCode: 'CS-302',
          day: 'Friday',
          startTime: '09:00',
          endTime: '10:30',
          instructor: 'Dr. Hamza Ali',
          room: 'Lecture Room 204',
          programName: 'BS Artificial Intelligence',
          programId: 'prog-ai',
          batch: '2024',
          semester: 'Semester 3',
          section: 'Section A',
          academicTerm: 'Fall 2026'
        }
      ];

      for (const c of sampleClasses) {
        await addDoc(collection(db, 'timetable'), {
          ...c,
          updatedAt: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.warn("PAF Defaults Bootstrap note:", err);
  }
}

export const bootstrapCampusDefaults = bootstrapPAFDefaults;
