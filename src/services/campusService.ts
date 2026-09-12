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
  orderBy, 
  getDocs,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, PERMANENT_OWNER_EMAIL } from '../firebase';
import { 
  Notice, 
  TimetableClass, 
  Material, 
  SubjectGroup, 
  GroupMessage, 
  LostFoundItem, 
  NotificationItem, 
  UserProfile 
} from '../types';

// ========================
// NOTICES / ANNOUNCEMENTS
// ========================
export function subscribeNotices(callback: (notices: Notice[]) => void) {
  const colRef = collection(db, 'notices');
  return onSnapshot(colRef, (snapshot) => {
    const list: Notice[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Notice));
    // Sort client-side by date descending
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
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

// ========================
// TIMETABLE
// ========================
export function subscribeTimetable(callback: (classes: TimetableClass[]) => void) {
  const colRef = collection(db, 'timetable');
  return onSnapshot(colRef, (snapshot) => {
    const list: TimetableClass[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as TimetableClass));
    
    // Sort by startTime
    list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'timetable');
  });
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

// ========================
// MATERIALS
// ========================
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

// ========================
// SUBJECT GROUPS & CHAT
// ========================
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

export async function createGroup(name: string, code: string, description: string, user: UserProfile) {
  try {
    const docRef = await addDoc(collection(db, 'groups'), {
      name,
      code,
      description,
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
    // Sort in chronological order (oldest first for chat flow)
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

// ========================
// LOST & FOUND
// ========================
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

// ========================
// NOTIFICATIONS
// ========================
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

// ========================
// USERS & ROLES (OWNER ADMIN)
// ========================
// The owner must be EXCLUDED from all user database tables, role assignment, and user search!
export function subscribeAllUsers(callback: (users: UserProfile[]) => void) {
  const colRef = collection(db, 'users');
  return onSnapshot(colRef, (snapshot) => {
    const allUsers: UserProfile[] = snapshot.docs
      .map(docSnap => ({
        uid: docSnap.id,
        ...docSnap.data()
      } as UserProfile))
      // EXCLUDE permanent owner completely
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

// Bootstrap initial subjects/groups if none exist so users immediately have interactive channels
export async function bootstrapCampusDefaults(userUid: string) {
  try {
    const groupSnap = await getDocs(collection(db, 'groups'));
    if (groupSnap.empty) {
      const defaultGroups = [
        { name: 'Computer Science Hub', code: 'CS-ALL', description: 'General discussion for CS students, projects, coding help & tech talks.' },
        { name: 'Engineering & Mathematics', code: 'MATH-201', description: 'Calculus, Linear Algebra, and Engineering analysis study group.' },
        { name: 'Campus Life & Events', code: 'CAMPUS-GEN', description: 'University club activities, festivals, sports, and cultural meetups.' }
      ];
      for (const g of defaultGroups) {
        const docRef = await addDoc(collection(db, 'groups'), {
          ...g,
          createdBy: userUid,
          createdAt: new Date().toISOString()
        });
        // Add welcome message
        await addDoc(collection(db, 'groups', docRef.id, 'messages'), {
          groupId: docRef.id,
          senderUid: userUid,
          senderName: 'Connect Campus Bot',
          senderRole: 'Institution Admin',
          text: `Welcome to ${g.name}! Feel free to discuss academic topics, share resources, and connect in real time.`,
          createdAt: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.warn("Bootstrap defaults check completed or restricted:", err);
  }
}
