import storage from '@react-native-firebase/storage';

const receiptRef = (familyId: string, txId: string) =>
  storage().ref(`receipts/${familyId}/${txId}.jpg`);

export const storageService = {
  async uploadReceipt(familyId: string, txId: string, localUri: string): Promise<string> {
    const ref = receiptRef(familyId, txId);
    await ref.putFile(localUri);
    return ref.getDownloadURL();
  },

  async deleteReceipt(familyId: string, txId: string): Promise<void> {
    try {
      await receiptRef(familyId, txId).delete();
    } catch {
      // 파일이 없는 경우 무시
    }
  },
};
