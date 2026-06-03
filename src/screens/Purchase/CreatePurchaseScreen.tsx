import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Text,
} from 'react-native';

import MainLayout from '../../screens/MainLayout';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import color from '../../assets/Color/color';
import DeleteIcon from '../../assets/Icons/trash.svg';
import PlusIcon from '../../assets/Icons/plus.svg';
import SearchableDropdown from '../../components/Dropdown/SearchableDropdownSupplier';

const PAYMENT_MODES = ['CASH', 'ONLINE', 'CARD', 'CREDIT'];

const CreatePurchaseScreen = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);

  // Form State
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [discount, setDiscount] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

  // Cart State
  const [items, setItems] = useState([]);

  // Product Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    console.log('hit');
    try {
      const {data} = await axiosInstance.get('/suppliers');
      console.log('data', data);
      setSuppliers(data.data || []);
    } catch (error) {
      Toast.show({type: 'error', text1: 'Failed to load suppliers'});
    }
  };

  const searchProducts = async query => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const {data} = await axiosInstance.get('/products', {
        params: {search: query, limit: 50}, // Note: Backend uses 'take', not 'limit', so you might want to pass { search: query, take: 50 } instead
      });

      // ✅ Use data.items instead of data.data
      setSearchResults(data.items || []);
    } catch (error) {
      console.log('Search Error:', error); // Add this temporarily so you can see if it failsv adsdfgdf
    } finally {
      setIsSearching(false);
    }
  };

  const addItemToCart = product => {
    setItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? {...item, quantity: (parseFloat(item.quantity) + 1).toString()}
            : item,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unit: product.unit || 'PCS',
          quantity: '1',
          costPrice: product.costPrice ? product.costPrice.toString() : '0',
          taxRate: '0',
        },
      ];
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateItem = (productId, field, value) => {
    setItems(prev =>
      prev.map(item =>
        item.productId === productId ? {...item, [field]: value} : item,
      ),
    );
  };

  const removeItem = productId => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  };

  // Calculate totals dynamically
  const totals = useMemo(() => {
    let subtotal = 0;
    let tax = 0;

    items.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.costPrice) || 0;
      const rate = parseFloat(item.taxRate) || 0;

      const lineTotal = qty * price;
      subtotal += lineTotal;
      tax += lineTotal * (rate / 100);
    });

    const disc = parseFloat(discount) || 0;
    const finalAmount = subtotal + tax - disc;
    const paid = parseFloat(amountPaid) || 0;
    const due = finalAmount - paid;

    return {subtotal, tax, finalAmount, due};
  }, [items, discount, amountPaid]);

  const handleSubmit = async () => {
    if (!supplierId)
      return Toast.show({type: 'error', text1: 'Select a supplier'});
    if (items.length === 0)
      return Toast.show({type: 'error', text1: 'Add at least one item'});

    // Format dgskjdfgdfhasdfh
    const payload = {
      supplierId,
      invoiceNo,
      paymentMode,
      discount: parseFloat(discount) || 0,
      amountPaid: parseFloat(amountPaid) || 0,
      items: items.map(item => ({
        productId: item.productId,
        quantity: parseFloat(item.quantity) || 1,
        costPrice: parseFloat(item.costPrice) || 0,
        taxRate: parseFloat(item.taxRate) || 0,
      })),
    };

    setLoading(true);
    try {
      await axiosInstance.post('/purchases', payload);
      Toast.show({type: 'success', text1: 'Purchase recorded successfully'});
      navigation.goBack();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save purchase';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="New Purchase" showBack>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Supplier & Invoice Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <SearchableDropdown
            data={suppliers}
            value={supplierId}
            onChange={setSupplierId}
            placeholder="Select a supplier..."
            searchPlaceholder="Search suppliers by name..."
          />

          <Text style={styles.label}>Invoice Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. INV-1024"
            value={invoiceNo}
            onChangeText={setInvoiceNo}
          />

          <TouchableOpacity onPress={fetchSuppliers}>
            <Text>Click</Text>
          </TouchableOpacity>
        </View>

        {/* Product Search & sjjyj */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search products to add..."
            value={searchQuery}
            onChangeText={searchProducts}
          />

          {/* Search Dropdown */}
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              {searchResults.map(prod => (
                <TouchableOpacity
                  key={prod.id}
                  style={styles.searchItem}
                  onPress={() => addItemToCart(prod)}>
                  <View>
                    <Text style={styles.searchItemName}>{prod.name}</Text>
                    <Text style={styles.searchItemSub}>
                      Stock: {prod.stockQty} | Cost: ₹{prod.costPrice}
                    </Text>
                  </View>
                  <PlusIcon width={20} height={20} fill={color.themeBlue} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Cart List */}
          <View style={styles.cartList}>
            {items.map((item, index) => (
              <View key={item.productId} style={styles.cartCard}>
                <View style={styles.cartHeader}>
                  <Text style={styles.cartName}>{item.name}</Text>
                  <TouchableOpacity onPress={() => removeItem(item.productId)}>
                    <DeleteIcon width={18} height={18} fill="#ef4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cartInputsRow}>
                  <View style={styles.inputWrap}>
                    <Text style={styles.cartLabel}>Qty ({item.unit})</Text>
                    <TextInput
                      style={styles.cartInput}
                      keyboardType="numeric"
                      value={item.quantity}
                      onChangeText={val =>
                        updateItem(item.productId, 'quantity', val)
                      }
                    />
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.cartLabel}>Cost (₹)</Text>
                    <TextInput
                      style={styles.cartInput}
                      keyboardType="numeric"
                      value={item.costPrice}
                      onChangeText={val =>
                        updateItem(item.productId, 'costPrice', val)
                      }
                    />
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.cartLabel}>Tax (%)</Text>
                    <TextInput
                      style={styles.cartInput}
                      keyboardType="numeric"
                      value={item.taxRate}
                      onChangeText={val =>
                        updateItem(item.productId, 'taxRate', val)
                      }
                    />
                  </View>
                </View>
              </View>
            ))}
            {items.length === 0 && (
              <Text style={styles.emptyCartText}>No items added yet.</Text>
            )}
          </View>
        </View>

        {/* Payment & Totals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>

          <Text style={styles.label}>Payment Mode</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}>
            {PAYMENT_MODES.map(mode => (
              <TouchableOpacity
                key={mode}
                style={[styles.chip, paymentMode === mode && styles.chipActive]}
                onPress={() => setPaymentMode(mode)}>
                <Text
                  style={[
                    styles.chipText,
                    paymentMode === mode && styles.chipTextActive,
                  ]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <View style={[styles.inputWrap, {marginRight: 8}]}>
              <Text style={styles.label}>Discount (₹)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={discount}
                onChangeText={setDiscount}
              />
            </View>
            <View style={[styles.inputWrap, {marginLeft: 8}]}>
              <Text style={styles.label}>Amount Paid (₹)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={amountPaid}
                onChangeText={setAmountPaid}
              />
            </View>
          </View>

          {/* Summary Box */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ₹{totals.subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>₹{totals.tax.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>
                - ₹{(parseFloat(discount) || 0).toFixed(2)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <Text style={styles.summaryTotalLabel}>Final Amount</Text>
              <Text style={styles.summaryTotalValue}>
                ₹{totals.finalAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, {color: '#ef4444'}]}>
                Amount Due
              </Text>
              <Text style={[styles.summaryValue, {color: '#ef4444'}]}>
                ₹{totals.due.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Save Purchase</Text>
          )}
        </TouchableOpacity>

        <View style={{height: 40}} />
      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f1f5f9'},
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  label: {fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: '600'},
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#f8fafc',
    marginBottom: 16,
    color: '#1e293b',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: color.themeBlue,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#eff6ff',
    marginBottom: 12,
    color: '#1e293b',
  },
  row: {flexDirection: 'row', justifyContent: 'space-between'},
  inputWrap: {flex: 1},

  // Chips
  chipScroll: {marginBottom: 16},
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: color.themeBlue,
    borderColor: color.themeBlue,
  },
  chipText: {color: '#475569', fontWeight: '600', fontSize: 13},
  chipTextActive: {color: '#fff'},

  // Search Results
  searchResults: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 16,
    maxHeight: 150,
  },
  searchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchItemName: {fontSize: 14, fontWeight: '600', color: '#1e293b'},
  searchItemSub: {fontSize: 12, color: '#64748b', marginTop: 2},

  // Cart List
  cartList: {marginTop: 8},
  cartCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cartName: {fontSize: 15, fontWeight: '700', color: '#1e293b'},
  cartInputsRow: {flexDirection: 'row', gap: 8},
  cartLabel: {fontSize: 11, color: '#64748b', marginBottom: 4},
  cartInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#1e293b',
  },
  emptyCartText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontStyle: 'italic',
    paddingVertical: 20,
  },

  // Summary Box
  summaryBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {fontSize: 14, color: '#475569'},
  summaryValue: {fontSize: 14, color: '#1e293b', fontWeight: '600'},
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  summaryTotalLabel: {fontSize: 16, fontWeight: '700', color: '#1e293b'},
  summaryTotalValue: {fontSize: 18, fontWeight: '700', color: color.themeBlue},

  // Button
  submitBtn: {
    backgroundColor: color.themeBlue,
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {color: '#fff', fontSize: 16, fontWeight: '700'},
});

export default CreatePurchaseScreen;
