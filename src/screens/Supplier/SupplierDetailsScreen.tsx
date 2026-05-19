import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// Components & Assets
import {Text} from '../../components/common/UI';
import MainLayout from '../../screens/MainLayout';
import axiosInstance from '../../services/axiosInstance';
import color from '../../assets/Color/color';
import PhoneIcon from '../../assets/Icons/phone.svg';

// --- TypeScript Interfaces ---
export interface Purchase {
  id: string | number;
  invoiceNo?: string;
  finalAmount: number;
  amountPaid: number;
  amountDue: number;
  createdAt: string;
}

export interface Supplier {
  id: string | number;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  address?: string;
}

type RootStackParamList = {
  SupplierDetails: {supplier: Supplier};
};

type SupplierDetailsRouteProp = RouteProp<
  RootStackParamList,
  'SupplierDetails'
>;

const SupplierDetailsScreen: React.FC = () => {
  const route = useRoute<SupplierDetailsRouteProp>();
  const {supplier} = route.params;

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSupplierPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const {data} = await axiosInstance.get(
        `/suppliers/${supplier.id}/purchases`,
        {
          params: {limit: 50, page: 1},
        },
      );
      setPurchases(data.data || []);
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code outside of the 2xx range
        console.error('API Error Data:', error.response.data);
        console.error('API Error Status:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Network Error - No response:', error.message);
      } else {
        // Something happened in setting up the request
        console.error('Axios Setup Error:', error.message);
      }
      Toast.show({type: 'error', text1: 'Failed to fetch purchase history'});
    } finally {
      setLoading(false);
    }
  }, [supplier.id]);

  useEffect(() => {
    fetchSupplierPurchases();
  }, [fetchSupplierPurchases]);

  const renderPurchaseItem: ListRenderItem<Purchase> = ({item}) => {
    console.log('item', item);
    const date = new Date(item.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return (
      <View style={styles.purchaseCard}>
        <View style={styles.purchaseHeader}>
          <Text style={styles.invoiceNo}>
            {item.invoiceNo ? `INV-${item.invoiceNo}` : 'Un-invoiced'}
          </Text>
          <Text style={styles.date}>{date}</Text>
        </View>

        <View style={styles.amountsWrapper}>
          <View style={styles.amountBlock}>
            <Text style={styles.amountLabel}>Total</Text>
            <Text style={styles.amountValueTotal}>₹{item.finalAmount}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.amountBlock}>
            <Text style={styles.amountLabel}>Paid</Text>
            <Text style={styles.amountValuePaid}>₹{item.amountPaid}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.amountBlock}>
            <Text style={styles.amountLabel}>Due</Text>
            <Text style={styles.amountValueDue}>₹{item.amountDue}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.supplierInfoCard}>
      <Text style={styles.supplierName}>{supplier.name}</Text>

      {supplier.contactName && (
        <Text style={styles.contactPerson}>{supplier.contactName}</Text>
      )}

      <View style={styles.contactRow}>
        <PhoneIcon width={14} height={14} fill="#64748b" />
        <Text style={styles.contactText}>
          {supplier.phone || 'No phone provided'}
        </Text>
      </View>

      <View style={styles.metaDataWrapper}>
        {supplier.email && (
          <View style={styles.metaDataBlock}>
            <Text style={styles.metaDataLabel}>Email</Text>
            <Text style={styles.metaDataValue}>{supplier.email}</Text>
          </View>
        )}
        {supplier.gstNumber && (
          <View style={styles.metaDataBlock}>
            <Text style={styles.metaDataLabel}>GST</Text>
            <Text style={styles.metaDataValue}>{supplier.gstNumber}</Text>
          </View>
        )}
      </View>

      {supplier.address && (
        <View style={styles.metaDataBlock}>
          <Text style={styles.metaDataLabel}>Address</Text>
          <Text style={styles.metaDataValue}>{supplier.address}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Transaction History</Text>
    </View>
  );

  return (
    <MainLayout title="Supplier Record" showBack>
      <View style={styles.container}>
        {loading && purchases.length === 0 ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={color.themeBlue} />
          </View>
        ) : (
          <FlatList
            data={purchases}
            keyExtractor={item => item.id.toString()}
            renderItem={renderPurchaseItem}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No active transactions found.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Header UI - Enterprise clean look
  supplierInfoCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#0f172a',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  supplierName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  contactPerson: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 12,
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  contactText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    fontWeight: '500',
  },
  metaDataWrapper: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  metaDataBlock: {
    marginBottom: 16,
  },
  metaDataLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    color: '#94a3b8',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaDataValue: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 16,
  },

  // Purchase Card Data Visualization
  purchaseCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  invoiceNo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: 0.2,
  },
  date: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  amountsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
  },
  amountBlock: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 12,
  },
  amountLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  amountValueTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  amountValuePaid: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981', // Success green
  },
  amountValueDue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444', // Danger red
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SupplierDetailsScreen;
