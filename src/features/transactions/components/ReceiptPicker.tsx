import React, { useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';

interface Props {
  uri?: string;
  onSelected: (uri: string) => void;
  onRemoved: () => void;
}

const IMAGE_OPTIONS = {
  mediaType: 'photo' as const,
  quality: 0.8 as const,
  maxWidth: 1080,
  maxHeight: 1080,
};

export const ReceiptPicker: React.FC<Props> = ({ uri, onSelected, onRemoved }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePress = () => {
    Alert.alert('영수증 첨부', '', [
      {
        text: '카메라로 촬영',
        onPress: () => {
          launchCamera(IMAGE_OPTIONS, response => {
            if (response.assets?.[0]?.uri) {
              onSelected(response.assets[0].uri);
            }
          });
        },
      },
      {
        text: '갤러리에서 선택',
        onPress: () => {
          launchImageLibrary(IMAGE_OPTIONS, response => {
            if (response.assets?.[0]?.uri) {
              onSelected(response.assets[0].uri);
            }
          });
        },
      },
      { text: '취소', style: 'cancel' },
    ]);
  };

  if (uri) {
    return (
      <View style={styles.previewContainer}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
          <Image source={{ uri }} style={styles.thumbnail} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton} onPress={onRemoved}>
          <Icon name="close" size={14} color={colors.white} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.addButton} onPress={handlePress} activeOpacity={0.7}>
      <Icon name="camera-alt" size={20} color={colors.textSecondary} />
      <Text style={styles.addButtonText}>영수증 첨부</Text>
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    addButtonText: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    previewContainer: {
      position: 'relative',
      alignSelf: 'flex-start',
    },
    thumbnail: {
      width: 80,
      height: 80,
      borderRadius: 8,
    },
    removeButton: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.danger,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
