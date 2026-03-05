import React from 'react';
import { Modal } from 'react-native';
import { useUIStore } from '../../../store/uiStore';
import { TransactionAddScreen } from '../screens/TransactionAddScreen';

export const TransactionAddModal: React.FC = () => {
  const { isAddModalVisible, hideAddModal } = useUIStore();

  const mockNavigation = {
    goBack: hideAddModal,
  };

  return (
    <Modal
      visible={isAddModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={hideAddModal}
    >
      <TransactionAddScreen navigation={mockNavigation} />
    </Modal>
  );
};
