import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { v4 as uuidv4 } from 'uuid';
import { User, Family, InviteCode } from '../../../shared/types';

const INVITE_CODE_EXPIRY_DAYS = 7;

function generateInviteCode(): string {
  return uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
}

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
    const familyRef = firestore().collection('families').doc();
    const family: Omit<Family, 'id'> = {
      members: [uid],
      memberNames: { [uid]: userName },
    };

    const batch = firestore().batch();
    batch.set(familyRef, family);
    batch.set(firestore().collection('users').doc(uid), { familyId: familyRef.id }, { merge: true });
    await batch.commit();

    // 초대 코드 발급
    await this.createInviteCode(familyRef.id, uid);

    return { id: familyRef.id, ...family };
  },

  async createInviteCode(familyId: string, uid: string): Promise<InviteCode> {
    const code = generateInviteCode();
    const now = firestore.Timestamp.now();
    const expiresAt = firestore.Timestamp.fromDate(
      new Date(now.toMillis() + INVITE_CODE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    );

    const inviteCodeData: Omit<InviteCode, 'code'> = {
      familyId,
      createdAt: now,
      expiresAt,
      createdBy: uid,
    };

    await firestore().collection('inviteCodes').doc(code).set(inviteCodeData);
    return { code, ...inviteCodeData };
  },

  async getActiveInviteCode(familyId: string): Promise<InviteCode | null> {
    const snapshot = await firestore()
      .collection('inviteCodes')
      .where('familyId', '==', familyId)
      .get();

    const now = Date.now();
    const valid = snapshot.docs
      .map(doc => ({ code: doc.id, ...doc.data() } as InviteCode))
      .filter(c => c.expiresAt.toMillis() > now)
      .sort((a, b) => b.expiresAt.toMillis() - a.expiresAt.toMillis());

    return valid[0] ?? null;
  },

  async regenerateInviteCode(familyId: string, uid: string, oldCode?: string): Promise<InviteCode> {
    if (oldCode) {
      await firestore().collection('inviteCodes').doc(oldCode).delete();
    }
    return this.createInviteCode(familyId, uid);
  },

  async leaveFamily(uid: string, familyId: string): Promise<void> {
    const familyRef = firestore().collection('families').doc(familyId);
    const familyDoc = await familyRef.get();
    if (!familyDoc.exists) throw new Error('가족 정보를 찾을 수 없습니다.');

    const members: string[] = familyDoc.data()?.members || [];
    const isLastMember = members.length === 1;

    if (isLastMember) {
      // 마지막 멤버 → 가족 문서 삭제 + 활성 초대 코드 삭제
      const inviteSnapshot = await firestore()
        .collection('inviteCodes')
        .where('familyId', '==', familyId)
        .get();

      const batch = firestore().batch();
      inviteSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      batch.delete(familyRef);
      batch.update(firestore().collection('users').doc(uid), { familyId: null });
      await batch.commit();
    } else {
      await firestore().runTransaction(async (tx) => {
        tx.update(familyRef, {
          members: firestore.FieldValue.arrayRemove(uid),
          [`memberNames.${uid}`]: firestore.FieldValue.delete(),
        });
        tx.update(firestore().collection('users').doc(uid), { familyId: null });
      });
    }
  },

  async deleteAccount(uid: string, familyId: string | null): Promise<void> {
    if (familyId) {
      await this.leaveFamily(uid, familyId);
    }
    await firestore().collection('users').doc(uid).delete();
    await auth().currentUser!.delete();
  },

  async updateSavingRateGoal(familyId: string, goal: number): Promise<void> {
    await firestore().collection('families').doc(familyId).update({ savingRateGoal: goal });
  },

  async joinFamily(uid: string, userName: string, inviteCode: string): Promise<Family> {
    const userDoc = await firestore().collection('users').doc(uid).get();
    if (userDoc.exists && userDoc.data()?.familyId) {
      throw new Error('이미 가족에 속해있습니다. 기존 가족에서 탈퇴 후 다시 시도해주세요.');
    }

    const inviteDoc = await firestore().collection('inviteCodes').doc(inviteCode).get();
    if (!inviteDoc.exists) throw new Error('초대 코드를 찾을 수 없습니다.');

    const inviteData = inviteDoc.data() as Omit<InviteCode, 'code'>;
    if (inviteData.expiresAt.toMillis() < Date.now()) {
      throw new Error('초대 코드가 만료되었습니다. 새 코드를 발급받으세요.');
    }

    const familyRef = firestore().collection('families').doc(inviteData.familyId);

    // 트랜잭션: 가족 문서는 사전에 읽지 않음 (멤버 아니라 read 권한 없음)
    // Rules의 update 조건(신규 멤버 self-add)으로 허용됨
    await firestore().runTransaction(async (tx) => {
      tx.update(familyRef, {
        members: firestore.FieldValue.arrayUnion(uid),
        [`memberNames.${uid}`]: userName,
      });
      tx.set(firestore().collection('users').doc(uid), { familyId: inviteData.familyId }, { merge: true });
    });

    // 트랜잭션 완료 후 조회 (이제 멤버라 read 가능)
    const familyDoc = await familyRef.get();
    return { id: inviteData.familyId, ...familyDoc.data() } as Family;
  },
};
