import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();
const fcm = admin.messaging();

/**
 * monthlySummaries 문서 갱신 시 예산 80% 초과 여부 확인 후 FCM 발송
 */
export const budgetAlertTrigger = functions.firestore
  .document('families/{familyId}/monthlySummaries/{yearMonth}')
  .onUpdate(async (change, context) => {
    const { familyId, yearMonth } = context.params;
    const after = change.after.data();
    const categoryBreakdown: Record<string, number> = after.categoryBreakdown ?? {};

    // 예산 문서 조회
    const budgetDoc = await db
      .collection('families')
      .doc(familyId)
      .collection('budgets')
      .doc(yearMonth)
      .get();
    if (!budgetDoc.exists) return;
    const budgetCategories: Record<string, number> = budgetDoc.data()?.categories ?? {};

    // 발송 플래그 문서
    const alertFlagRef = db
      .collection('families')
      .doc(familyId)
      .collection('budgetAlertSent')
      .doc(yearMonth);
    const alertFlagDoc = await alertFlagRef.get();
    const alertSent: Record<string, string> = alertFlagDoc.exists
      ? (alertFlagDoc.data() as Record<string, string>)
      : {};

    // 가족 멤버 조회
    const familyDoc = await db.collection('families').doc(familyId).get();
    const members: string[] = familyDoc.data()?.members ?? [];

    const messages: { token: string; title: string; body: string }[] = [];
    const newFlags: Record<string, string> = {};

    for (const [cat, spent] of Object.entries(categoryBreakdown)) {
      const budgeted = budgetCategories[cat];
      if (!budgeted || budgeted === 0) continue;

      const rate = spent / budgeted;
      const threshold = rate >= 1 ? '100' : rate >= 0.8 ? '80' : null;
      if (!threshold) continue;
      if (alertSent[cat] === threshold) continue; // 이미 발송됨

      const remaining = Math.max(budgeted - spent, 0);
      const title = '예산 초과 알림';
      const body =
        threshold === '100'
          ? `${cat} 예산을 모두 사용했어요`
          : `${cat} 예산의 ${Math.round(rate * 100)}%를 사용했어요 (남은 예산: ${remaining.toLocaleString()}원)`;

      newFlags[cat] = threshold;

      // 멤버별 FCM 토큰 조회 + budgetAlert 설정 확인
      for (const uid of members) {
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) continue;
        const userData = userDoc.data()!;
        if (userData.notificationSettings?.budgetAlert === false) continue;
        const token: string | undefined = userData.fcmToken;
        if (!token) continue;
        messages.push({ token, title, body });
      }
    }

    if (messages.length > 0) {
      await Promise.allSettled(
        messages.map(m =>
          fcm.send({
            token: m.token,
            notification: { title: m.title, body: m.body },
            data: { type: 'budget' },
          }),
        ),
      );
    }

    if (Object.keys(newFlags).length > 0) {
      await alertFlagRef.set(newFlags, { merge: true });
    }
  });
