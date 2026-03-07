import React, { useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../shared/theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onFilterPress: () => void;
  activeFilterCount: number;
}

export const SearchBar: React.FC<Props> = ({
  value,
  onChangeText,
  onClear,
  onFilterPress,
  activeFilterCount,
}) => {
  const inputRef = useRef<TextInput>(null);
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
      <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceSecondary }]}>
        <Icon name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }]}
          placeholder="거래 검색..."
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          clearButtonMode="never"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="cancel" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.filterButton,
          { borderColor: colors.border, backgroundColor: colors.surface },
          activeFilterCount > 0 && { borderColor: colors.primary, backgroundColor: colors.primary },
        ]}
        onPress={onFilterPress}
      >
        <Icon
          name="tune"
          size={18}
          color={activeFilterCount > 0 ? colors.white : colors.textSecondary}
        />
        {activeFilterCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.white }]}>
            <Icon name="circle" size={8} color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
  },
  searchIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  filterButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
