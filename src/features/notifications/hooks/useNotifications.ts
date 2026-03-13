import { useEffect } from 'react';
import { Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useAuthStore } from '../../../store/authStore';
import { notificationService } from '../services/notificationService';

type NavigationRef = {
  navigate: (...args: any[]) => void;
} | null;

let _navigationRef: NavigationRef = null;

export const setNavigationRef = (ref: NavigationRef) => {
  _navigationRef = ref;
};

const handleNotificationNavigation = (data?: Record<string, string>) => {
  if (!_navigationRef || !data?.type) return;

  switch (data.type) {
    // no-op: budget/recurring notification types removed
  }
};

export const useNotifications = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    // FCM 토큰 등록
    const registerToken = async () => {
      const token = await notificationService.requestPermissionAndGetToken();
      if (token) {
        await notificationService.saveTokenToFirestore(user.uid, token);
      }
    };
    registerToken();

    // 토큰 갱신 리스너
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async token => {
      await notificationService.saveTokenToFirestore(user.uid, token);
    });

    // 포그라운드 알림 리스너
    const unsubscribeMessage = messaging().onMessage(async remoteMessage => {
      const title = remoteMessage.notification?.title ?? '알림';
      const body = remoteMessage.notification?.body ?? '';
      Alert.alert(title, body, [
        { text: '확인' },
        {
          text: '이동',
          onPress: () =>
            handleNotificationNavigation(
              remoteMessage.data as Record<string, string>,
            ),
        },
      ]);
    });

    // 백그라운드에서 알림 탭 시 딥링크
    const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(
      remoteMessage => {
        handleNotificationNavigation(
          remoteMessage.data as Record<string, string>,
        );
      },
    );

    // 앱 완전 종료 후 알림 탭 시
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          handleNotificationNavigation(
            remoteMessage.data as Record<string, string>,
          );
        }
      });

    return () => {
      unsubscribeTokenRefresh();
      unsubscribeMessage();
      unsubscribeOpenedApp();
    };
  }, [user]);
};
