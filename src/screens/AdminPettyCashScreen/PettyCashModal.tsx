import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import {operationService} from '../../services/operationService';
import {User} from '../../services/usersService';
import Toast from 'react-native-toast-message';
import swiggyColors from '../../assets/Color/swiggyColor';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  users: User[];
}

export default function PettyCashModal({
  isOpen,
  onClose,
  onSuccess,
  users,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false); // Controls the second modal

  const [form, setForm] = useState({
    userId: '',
    userName: '',
    amount: '',
    reason: '',
  });

  const handleSelectUser = (user: User) => {
    setForm({...form, userId: user.id, userName: user.name});
    setShowUserPicker(false);
  };

  const handleSubmit = async () => {
    if (!form.userId || !form.amount || !form.reason) {
      return Toast.show({type: 'error', text1: 'Please fill all fields'});
    }

    try {
      setLoading(true);
      await operationService.createPettyCash({
        userId: form.userId,
        amount: Number(form.amount),
        reason: form.reason,
      });

      Toast.show({
        type: 'success',
        text1: 'Entry added successfully',
        props: {
          backgroundColor: swiggyColors.veg,
        },
      });
      setForm({userId: '', userName: '', amount: '', reason: ''});
      onSuccess();
      onClose();
    } catch (error) {
      Toast.show({type: 'error', text1: 'Failed to create entry'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* MAIN INPUT MODAL */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Petty Cash Entry</Text>
              <TouchableOpacity
                onPress={onClose}
                disabled={loading}
                style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              {/* Staff Member Trigger */}
              <View>
                <Text style={styles.label}>STAFF MEMBER</Text>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  onPress={() => setShowUserPicker(true)}>
                  <Text
                    style={[
                      styles.pickerText,
                      !form.userName && {color: '#94a3b8'},
                    ]}>
                    {form.userName || 'Select Staff Member'}
                  </Text>
                  <Text style={styles.chevron}>▶</Text>
                </TouchableOpacity>
              </View>

              <View>
                <Text style={styles.label}>AMOUNT</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencyPrefix}>₹</Text>
                  <TextInput
                    placeholder="0.00"
                    keyboardType="numeric"
                    style={styles.input}
                    value={form.amount}
                    onChangeText={val => setForm({...form, amount: val})}
                  />
                </View>
              </View>

              <View>
                <Text style={styles.label}>REASON</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    placeholder="What is this for?"
                    multiline
                    style={[styles.input, styles.textArea]}
                    value={form.reason}
                    onChangeText={val => setForm({...form, reason: val})}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.disabledBtn]}
                onPress={handleSubmit}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>CREATE ENTRY</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* SECONDARY SELECTION MODAL */}
      <Modal
        visible={showUserPicker}
        animationType="fade"
        transparent={true} // Crucial for seeing the overlay
        onRequestClose={() => setShowUserPicker(false)}>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            {/* Small handle at the top for visual cue */}
            <View style={styles.modalHandle} />

            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Staff</Text>
              <TouchableOpacity
                onPress={() => setShowUserPicker(false)}
                style={styles.pickerCloseBtn}>
                <Text style={styles.pickerCloseText}>Close</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={users}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.pickerListPadding}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.userItem,
                    form.userId === item.id && styles.selectedItem,
                  ]}
                  onPress={() => handleSelectUser(item)}>
                  <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.avatarText}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.userItemText}>{item.name}</Text>
                      <Text style={styles.userRoleText}>
                        {item.role || 'Staff'}
                      </Text>
                    </View>
                  </View>
                  {form.userId === item.id && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No staff members found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {fontSize: 20, fontWeight: '800', color: '#0f172a'},
  closeBtn: {padding: 4},
  closeText: {fontSize: 18, color: '#64748b', fontWeight: 'bold'},
  form: {gap: 16},
  label: {fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 6},
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pickerText: {flex: 1, fontWeight: '600', color: '#1e293b'},
  chevron: {fontSize: 12, color: '#94a3b8'},
  // NEW PICKER STYLES
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker background for depth
    justifyContent: 'center', // Centers the "card"
    padding: 24,
  },
  pickerContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    maxHeight: '80%', // Prevents the modal from hitting screen edges
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  pickerCloseBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pickerCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  pickerListPadding: {
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  selectedItem: {
    backgroundColor: '#f0f4ff', // Light indigo highlight
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  userItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  userRoleText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 1,
  },
  checkBadge: {
    backgroundColor: '#6366f1',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  backBtnText: {color: '#6366f1', fontWeight: '700', fontSize: 16},

  listPadding: {paddingHorizontal: 16},

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94a3b8',
    marginRight: 4,
  },
  input: {flex: 1, height: 52, color: '#1e293b', fontWeight: '600'},
  textAreaContainer: {alignItems: 'flex-start', height: 100},
  textArea: {height: 100, textAlignVertical: 'top', paddingTop: 14},
  submitBtn: {
    backgroundColor: '#0f172a',
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledBtn: {opacity: 0.6},
  submitBtnText: {color: '#fff', fontWeight: '700', fontSize: 15},
  emptyText: {padding: 20, textAlign: 'center', color: '#94a3b8'},
});
