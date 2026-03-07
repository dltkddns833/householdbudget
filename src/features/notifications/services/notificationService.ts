import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import { NotificationSettings } from '../../../shared/types';

const DEFAULT_SETTINGS: NotificationSettings = {
  budgetAlert: true,
  recurringAlert: true,
  monthlySetup: true,
};

const usersCol = () => firestore().collection('users');

const requestPermissionAndGetToken = async (): Promise<string | null> => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) return null;
  return await messaging().getToken();
};

const saveTokenToFirestore = async (uid: string, token: string): Promise<void> => {
  await usersCol().doc(uid).set({ fcmToken: token }, { merge: true });
};

const getNotificationSettings = async (uid: string): Promise<NotificationSettings> => {
  const doc = await usersCol().doc(uid).get();
  if (!doc.exists) return DEFAULT_SETTINGS;
  const data = doc.data();
  return (data?.notificationSettings as NotificationSettings) ?? DEFAULT_SETTINGS;
};

const updateNotificationSettings = async (
  uid: string,
  settings: Partial<NotificationSettings>,
): Promise<void> => {
  await usersCol()
    .doc(uid)
    .set({ notificationSettings: settings }, { merge: true });
};

export const notificationService = {
  requestPermissionAndGetToken,
  saveTokenToFirestore,
  getNotificationSettings,
  updateNotificationSettings,
};
