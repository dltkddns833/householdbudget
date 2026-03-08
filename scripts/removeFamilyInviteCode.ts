/**
 * #8/#9 마이그레이션 스크립트
 * 기존 families 문서에서 inviteCode 필드를 제거한다.
 *
 * 실행: ts-node -P scripts/tsconfig.json scripts/removeFamilyInviteCode.ts
 */

import * as admin from 'firebase-admin';

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();

async function removeFamilyInviteCode() {
  const snapshot = await db.collection('families').get();

  if (snapshot.empty) {
    console.log('families 컬렉션이 비어있습니다.');
    return;
  }

  const batch = db.batch();
  let count = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if ('inviteCode' in data) {
      batch.update(doc.ref, { inviteCode: admin.firestore.FieldValue.delete() });
      console.log(`[수정 예정] families/${doc.id} — inviteCode 필드 제거`);
      count++;
    }
  });

  if (count === 0) {
    console.log('inviteCode 필드가 있는 문서가 없습니다. 이미 마이그레이션 완료.');
    return;
  }

  await batch.commit();
  console.log(`\n완료: ${count}개 문서에서 inviteCode 필드 제거됨`);
}

removeFamilyInviteCode().catch(console.error);
