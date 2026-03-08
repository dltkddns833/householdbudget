import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();
const fcm = admin.messaging();

/**
 * 매일 오전 9시 (KST) — 오늘 납부일인 고정비 알림 발송
 */
export const recurringAlertScheduler = functions.pubsub
  .schedule('0 0 * * *') // UTC 00:00 = KST 09:00
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const today = new Date();
    const dayOfMonth = today.getDate();

    const familiesSnap = await db.collection('families').get();

    for (const familyDoc of familiesSnap.docs) {
      const familyId = familyDoc.id;
      const members: string[] = familyDoc.data().members ?? [];

      // 오늘 납부일인 활성 고정비 조회
      const recurringSnap = await db
        .collection('families')
        .doc(familyId)
        .collection('recurringTransactions')
        .where('isActive', '==', true)
        .where('dayOfMonth', '==', dayOfMonth)
        .get();

      if (recurringSnap.empty) continue;

      for (const uid of members) {
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) continue;
        const userData = userDoc.data()!;
        if (userData.notificationSettings?.recurringAlert === false) continue;
        const token: string | undefined = userData.fcmToken;
        if (!token) continue;

        for (const recurDoc of recurringSnap.docs) {
          const r = recurDoc.data();
          const amount: number = r.amount ?? 0;
          await fcm
            .send({
              token,
              notification: {
                title: '고정비 납부일 알림',
                body: `${r.title} 납부일이에요 (${amount.toLocaleString()}원)`,
              },
              data: { type: 'recurring' },
            })
            .catch(() => {}); // 토큰 만료 등 무시
        }
      }
    }
  });
