import firestore from '@react-native-firebase/firestore';
import { AssetGoal } from '../../../shared/types';

const goalsCol = (familyId: string) =>
  firestore().collection('families').doc(familyId).collection('goals');

const toAssetGoal = (doc: any): AssetGoal => ({
  id: doc.id,
  title: doc.data().title,
  targetAmount: doc.data().targetAmount,
  createdAt: doc.data().createdAt?.toDate() ?? new Date(),
  createdBy: doc.data().createdBy,
  isActive: doc.data().isActive,
});

const getActiveGoal = async (familyId: string): Promise<AssetGoal | null> => {
  const snap = await goalsCol(familyId)
    .where('isActive', '==', true)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return toAssetGoal(snap.docs[0]);
};

const createGoal = async (
  familyId: string,
  data: { title: string; targetAmount: number },
  uid: string,
): Promise<string> => {
  const col = goalsCol(familyId);

  // 기존 활성 목표 비활성화 + 새 목표 생성을 배치로 처리
  const batch = firestore().batch();

  const existingSnap = await col.where('isActive', '==', true).get();
  existingSnap.docs.forEach(doc => {
    batch.update(doc.ref, { isActive: false });
  });

  const newRef = col.doc();
  batch.set(newRef, {
    title: data.title,
    targetAmount: data.targetAmount,
    createdAt: firestore.FieldValue.serverTimestamp(),
    createdBy: uid,
    isActive: true,
  });

  await batch.commit();
  return newRef.id;
};

const updateGoal = async (
  familyId: string,
  id: string,
  data: { title?: string; targetAmount?: number },
): Promise<void> => {
  await goalsCol(familyId).doc(id).update(data);
};

const deleteGoal = async (familyId: string, id: string): Promise<void> => {
  await goalsCol(familyId).doc(id).delete();
};

export const goalService = { getActiveGoal, createGoal, updateGoal, deleteGoal };
