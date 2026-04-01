import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  View,
  Alert,
} from 'react-native';
import {Div} from '../../components/common/UI';
import {orderService} from '../../services/orderService';
import CloseBtn from '../../assets/Icons/closeIcon.svg';
import ServeBtn from '../../assets/Icons/tick-svgrepo-com.svg';

import swiggyColors from '../../assets/Color/swiggyColor';
import color from '../../assets/Color/color';
import {socket} from '../../services/socketService';
import Toast from 'react-native-toast-message';
import {Dimensions} from 'react-native';
interface ViewOrderModalProps {
  visible: boolean;
  onClose: () => void;
  table: {
    id: string;
    name: string;
    readyItemId: string;
  };
}
const SCREEN_HEIGHT = Dimensions.get('window').height;
const ViewOrderModal = ({visible, onClose, table}: ViewOrderModalProps) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [servingId, setServingId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const itemLayouts = useRef<{[key: string]: number}>({});
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null,
  );
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(
    null,
  );
  const handleItemLayout = (itemId: string, y: number) => {
    itemLayouts.current[itemId] = y;

    // Scroll ONLY when this is the highlighted item
    if (itemId === highlightedItemId && scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          y: y - 20,
          animated: true,
        });
      });
    }
  };
  const fetchActiveOrder = async () => {
    try {
      // setLoading(true);
      const data = await orderService.getActiveOrders(table.id);

      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && table?.readyItemId) {
      setActiveHighlightId(table.readyItemId);

      const timer = setTimeout(() => {
        setActiveHighlightId(null);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [visible, table?.readyItemId]);

  useEffect(() => {
    if (visible && table?.id) {
      fetchActiveOrder();
    }
  }, [visible, table?.id]);
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleUpdate = (data: any) => {
      // Only refresh if the update belongs to THIS table
      // The backend now sends the whole table object or tableId
      if (data.id === table.id || data.tableId === table.id) {
        fetchActiveOrder();
      }
    };

    socket.on('newOrder', handleUpdate);
    socket.on('itemStatusUpdated', handleUpdate);

    socket.on('itemStatusUpdated', data => {
      // Check if the item belongs to this table's order
      if (data.tableId === table.id || data.orderId === order?.id) {
        // fetchActiveOrder();
        if (data.status === 'READY') {
          Toast.show({
            type: 'success',
            text1: '🍳 Kitchen Update',
            text2: `Food is ready for ${table.name}`,
            position: 'top',
            topOffset: 50,
            props: {
              backgroundColor: swiggyColors.veg,
            },
          });
        }
      }
    });

    return () => {
      socket.off('tableUpdated', handleUpdate);
      socket.off('newOrder', handleUpdate);
      socket.off('itemStatusUpdated');
    };
  }, [table.id, order?.id]); // Re-bind when IDs change
  const handleCancelItem = async (itemId: string) => {
    Alert.alert(
      'Cancel Item',
      'Are you sure you want to remove this item from the order?',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancellingId(itemId);
              await orderService.cancelItem(itemId);

              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Item has been cancelled',
              });

              // Refresh the order to show updated totals/items
              fetchActiveOrder();
            } catch (err: any) {
              const errorMsg =
                err.response?.data?.message || 'Failed to cancel item';
              Toast.show({type: 'error', text1: 'Error', text2: errorMsg});
            } finally {
              setCancellingId(null);
            }
          },
        },
      ],
    );
  };
  const handleServeItem = async (itemId: string) => {
    try {
      setServingId(itemId);
      await orderService.serveItem(itemId);

      setOrder((prevOrder: any) => ({
        ...prevOrder,
        items: prevOrder.items.map((item: any) =>
          item.id === itemId ? {...item, status: 'SERVED'} : item,
        ),
      }));
    } catch (err) {
      console.log('err', err);
    } finally {
      setServingId(null);
    }
  };
  // const handleServeItem = async (itemId: string) => {
  //   try {
  //     await orderService.serveItem(itemId);
  //     // Success feedback
  //     // fetchActiveOrder(); // Refresh modal list
  //   } catch (err) {
  //     console.log('err', err);
  //   }
  // };
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'READY':
        return {
          bg: '#ECFDF5',
          text: '#059669',
          label: 'READY',
          icon: 'check-circle',
        };
      case 'PREPARING':
        return {
          bg: '#FFFBEB',
          text: '#D97706',
          label: 'PREPARING',
          icon: 'clock',
        };
      case 'SERVED':
        return {
          bg: '#F8FAFC',
          text: '#94A3B8',
          label: 'SERVED',
          icon: 'user-check',
        };
      default:
        return {
          bg: '#EFF6FF',
          text: '#2563EB',
          label: 'PENDING',
          icon: 'loader',
        };
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Div style={styles.overlay}>
        {/* Background Blur Effect Tap to Close */}
        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <Div style={styles.modalContainer}>
          {/* Decorative Drag Handle */}
          <View style={styles.dragHandle} />

          <Div style={styles.header}>
            <Div>
              <Text style={styles.subtitle}>{table.name}</Text>
              <Text style={styles.title}>Order Summary</Text>
            </Div>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <CloseBtn width={20} height={20} color="#333333" />
            </TouchableOpacity>
          </Div>

          {loading ? (
            <Div style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#FC8019" />
              <Text style={styles.loadingText}>Fetching updates...</Text>
            </Div>
          ) : !order ? (
            <Div style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>
                No active orders for this table
              </Text>
            </Div>
          ) : (
            <ScrollView
              ref={scrollRef}
              style={styles.scrollArea}
              showsVerticalScrollIndicator={false}>
              {order.items?.map((item: any) => {
                const config = getStatusConfig(item.status);
                const canCancel =
                  item.status === 'PENDING' ||
                  item.status === 'PREPARING' ||
                  item.status === 'READY';
                const canBeServed =
                  item.status === 'READY' ||
                  (item.status === 'PENDING' &&
                    item.menuItem.type === 'DRINKS');
                const isHighlighted = item.id === activeHighlightId;

                return (
                  <Div
                    key={item.id}
                    // 2. Capture the Y position of this specific item
                    onLayout={(e: any) => {
                      handleItemLayout(item.id, e.nativeEvent.layout.y);
                    }}
                    style={[
                      styles.orderItem,
                      isHighlighted && styles.highlightedItem,
                    ]}>
                    <Div style={styles.itemMain}>
                      <Div style={styles.qtyBadge}>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                      </Div>
                      <Div flex={1}>
                        <Text style={styles.itemName}>
                          {item.menuItem.name}
                        </Text>
                        <Div
                          style={StyleSheet.flatten([
                            styles.statusPill,
                            {backgroundColor: config.bg},
                          ])}>
                          <View
                            style={[styles.dot, {backgroundColor: config.text}]}
                          />
                          <Text
                            style={[styles.statusLabel, {color: config.text}]}>
                            {config.label}
                          </Text>
                        </Div>
                      </Div>
                    </Div>
                    {canCancel && (
                      <TouchableOpacity
                        onPress={() => handleCancelItem(item.id)}
                        disabled={cancellingId !== null}
                        style={[styles.cancelBtn, {marginRight: 8}]}>
                        {cancellingId === item.id ? (
                          <ActivityIndicator size="small" color="#bba4a4" />
                        ) : (
                          <CloseBtn width={20} height={20} color="#f50505" />
                        )}
                      </TouchableOpacity>
                    )}
                    {canBeServed && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          styles.serveBtn,
                          servingId === item.id && styles.serveBtnDisabled,
                        ]}
                        onPress={() => handleServeItem(item.id)}
                        disabled={servingId !== null}>
                        {servingId === item.id ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <ServeBtn width={20} height={20} color="#ffffff" />
                        )}
                      </TouchableOpacity>
                    )}
                    {/* {isReady && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.serveBtn}
                        onPress={() => handleServeItem(item.id)}>
                        <Text style={styles.serveBtnText}>Serve</Text>
                      </TouchableOpacity>
                    )} */}
                  </Div>
                );
              })}
            </ScrollView>
          )}

          {order && (
            <Div style={styles.footer}>
              <Div>
                <Text style={styles.footerLabel}>Grand Total</Text>
                <Text style={styles.footerSub}>Inclusive of taxes</Text>
              </Div>
              <Text style={styles.totalAmount}>₹{order.totalAmount || 0}</Text>
            </Div>
          )}
        </Div>
      </Div>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)', // Darker, more premium backdrop
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: color.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: SCREEN_HEIGHT * 0.85,
    width: '100%',

    // paddingBottom: 10,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: -10},
    // shadowOpacity: 0.1,
    // shadowRadius: 20,
    // elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {fontSize: 24, fontWeight: '800', color: '#1E293B'},
  subtitle: {
    fontSize: 14,
    fontWeight: '800',
    // color: '#fff',
    letterSpacing: 1,
    color: swiggyColors.primary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#F1F5F9',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1, // Crucial: This ensures the ScrollView takes up remaining space
    paddingHorizontal: 24,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  highlightedItem: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#FC8019',
  },
  itemMain: {flexDirection: 'row', alignItems: 'center', flex: 1},
  qtyBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  qtyText: {fontSize: 14, fontWeight: '800', color: '#1E293B'},
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  dot: {width: 6, height: 6, borderRadius: 3, marginRight: 6},
  statusLabel: {fontSize: 10, fontWeight: '800'},
  cancelBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FEE2E2', // Light red border
    backgroundColor: '#FEF2F2', // Very light red bg
  },
  cancelBtnText: {
    color: '#EF4444', // Red text
    fontWeight: '700',
    fontSize: 12,
  },
  serveBtn: {
    backgroundColor: swiggyColors.veg,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 24,
    // minWidth: 70, // Added to prevent button shrinking when loader appears
    alignItems: 'center',
    justifyContent: 'center',
  },
  serveBtnDisabled: {
    opacity: 0.7,
  },
  serveBtnText: {color: '#FFF', fontWeight: '700', fontSize: 12},
  footer: {
    marginTop: 10,
    marginHorizontal: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: color.dark,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  footerLabel: {color: color.dark, fontSize: 14, fontWeight: '700'},
  footerSub: {color: swiggyColors.textSecondary, fontSize: 10, marginTop: 2},
  totalAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: swiggyColors.textPrimary,
  },
  loaderContainer: {padding: 60, alignItems: 'center'},
  loadingText: {marginTop: 10, color: '#64748B', fontSize: 12},
  emptyContainer: {padding: 60, alignItems: 'center'},
  emptyEmoji: {fontSize: 40, marginBottom: 10},
  emptyText: {color: '#94A3B8', fontWeight: '600'},
});

export default ViewOrderModal;
