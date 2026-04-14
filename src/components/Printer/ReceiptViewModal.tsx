import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

interface ReceiptModalProps {
  isVisible: boolean;
  onClose: () => void;
  sale: any;
  onPrint: () => void;
}

const ReceiptViewModal: React.FC<ReceiptModalProps> = ({
  isVisible,
  onClose,
  sale,
  onPrint,
}) => {
  if (!sale) return null;

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.billModal}>
          {/* Header */}
          {/* Header */}

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Receipt</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Store Brand Section */}
            <View style={styles.receiptHeader}>
              <Text style={styles.storeName}>MINIZEO RETAIL</Text>
              <Text style={styles.receiptMeta}>
                Bill No: #{sale.billNumber}
              </Text>
              <Text style={styles.receiptMeta}>
                {new Date(sale.createdAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </Text>
              <Text style={styles.cashierNote}>
                Billed by: {sale.user?.name}
              </Text>
            </View>

            <View style={styles.dashedDivider} />

            {/* Items List */}
            {sale.items.map((item: any, idx: number) => {
              const itemBaseTotal = parseFloat(item.price) * item.quantity;
              const lineTotal =
                itemBaseTotal - (parseFloat(item.lineDiscount) || 0);

              return (
                <View key={idx} style={styles.itemRow}>
                  <View style={{flex: 2}}>
                    <Text style={styles.productName}>{item.product?.name}</Text>
                    <View style={styles.itemDetailRow}>
                      <Text style={styles.productSub}>
                        ₹{parseFloat(item.price).toFixed(2)} x {item.quantity}
                      </Text>
                      {item.taxRate > 0 && (
                        <View style={styles.taxBadge}>
                          <Text style={styles.taxBadgeText}>
                            {item.taxRate}% GST
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* UI Change: Show Item Level Discount */}
                    {parseFloat(item.lineDiscount) > 0 && (
                      <Text style={styles.lineDiscountText}>
                        - Item Discount: ₹
                        {parseFloat(item.lineDiscount).toFixed(2)}
                      </Text>
                    )}
                  </View>
                  <View style={{alignItems: 'flex-end'}}>
                    <Text style={styles.itemTotal}>
                      ₹{lineTotal.toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })}

            <View style={styles.dashedDivider} />

            {/* Final Totals Section */}
            <View style={styles.summaryContainer}>
              <View style={styles.rowBetween}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ₹{parseFloat(sale.totalAmount).toFixed(2)}
                </Text>
              </View>

              {parseFloat(sale.discount) > 0 && (
                <View style={styles.rowBetween}>
                  <Text style={styles.summaryLabel}>Order Discount</Text>
                  <Text style={[styles.summaryValue, {color: '#ef4444'}]}>
                    -₹{parseFloat(sale.discount).toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.rowBetween}>
                <Text style={styles.summaryLabel}>GST (Total Collected)</Text>
                <Text style={styles.summaryValue}>
                  ₹{parseFloat(sale.taxAmount).toFixed(2)}
                </Text>
              </View>

              <View style={styles.grandTotalContainer}>
                <Text style={styles.grandLabel}>GRAND TOTAL</Text>
                <Text style={styles.grandPrice}>
                  ₹{parseFloat(sale.finalAmount).toFixed(2)}
                </Text>
              </View>

              <View style={styles.paymentMethod}>
                <Text style={styles.paymentText}>
                  Paid via: {sale.paymentMode}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Button */}
          <TouchableOpacity style={styles.printBtn} onPress={onPrint}>
            <Text style={styles.printBtnText}>PRINT INVOICE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  billModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: SCREEN_HEIGHT * 0.85,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {fontSize: 18, fontWeight: '800', color: '#1e293b'},
  closeBtn: {padding: 8},
  closeX: {fontSize: 20, color: '#94a3b8', fontWeight: 'bold'},
  scrollContent: {paddingBottom: 40},
  receiptHeader: {alignItems: 'center', marginBottom: 20},
  storeName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 1,
  },
  receiptMeta: {fontSize: 13, color: '#64748b', marginTop: 4},
  cashierNote: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
    fontStyle: 'italic',
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    marginVertical: 15,
  },
  itemRow: {marginBottom: 16},
  productName: {fontSize: 15, fontWeight: '700', color: '#1e293b'},
  itemDetailRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  productSub: {fontSize: 13, color: '#64748b'},
  taxBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  taxBadgeText: {fontSize: 10, fontWeight: '700', color: '#6366f1'},
  lineDiscountText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
    marginTop: 2,
  },
  itemTotal: {fontSize: 15, fontWeight: '800', color: '#1e293b'},
  summaryContainer: {marginTop: 10, gap: 10},
  rowBetween: {flexDirection: 'row', justifyContent: 'space-between'},
  summaryLabel: {fontSize: 14, color: '#64748b'},
  summaryValue: {fontSize: 14, fontWeight: '700', color: '#1e293b'},
  grandTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  grandLabel: {fontSize: 16, fontWeight: '800', color: '#0f172a'},
  grandPrice: {fontSize: 24, fontWeight: '900', color: '#1e293b'},
  paymentMethod: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  printBtn: {
    backgroundColor: '#1e293b',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  printBtnText: {color: '#fff', fontWeight: '800', fontSize: 16},
});

export default ReceiptViewModal;
