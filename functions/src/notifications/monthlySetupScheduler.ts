import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();
const fcm = admin.messaging();

/**
 * 매월 1일 오전 8시 (KST) — 예산 미설정 가족에게 안내 알림 발송
 */
export const monthlySetupScheduler = functions.pubsub
  .schedule('0 8 1 * *') // 매월 1일 오전 8시 KST
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const now = new Date();
    // 현재 월 yearMonth 계산
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}-${month}`;

    const familiesSnap = await db.collection('families').get();

    for (const familyDoc of familiesSnap.docs) {
      const familyId = familyDoc.id;
      const members: string[] = familyDoc.data().members ?? [];

      // 해당 월 budgets 문서 존재 여부 확인
      const budgetDoc = await db
        .collection('families')
        .doc(familyId)
        .collection('budgets')
        .doc(yearMonth)
        .get();

      if (budgetDoc.exists) continue; // 이미 설정됨

      for (const uid of members) {
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) continue;
        const userData = userDoc.data()!;
        if (userData.notificationSettings?.monthlySetup === false) continue;
        const token: string | undefined = userData.fcmToken;
        if (!token) continue;

        await fcm
          .send({
            token,
            notification: {
              title: '이번 달 예산을 설정해보세요',
              body: `${month}월 예산을 설정하고 지출을 계획해보세요!`,
            },
            data: { type: 'monthly_setup' },
          })
          .catch(() => {});
      }
    }
  });
