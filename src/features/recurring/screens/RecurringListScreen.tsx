import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { EmptyState, LoadingSpinner } from '../../../shared/components';
import { getCategoryByKey } from '../../../shared/constants/categories';
import { formatCurrency } from '../../../shared/utils/currency';
import { RecurringTransaction } from '../../../shared/types';
import { useUIStore } from '../../../store/uiStore';
import {
  useRecurringList,
  usePendingRecurring,
  useDeleteRecurring,
  useUpdateRecurring,
  useApplyRecurring,
} from '../hooks/useRecurring';

interface Props {
  navigation: any;
}

export const RecurringListScreen: React.FC<Props> = ({ navigation }) => {
  const { currentMonth } = useUIStore();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const listQuery = useRecurringList();
  const pendingQuery = usePendingRecurring(currentMonth);
  const deleteMutation = useDeleteRecurring();
  const updateMutation = useUpdateRecurring();
  const applyMutation = useApplyRecurring(currentMonth);

  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const allList = listQuery.data ?? [];
  const pendingList = pendingQuery.data ?? [];

  const handleApply = (item: RecurringTransaction) => {
    Alert.alert('반영 확인', `"${item.title}"을(를) 이번 달에 반영할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '반영',
        onPress: async () => {
          try {
            await applyMutation.mutateAsync(item);
            Alert.alert('완료', '반영됐어요');
          } catch (e: any) {
            Alert.alert('오류', e.message);
          }
        },
      },
    ]);
  };

  const handleDelete = (item: RecurringTransaction) => {
    swipeableRefs.current.get(item.id)?.close();
    Alert.alert('삭제 확인', `"${item.title}"을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(item.id);
          } catch (e: any) {
            Alert.alert('오류', e.message);
          }
        },
      },
    ]);
  };

  const handleToggleActive = async (item: RecurringTransaction) => {
    try {
      await updateMutation.mutateAsync({ id: item.id, data: { isActive: !item.isActive } });
    } catch (e: any) {
      Alert.alert('오류', e.message);
    }
  };

  const renderDeleteAction = (item: RecurringTransaction) => (
    <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(item)}>
      <Icon name="delete" size={22} color={colors.white} />
      <Text style={styles.deleteActionText}>삭제</Text>
    </TouchableOpacity>
  );

  const renderRecurringItem = (item: RecurringTransaction) => {
    const cat = getCategoryByKey(item.category);
    return (
      <Swipeable
        key={item.id}
        ref={ref => {
          if (ref) swipeableRefs.current.set(item.id, ref);
          else swipeableRefs.current.delete(item.id);
        }}
        renderRightActions={() => renderDeleteAction(item)}
        overshootRight={false}
      >
        <TouchableOpacity
          style={[styles.listItem, !item.isActive && styles.listItemInactive]}
          onPress={() => navigation.navigate('RecurringForm', { recurring: item })}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.categoryIconWrap,
              { backgroundColor: (cat?.color ?? '#A0A0A0') + '22' },
            ]}
          >
            <Icon
              name={cat?.icon ?? 'repeat'}
              size={20}
              color={cat?.color ?? '#A0A0A0'}
            />
          </View>
          <View style={styles.listItemContent}>
            <Text style={styles.listItemTitle}>{item.title}</Text>
            <Text style={styles.listItemSub}>
              매월 {item.dayOfMonth}일 · {item.type === 'expense' ? '지출' : '수입'}
            </Text>
          </View>
          <Text
            style={[
              styles.listItemAmount,
              { color: item.type === 'expense' ? colors.expense : colors.income },
            ]}
          >
            {formatCurrency(item.amount)}
          </Text>
          <Switch
            value={item.isActive}
            onValueChange={() => handleToggleActive(item)}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
            style={styles.switch}
          />
        </TouchableOpacity>
      </Swipeable>
    );
  };

  if (listQuery.isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>정기 지출 관리</Text>
          <View style={styles.headerButton} />
        </View>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>정기 지출 관리</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('RecurringForm', {})}
          style={styles.headerButton}
        >
          <Icon name="add" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Pending Section */}
        {pendingList.length > 0 && (
          <View>
            <View style={styles.pendingBanner}>
              <Icon name="notifications-active" size={18} color={colors.warning} />
              <Text style={styles.pendingBannerText}>
                이번 달 반영 안 된 고정비가 있어요
              </Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                이번 달 미반영 ({pendingList.length}건)
              </Text>
            </View>

            {pendingList.map(item => {
              const cat = getCategoryByKey(item.category);
              return (
                <View key={item.id} style={styles.pendingItem}>
                  <View
                    style={[
                      styles.categoryIconWrap,
                      { backgroundColor: (cat?.color ?? '#A0A0A0') + '22' },
                    ]}
                  >
                    <Icon
                      name={cat?.icon ?? 'repeat'}
                      size={20}
                      color={cat?.color ?? '#A0A0A0'}
                    />
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{item.title}</Text>
                    <Text style={styles.listItemSub}>매월 {item.dayOfMonth}일</Text>
                  </View>
                  <Text
                    style={[
                      styles.listItemAmount,
                      { color: item.type === 'expense' ? colors.expense : colors.income },
                    ]}
                  >
                    {formatCurrency(item.amount)}
                  </Text>
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => handleApply(item)}
                    disabled={applyMutation.isPending}
                  >
                    <Text style={styles.applyButtonText}>반영</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Full List Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>전체 목록</Text>
        </View>

        {allList.length === 0 ? (
          <EmptyState
            icon="repeat"
            title="등록된 고정비가 없어요"
            subtitle="+ 버튼을 눌러 월세, 구독 등 고정비를 등록해보세요"
          />
        ) : (
          <View style={styles.listSection}>
            {allList.map(item => renderRecurringItem(item))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 56,
      paddingBottom: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    scrollView: {
      flex: 1,
    },
    pendingBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: isDark ? '#431407' : '#FFF7ED',
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginTop: 12,
      marginHorizontal: 16,
      borderRadius: 10,
    },
    pendingBannerText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.warning,
    },
    sectionHeader: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    pendingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    listSection: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.borderLight,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    listItemInactive: {
      opacity: 0.35,
    },
    categoryIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    listItemContent: {
      flex: 1,
    },
    listItemTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    listItemSub: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 2,
    },
    listItemAmount: {
      fontSize: 15,
      fontWeight: '700',
      marginRight: 8,
    },
    switch: {
      marginLeft: 4,
    },
    applyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 8,
    },
    applyButtonText: {
      color: colors.white,
      fontSize: 13,
      fontWeight: '700',
    },
    deleteAction: {
      backgroundColor: colors.danger,
      justifyContent: 'center',
      alignItems: 'center',
      width: 72,
      gap: 4,
    },
    deleteActionText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: '600',
    },
  });
