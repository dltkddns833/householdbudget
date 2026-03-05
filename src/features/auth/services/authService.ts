import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { User, Family } from '../../../shared/types';

export const authService = {
  async signInWithGoogle(): Promise<User> {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const signInResult = await GoogleSignin.signIn();
    const idToken = signInResult.data?.idToken;
    if (!idToken) throw new Error('Google Sign-In failed: no idToken');

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);
    const { uid, email, displayName, photoURL } = userCredential.user;

    // Check if user doc exists
    const userDoc = await firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      const newUser: Omit<User, 'uid'> = {
        email: email || '',
        displayName: displayName || '',
        familyId: null,
        photoURL: photoURL || null,
      };
      await firestore().collection('users').doc(uid).set(newUser);
      return { uid, ...newUser };
    }

    await firestore().collection('users').doc(uid).update({
      displayName: displayName || '',
      photoURL: photoURL || null,
    });
    return { uid, ...userDoc.data(), displayName: displayName || '', photoURL: photoURL || null } as User;
  },

  async signOut(): Promise<void> {
    await auth().signOut();
    await GoogleSignin.signOut();
  },

  async getUser(uid: string): Promise<User | null> {
    const doc = await firestore().collection('users').doc(uid).get();
    if (!doc.exists) return null;
    return { uid, ...doc.data() } as User;
  },

  async getFamily(familyId: string): Promise<Family | null> {
    const doc = await firestore().collection('families').doc(familyId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Family;
  },

  async createFamily(uid: string, userName: string): Promise<Family> {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const familyRef = firestore().collection('families').doc();
    const family: Omit<Family, 'id'> = {
      members: [uid],
      memberNames: { [uid]: userName },
      inviteCode,
    };

    const batch = firestore().batch();
    batch.set(familyRef, family);
    batch.set(firestore().collection('users').doc(uid), { familyId: familyRef.id }, { merge: true });
    await batch.commit();

    return { id: familyRef.id, ...family };
  },

  async joinFamily(uid: string, userName: string, inviteCode: string): Promise<Family> {
    const snapshot = await firestore()
      .collection('families')
      .where('inviteCode', '==', inviteCode)
      .limit(1)
      .get();

    if (snapshot.empty) throw new Error('초대 코드를 찾을 수 없습니다.');

    const familyDoc = snapshot.docs[0];
    const familyData = familyDoc.data();

    await firestore().runTransaction(async (tx) => {
      tx.update(familyDoc.ref, {
        members: firestore.FieldValue.arrayUnion(uid),
        [`memberNames.${uid}`]: userName,
      });
      tx.update(firestore().collection('users').doc(uid), { familyId: familyDoc.id });
    });

    return {
      id: familyDoc.id,
      members: [...familyData.members, uid],
      memberNames: { ...familyData.memberNames, [uid]: userName },
      inviteCode: familyData.inviteCode,
    };
  },
};
