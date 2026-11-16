import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Haptics from 'expo-haptics';

export default function Modal({
  isOpen,
  titulo,
  mensagem,
  tipo = 'info',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (isOpen) {
      if (tipo === 'danger') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (tipo === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  }, [isOpen, tipo]);

  if (!isOpen) return null;

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onCancel || onConfirm}
    >
      <TouchableWithoutFeedback onPress={onCancel || onConfirm}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalIcon}>
                  {tipo === 'danger' ? '⚠️' : tipo === 'success' ? '✅' : 'ℹ️'}
                </Text>
                <Text style={styles.modalTitle}>{titulo}</Text>
              </View>

              <Text style={styles.modalMessage}>{mensagem}</Text>

              <View style={styles.modalActions}>
                {onCancel && (
                  <TouchableOpacity
                    style={[styles.button, styles.btnSecondary]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      onCancel();
                    }}
                  >
                    <Text style={styles.btnSecondaryText}>Cancelar</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.button,
                    tipo === 'danger' ? styles.btnDanger : styles.btnPrimary,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onConfirm();
                  }}
                >
                  <Text
                    style={
                      tipo === 'danger'
                        ? styles.btnDangerText
                        : styles.btnPrimaryText
                    }
                  >
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1e232a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2c3440',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  modalMessage: {
    color: '#c0c8d0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#00e054',
  },
  btnPrimaryText: {
    color: '#14181c',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnSecondary: {
    backgroundColor: '#2c3440',
  },
  btnSecondaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  btnDanger: {
    backgroundColor: '#ff4949',
  },
  btnDangerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});