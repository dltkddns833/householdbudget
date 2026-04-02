import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../theme';
import { ThemeColors } from '../constants/colors';

interface OptionPickerProps {
  visible: boolean;
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  allowCustomInput?: boolean;
}

export const OptionPicker: React.FC<OptionPickerProps> = ({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  allowCustomInput,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customText, setCustomText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleClose = () => {
    setIsCustomMode(false);
    setCustomText('');
    onClose();
  };

  const handleCustomConfirm = () => {
    if (customText.trim()) {
      onSelect(customText.trim());
      handleClose();
    }
  };

  const renderItem = ({ item }: { item: string }) => {
    const isSelected = item === selected;
    return (
      <TouchableOpacity
        style={[styles.option, isSelected && styles.optionSelected]}
        onPress={() => {
          onSelect(item);
          handleClose();
        }}
      >
        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
          {item}
        </Text>
        {isSelected && <Icon name="check" size={20} color={colors.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>

        {isCustomMode ? (
          <View style={styles.customInputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.customInput}
              value={customText}
              onChangeText={setCustomText}
              placeholder="직접 입력해주세요"
              placeholderTextColor={colors.textTertiary}
              autoFocus
              onSubmitEditing={handleCustomConfirm}
              returnKeyType="done"
            />
            <View style={styles.customActions}>
              <TouchableOpacity
                style={styles.customCancelBtn}
                onPress={() => {
                  setIsCustomMode(false);
                  setCustomText('');
                }}
              >
                <Text style={styles.customCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.customConfirmBtn, !customText.trim() && styles.buttonDisabled]}
                onPress={handleCustomConfirm}
                disabled={!customText.trim()}
              >
                <Text style={styles.customConfirmText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={renderItem}
              style={styles.list}
            />
            {allowCustomInput && (
              <TouchableOpacity
                style={styles.customButton}
                onPress={() => {
                  setCustomText(selected);
                  setIsCustomMode(true);
                }}
              >
                <Icon name="edit" size={18} color={colors.primary} />
                <Text style={styles.customButtonText}>직접 입력</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 34,
      maxHeight: '60%',
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: colors.borderLight,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      paddingHorizontal: 20,
      marginBottom: 8,
    },
    list: {
      flexGrow: 0,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    optionSelected: {
      backgroundColor: colors.surfaceSecondary,
    },
    optionText: {
      fontSize: 15,
      color: colors.text,
    },
    optionTextSelected: {
      fontWeight: '700',
      color: colors.primary,
    },
    customButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 14,
      marginHorizontal: 20,
      marginTop: 8,
      borderRadius: 10,
      backgroundColor: colors.surfaceSecondary,
    },
    customButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    customInputContainer: {
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    customInput: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
    },
    customActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 12,
    },
    customCancelBtn: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: colors.surfaceSecondary,
    },
    customCancelText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    customConfirmBtn: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
    customConfirmText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.white,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  });
