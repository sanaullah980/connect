import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  googleProvider, 
  PERMANENT_OWNER_EMAIL, 
  handleFirestoreError, 
  OperationType,
  testConnection 
} from '../firebase';
import { UserProfile, CampusRole } from '../types';

export { PERMANENT_OWNER_EMAIL };

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isOwner: boolean;
  hasRole: (role: CampusRole) => boolean;
  canPublishNotices: boolean;
  canManageTimetable: boolean;
  canModerate: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithUsername: (username: string, password: string) => Promise<void>;
  registerUser: (data: {
    name: string;
    username: string;
    password: string;
    email?: string;
    department?: string;
    program?: string;
    semester?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateAcademicProfile: (data: Partial<UserProfile>) => Promise<void>;
  needsUsernameModal: boolean;
  setNeedsUsernameModal: (val: boolean) => void;
  submitGoogleUsername: (username: string, department?: string, program?: string, semester?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsUsernameModal, setNeedsUsernameModal] = useState(false);

  // Check if current user is the permanent owner
  const isOwner = Boolean(
    currentUser && 
    currentUser.email?.toLowerCase() === PERMANENT_OWNER_EMAIL.toLowerCase() &&
    currentUser.providerData.some(p => p.providerId === 'google.com')
  );

  useEffect(() => {
    testConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Set up real-time listener for user profile so role changes take effect immediately
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setUserProfile(data);
            setNeedsUsernameModal(false);
          } else {
            // Document doesn't exist yet (e.g. fresh Google Sign-in)
            // If it's the owner, auto-create profile with owner designation
            if (user.email?.toLowerCase() === PERMANENT_OWNER_EMAIL.toLowerCase()) {
              const ownerProfile: UserProfile = {
                uid: user.uid,
                name: user.displayName || 'Permanent Owner',
                username: 'sanaullah',
                email: user.email,
                loginProvider: 'google',
                roles: ['Institution Admin', 'Announcement Publisher', 'Timetable Manager', 'Moderator'],
                department: 'Administration',
                program: 'Campus Governance',
                semester: 'Faculty',
                createdAt: new Date().toISOString()
              };
              setDoc(userDocRef, ownerProfile)
                .then(() => {
                  setDoc(doc(db, 'usernames', 'sanaullah'), {
                    username: 'sanaullah',
                    uid: user.uid,
                    createdAt: new Date().toISOString()
                  }).catch(console.error);
                })
                .catch((err) => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`));
            } else {
              setNeedsUsernameModal(true);
            }
          }
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
          setLoading(false);
        });

        return () => {
          unsubscribeProfile();
        };
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const hasRole = (role: CampusRole): boolean => {
    if (isOwner) return true;
    if (!userProfile || !userProfile.roles) return false;
    return userProfile.roles.includes(role);
  };

  const canPublishNotices = isOwner || hasRole('Institution Admin') || hasRole('Announcement Publisher') || hasRole('Teacher') || hasRole('CR');
  const canManageTimetable = isOwner || hasRole('Institution Admin') || hasRole('Timetable Manager');
  const canModerate = isOwner || hasRole('Institution Admin') || hasRole('Moderator');

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        throw err;
      }
    }
  };

  const submitGoogleUsername = async (
    username: string, 
    department?: string, 
    program?: string, 
    semester?: string
  ) => {
    if (!currentUser) throw new Error("Not signed in");
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error("Username must be at least 3 characters alphanumeric/underscore");
    }

    // Check if username taken
    const uDoc = await getDoc(doc(db, 'usernames', cleanUsername));
    if (uDoc.exists()) {
      throw new Error("This username is already taken. Please choose another.");
    }

    const newProfile: UserProfile = {
      uid: currentUser.uid,
      name: currentUser.displayName || cleanUsername,
      username: cleanUsername,
      email: currentUser.email || '',
      loginProvider: 'google',
      roles: ['Student'],
      department: department || 'General Academic',
      program: program || 'Undergraduate',
      semester: semester || '1st Semester',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'usernames', cleanUsername), {
      username: cleanUsername,
      uid: currentUser.uid,
      createdAt: new Date().toISOString()
    });

    await setDoc(doc(db, 'users', currentUser.uid), newProfile);
    setNeedsUsernameModal(false);
  };

  const loginWithUsername = async (username: string, password: string) => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) throw new Error("Please enter a username");
    
    // We map username to an internal auth email
    const internalEmail = `${cleanUsername}@campus.internal`;
    try {
      await signInWithEmailAndPassword(auth, internalEmail, password);
    } catch (err: any) {
      // Also try with real email if entered
      if (username.includes('@')) {
        await signInWithEmailAndPassword(auth, username, password);
      } else {
        throw new Error(err.message || "Invalid username or password");
      }
    }
  };

  const registerUser = async (data: {
    name: string;
    username: string;
    password: string;
    email?: string;
    department?: string;
    program?: string;
    semester?: string;
  }) => {
    const cleanUsername = data.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error("Username must be at least 3 characters alphanumeric/underscore");
    }

    // Check username availability
    const uDoc = await getDoc(doc(db, 'usernames', cleanUsername));
    if (uDoc.exists()) {
      throw new Error("Username is already taken. Please select a unique username.");
    }

    const internalEmail = `${cleanUsername}@campus.internal`;
    const userCredential = await createUserWithEmailAndPassword(auth, internalEmail, data.password);
    const user = userCredential.user;

    const newProfile: UserProfile = {
      uid: user.uid,
      name: data.name.trim(),
      username: cleanUsername,
      email: data.email?.trim() || internalEmail,
      loginProvider: 'password',
      roles: ['Student'],
      department: data.department?.trim() || 'Computer Science',
      program: data.program?.trim() || 'BS Computer Science',
      semester: data.semester?.trim() || '1st Semester',
      createdAt: new Date().toISOString()
    };

    // Store unique username mapping and user profile
    await setDoc(doc(db, 'usernames', cleanUsername), {
      username: cleanUsername,
      uid: user.uid,
      createdAt: new Date().toISOString()
    });

    await setDoc(doc(db, 'users', user.uid), newProfile);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateAcademicProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error("Not signed in");
    // Ensure critical fields cannot be modified through academic profile
    const safeData = { ...data };
    delete safeData.uid;
    delete safeData.roles;
    delete safeData.loginProvider;
    delete safeData.username;
    delete safeData.email;

    await setDoc(doc(db, 'users', currentUser.uid), safeData, { merge: true });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isOwner,
        hasRole,
        canPublishNotices,
        canManageTimetable,
        canModerate,
        loginWithGoogle,
        loginWithUsername,
        registerUser,
        logout,
        updateAcademicProfile,
        needsUsernameModal,
        setNeedsUsernameModal,
        submitGoogleUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
