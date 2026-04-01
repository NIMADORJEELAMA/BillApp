// import React, {useEffect, useState, useMemo} from 'react';
// import {
//   StyleSheet,
//   View,
//   FlatList,
//   TouchableOpacity,
//   Text,
//   ScrollView,
// } from 'react-native';
// import MainLayout from '../MainLayout';

// import {io} from 'socket.io-client';
// import api from '../../services/axiosInstance';
// import Toast from 'react-native-toast-message';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import {socket} from '../../services/socketService';
// import RoomIcon from '../../assets/Icons/housesvg.svg';
// import ChairIcon from '../../assets/Icons/chair.svg';
// import TickIcon from '../../assets/Icons/tick-svgrepo-com.svg';
// import ProfileIcon from '../../assets/Icons/profile.svg';
// import EmptyIcon from '../../assets/Icons/empty-svgrepo-com.svg';

// import swiggyColors from '../../assets/Color/swiggyColor';
// import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';

// // Use your actual IP, not localhost for physical devices
// import Svg, {Path} from 'react-native-svg';
// import PrinterStatusHeader from '../PrinterSettings/PrinterStatusHeader';
// import {
//   startKitchenBackgroundService,
//   stopKitchenBackgroundService,
// } from '../../services/kitchenBackgroundService';

// const RefreshIcon = ({width, height, fill, style}: any) => (
//   <Svg
//     width={width}
//     height={height}
//     viewBox="0 0 24 24"
//     fill="none"
//     style={style}>
//     <Path
//       d="M1 4v6h6M23 20v-6h-6"
//       stroke={fill}
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//     <Path
//       d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"
//       stroke={fill}
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//   </Svg>
// );
// const KitchenDashboard = ({navigation}: any) => {
//   const [rawItems, setRawItems] = useState([]);
//   const [printingId, setPrintingId] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [printStatus, setPrintStatus] = useState<{
//     [key: string]: 'idle' | 'printing' | 'failed';
//   }>({});
//   const fetchKitchenQueue = async () => {
//     try {
//       const res = await api.get('/orders/kitchen/pending');

//       setRawItems(res.data);
//     } catch (err) {
//       console.error('Error fetching kitchen queue:', err);
//     }
//   };
//   const printKOT = async (order: any) => {
//     try {
//       const divider = '--------------------------------\n';
//       const maxNameLength = 26; // Reduced slightly for safety on 58mm

//       // 1. Time Formatting
//       const now = new Date();
//       const dateStr = `${now.getDate().toString().padStart(2, '0')}-${(
//         now.getMonth() + 1
//       )
//         .toString()
//         .padStart(2, '0')}-${now.getFullYear()}`;
//       const hours = now.getHours();
//       const minutes = now.getMinutes().toString().padStart(2, '0');
//       const ampm = hours >= 12 ? 'PM' : 'AM';
//       const hour12 = hours % 12 || 12;
//       const timeStr = `${hour12}:${minutes} ${ampm}`;

//       // 2. Extract Data Safely
//       // Based on your JSON, orderNumber is inside items[0].order
//       const orderData = order?.items?.[0]?.order || {};
//       const oNumber = orderData?.orderNumber || order?.orderNumber || '-';
//       const tNumber = order?.tableNumber || '-';
//       const orderNote = orderData?.note || order?.note || '';
//       const waiterName =
//         orderData?.waiter?.name || order?.waiter?.name || 'Staff';
//       let ticket = '';

//       // Header - Clean & Professional
//       ticket += `<C><B>ORDER #${oNumber}</B></C>\n`; // Big Token Number
//       ticket += divider;

//       // Table/Room name can be long, so we keep it on its own line
//       ticket += `TABLE : ${tNumber}\n`;
//       ticket += `DATE  : ${dateStr}\n`;
//       ticket += `TIME: ${timeStr}\n`;
//       ticket += `WAITER: ${waiterName.toUpperCase()}\n`;
//       ticket += divider;

//       ticket += `QTY  ITEM\n`;
//       ticket += divider;

//       // 3. Items Logic
//       const itemsText = order?.items
//         ?.map((item: any) => {
//           const qty = item.quantity.toString().padEnd(5, ' ');
//           const name = item?.menuItem?.name || 'ITEM';
//           const spicy = item.isSpicy ? ' (Spicy)' : '';
//           const fullName = name + spicy;

//           if (fullName.length <= maxNameLength) {
//             return `${qty}${fullName}`;
//           }

//           // Wrap long names properly so they don't break columns
//           const firstLine = `${qty}${fullName.substring(0, maxNameLength)}`;
//           const rest = fullName.substring(maxNameLength);
//           return `${firstLine}\n     ${rest}`;
//         })
//         .join('\n');

//       ticket += itemsText || '';
//       ticket += `\n${divider}`;

//       // 4. Centered Note Section
//       if (orderNote.trim() !== '') {
//         ticket += `NOTE: ${orderNote}\n`;
//         ticket += divider;
//       }

//       // Space for manual tear
//       ticket += `\n\n\n\n`;

//       await BLEPrinter.printText(ticket);
//     } catch (err) {
//       console.error('Print failed:', err);
//       Toast.show({
//         type: 'error',
//         text1: 'Printer Error',
//         text2: 'Check connection and paper',
//       });
//     }
//   };
//   // --- LOGIC PRESERVED FROM NEXT.JS ---
//   const groupedOrders = useMemo(() => {
//     const groups: {[key: string]: any} = {};
//     rawItems.forEach((item: any) => {
//       const orderId = item.orderId;
//       if (!groups[orderId]) {
//         const parentOrder = item.order;
//         groups[orderId] = {
//           id: orderId,
//           tableNumber:
//             parentOrder?.table?.number ||
//             (parentOrder?.roomId
//               ? `Room ${parentOrder.roomId.slice(0, 4)}`
//               : 'N/A'),
//           createdAt: parentOrder?.createdAt,
//           roomId: parentOrder?.roomId,
//           items: [],
//         };
//       }
//       groups[orderId].items.push(item);
//     });

//     return Object.values(groups).sort(
//       (a: any, b: any) =>
//         new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
//     );
//   }, [rawItems]);

//   useEffect(() => {
//     fetchKitchenQueue();

//     const handleNewOrder = async (data: any) => {
//       // 1. Refresh the list so the UI stays in sync
//       fetchKitchenQueue();
//       startKitchenBackgroundService();

//       // 2. UI Notification
//       const tableNum = data?.table?.number || 'N/A';
//       const orderNo = data?.orderNumber ? `#${data.orderNumber}` : '';

//       Toast.show({
//         type: 'success',
//         text1: `Order ${orderNo} Received!`,
//         text2: `Table: ${tableNum}`,
//         position: 'top',
//         visibilityTime: 4000,
//       });

//       // 3. AUTO-PRINT LOGIC
//       // We wrap this in a small delay or check to ensure
//       // the data structure matches what handlePrintKOT expects
//       // if (data && data.items) {
//       //   console.log('Auto-printing KOT for Order:', data.orderNumber);

//       //   // Map the incoming socket data to the structure your printer expects
//       //   const orderToPrint = {
//       //     ...data,
//       //     tableNumber: tableNum,
//       //     // Ensure items have the expected structure for the print function
//       //     items: data.items.map((it: any) => ({
//       //       ...it,
//       //       status: it.status || 'PENDING',
//       //     })),
//       //   };

//       //   handlePrintKOT(orderToPrint);
//       // }
//     };

//     socket.on('kitchenUpdate', handleNewOrder);

//     return () => {
//       socket.off('kitchenUpdate', handleNewOrder);
//       stopKitchenBackgroundService();
//     };
//   }, []);
//   const handleMarkItemReady = async (itemId: string) => {
//     try {
//       await api.patch(`/orders/item/${itemId}/status`, {status: 'READY'});
//       Toast.show({
//         type: 'success',
//         text1: `Waiter is notified`,
//         // text2: 'The kitchen has received your order.',
//         position: 'top',
//         topOffset: 50,
//         // Pass custom data here
//         props: {
//           backgroundColor: swiggyColors.textPrimary,
//         },
//       });
//       fetchKitchenQueue();
//     } catch (err) {
//       Toast.show({type: 'error', text1: 'Failed to update status'});
//     }
//   };

//   const handlePrintKOT = async (order: any) => {
//     const orderId = order.id || order._id;

//     // Set status to printing
//     setPrintStatus(prev => ({...prev, [orderId]: 'printing'}));

//     try {
//       const itemsToPrint = order.items.filter(
//         (item: any) => item.status === 'PENDING',
//       );

//       if (itemsToPrint.length === 0) return;

//       // 1. Attempt Physical Print
//       await printKOT({...order, items: itemsToPrint});

//       // 2. Success: Update DB status to PREPARING
//       await Promise.all(
//         itemsToPrint.map((item: any) =>
//           api.patch(`/orders/item/${item.id || item._id}/status`, {
//             status: 'PREPARING',
//           }),
//         ),
//       );

//       setPrintStatus(prev => ({...prev, [orderId]: 'idle'}));
//       fetchKitchenQueue();
//     } catch (err) {
//       console.error('Print failed:', err);
//       // 3. Failure: Set status to failed so UI can show a Retry button
//       setPrintStatus(prev => ({...prev, [orderId]: 'failed'}));

//       Toast.show({
//         type: 'error',
//         text1: 'Printer Disconnected',
//         text2: 'Please check Bluetooth and tap Retry.',
//         autoHide: false, // Keep it visible until they acknowledge
//       });
//     }
//   };

//   const handleMarkEntireOrderReady = async (order: any) => {
//     try {
//       const updatePromises = order.items
//         .filter(
//           (item: any) => item.status !== 'READY' && item.status !== 'SERVED',
//         )
//         .map((item: any) =>
//           api.patch(`/orders/item/${item.id}/status`, {status: 'READY'}),
//         );

//       if (updatePromises.length === 0) return;
//       await Promise.all(updatePromises);
//       Toast.show({
//         type: 'success',
//         text1: `Table ${order.tableNumber} Ready!`,
//         position: 'top',
//       });
//       fetchKitchenQueue();
//     } catch (err) {
//       Toast.show({type: 'error', text1: 'Failed to mark ready'});
//     }
//   };

//   // Render Component for Ticket Card
//   // Inside renderOrderTicket
//   const renderOrderTicket = ({item: order}: {item: any}) => {
//     const status = printStatus[order.id] || 'idle';
//     const hasPendingItems = order.items.some(
//       (i: any) => i.status === 'PENDING',
//     );
//     const orderTime = order.createdAt
//       ? new Date(order.createdAt).toLocaleTimeString([], {
//           hour: '2-digit',
//           minute: '2-digit',
//         })
//       : '--:--';

//     return (
//       <View
//         style={[
//           styles.card,
//           hasPendingItems ? styles.borderPending : styles.borderCooking,
//         ]}>
//         {/* HEADER SECTION */}
//         <View style={styles.cardHeader}>
//           <View style={styles.headerLeft}>
//             <View
//               style={[
//                 styles.iconBox,
//                 hasPendingItems ? styles.bgPending : styles.bgCooking,
//               ]}>
//               {order.roomId ? (
//                 <RoomIcon height={12} width={12} fill={'#fff'} />
//               ) : (
//                 <ChairIcon height={12} width={12} />
//               )}
//             </View>
//             <View style={styles.tableInfoContainer}>
//               <View style={styles.row}>
//                 {/* <Text style={styles.orderNumberText}>
//                   #{order.items[0]?.order?.orderNumber || '0'}
//                 </Text> */}
//                 <Text style={styles.tableNum} numberOfLines={2}>
//                   {order.tableNumber}
//                 </Text>
//               </View>
//               <Text style={styles.orderTime}>{orderTime}</Text>
//             </View>
//           </View>

//           <View
//             style={[
//               styles.badge,
//               hasPendingItems ? styles.badgeWait : styles.badgeCook,
//             ]}>
//             <Text
//               style={[
//                 styles.badgeText,
//                 hasPendingItems ? styles.badgeWaitText : styles.badgeCookText,
//               ]}>
//               {hasPendingItems ? 'WAIT' : 'COOK'}
//             </Text>
//           </View>
//         </View>

//         {/* ITEMS LIST */}
//         <ScrollView
//           style={styles.itemsScrollView}
//           nestedScrollEnabled={true}
//           showsVerticalScrollIndicator={false}>
//           <View style={styles.itemsList}>
//             {order.items.map((item: any) => (
//               <View
//                 key={item.id}
//                 style={[
//                   styles.itemRow,
//                   item.status === 'PENDING'
//                     ? styles.itemPending
//                     : styles.itemActive,
//                 ]}>
//                 <View style={styles.itemInfo}>
//                   <Text style={styles.itemQty}>{item.quantity}×</Text>
//                   <View style={{flex: 1}}>
//                     <Text style={styles.itemName} numberOfLines={2}>
//                       {item.menuItem?.name} {item.isSpicy && <Text>🌶️</Text>}
//                     </Text>
//                     <Text style={styles.itemStatus}>{item.status}</Text>
//                   </View>
//                 </View>

//                 {item.status === 'PREPARING' && (
//                   <TouchableOpacity
//                     style={styles.TickBtn}
//                     onPress={() => handleMarkItemReady(item.id)}>
//                     <TickIcon height={16} width={16} />
//                   </TouchableOpacity>
//                 )}
//               </View>
//             ))}
//           </View>
//         </ScrollView>

//         {/* ACTION BUTTON */}
//         <TouchableOpacity
//           style={[
//             styles.footerBtn,
//             status === 'failed'
//               ? {backgroundColor: '#ef4444'}
//               : hasPendingItems
//               ? styles.btnPrint
//               : styles.btnReady,
//           ]}
//           onPress={() =>
//             hasPendingItems || status === 'failed'
//               ? handlePrintKOT(order)
//               : handleMarkEntireOrderReady(order)
//           }
//           disabled={status === 'printing'}>
//           <Text style={styles.footerBtnText}>
//             {status === 'printing'
//               ? 'PRINTING...'
//               : status === 'failed'
//               ? 'RETRY PRINT'
//               : hasPendingItems
//               ? 'PRINT KOT'
//               : 'MARK READY'}
//           </Text>
//         </TouchableOpacity>
//         {/* <TouchableOpacity
//           style={[
//             styles.footerBtn,
//             hasPendingItems ? styles.btnPrint : styles.btnReady,
//           ]}
//           onPress={() =>
//             hasPendingItems
//               ? handlePrintKOT(order)
//               : handleMarkEntireOrderReady(order)
//           }>
//           <Text style={styles.footerBtnText}>
//             {hasPendingItems ? 'PRINT KOT' : 'MARK READY'}
//           </Text>
//         </TouchableOpacity> */}
//       </View>
//     );
//   };
//   // const renderOrderTicket = ({item: order}: {item: any}) => {
//   //   const hasPendingItems = order.items.some(
//   //     (i: any) => i.status === 'PENDING',
//   //   );
//   //   const orderTime = order.createdAt
//   //     ? new Date(order.createdAt).toLocaleTimeString([], {
//   //         hour: '2-digit',
//   //         minute: '2-digit',
//   //       })
//   //     : '--:--';

//   //   return (
//   //     <View
//   //       style={[
//   //         styles.card,
//   //         hasPendingItems ? styles.borderPending : styles.borderCooking,
//   //       ]}>
//   //       <View style={styles.cardHeader}>
//   //         <View style={styles.headerLeft}>
//   //           <View
//   //             style={[
//   //               styles.iconBox,
//   //               hasPendingItems ? styles.bgPending : styles.bgCooking,
//   //             ]}>
//   //             <View>
//   //               {order.roomId ? (
//   //                 <RoomIcon height={14} width={14} fill={'#fff'} />
//   //               ) : (
//   //                 <ChairIcon height={14} width={14} />
//   //               )}
//   //             </View>
//   //           </View>
//   //           <View>
//   //             <Text style={styles.tableNum}>{order.tableNumber}</Text>
//   //             <Text style={styles.orderTime}>{orderTime}</Text>
//   //           </View>
//   //         </View>
//   //         <View
//   //           style={[
//   //             styles.badge,
//   //             hasPendingItems ? styles.badgeWait : styles.badgeCook,
//   //           ]}>
//   //           <Text
//   //             style={[
//   //               styles.badgeText,
//   //               hasPendingItems ? styles.badgeWaitText : styles.badgeCookText,
//   //             ]}>
//   //             {hasPendingItems ? 'WAITING' : 'COOKING'}
//   //           </Text>
//   //         </View>
//   //       </View>

//   //       <ScrollView
//   //         style={styles.itemsScrollView}
//   //         nestedScrollEnabled={true} // Important for Android inside a FlatList
//   //         showsVerticalScrollIndicator={true}>
//   //         <View style={styles.itemsList}>
//   //           {order.items.map((item: any) => (
//   //             <View
//   //               key={item.id}
//   //               style={[
//   //                 styles.itemRow,
//   //                 item.status === 'PENDING'
//   //                   ? styles.itemPending
//   //                   : styles.itemActive,
//   //               ]}>
//   //               <View style={styles.itemInfo}>
//   //                 <Text style={styles.itemQty}>{item.quantity}×</Text>
//   //                 <View>
//   //                   <Text style={styles.itemName}>
//   //                     {item.menuItem?.name}{' '}
//   //                     {item.order?.isSpicy && <Text>🌶️</Text>}
//   //                   </Text>

//   //                   <Text style={styles.itemStatus}>{item.status}</Text>
//   //                 </View>
//   //               </View>
//   //               {item.status === 'PREPARING' && (
//   //                 <TouchableOpacity
//   //                   style={styles.TickBtn}
//   //                   onPress={() => handleMarkItemReady(item.id)}>
//   //                   <TickIcon height={20} width={20} />
//   //                 </TouchableOpacity>
//   //               )}
//   //             </View>
//   //           ))}
//   //         </View>
//   //       </ScrollView>
//   //       <TouchableOpacity
//   //         style={[
//   //           styles.footerBtn,
//   //           hasPendingItems ? styles.btnPrint : styles.btnReady,
//   //         ]}
//   //         onPress={() =>
//   //           hasPendingItems
//   //             ? handlePrintKOT(order)
//   //             : handleMarkEntireOrderReady(order)
//   //         }>
//   //         <Text style={styles.footerBtnText}>
//   //           {hasPendingItems ? 'PRINT KOT' : 'MARK READY'}
//   //         </Text>
//   //       </TouchableOpacity>
//   //     </View>
//   //   );
//   // };
//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchKitchenQueue();
//     setRefreshing(false);
//   };

//   return (
//     <MainLayout
//       title="Kitchen Queue"
//       rightComponent={
//         <TouchableOpacity
//           onPress={() => navigation.navigate('ProfileScreenBms')}
//           style={styles.refreshBtn}
//           activeOpacity={0.7}>
//           <ProfileIcon width={22} height={22} />
//         </TouchableOpacity>
//       }
//       subtitle={<PrinterStatusHeader />}
//       leftComponent={
//         <TouchableOpacity
//           onPress={onRefresh}
//           style={styles.refreshBtn}
//           activeOpacity={0.7}>
//           <RefreshIcon
//             width={22}
//             height={22}
//             fill="#1e293b"
//             style={refreshing ? styles.rotating : null}
//           />
//         </TouchableOpacity>
//       }>
//       <FlatList
//         data={groupedOrders}
//         renderItem={renderOrderTicket}
//         numColumns={2} // <--- Add this
//         key={'_'}
//         keyExtractor={(item: any) => item.id}
//         contentContainerStyle={styles.listPadding}
//         columnWrapperStyle={styles.columnWrapper}
//         refreshing={refreshing}
//         // onRefresh={onRefresh}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <EmptyIcon width={62} height={62} />
//             <Text style={styles.emptyText}>Kitchen Clear</Text>
//           </View>
//         }
//       />
//     </MainLayout>
//   );
// };
// const styles = StyleSheet.create({
//   refreshBtn: {
//     padding: 8,
//     marginRight: 4,
//     backgroundColor: '#f1f5f9',
//     borderRadius: 24,
//   },
//   // If you want a simple rotation while refreshing
//   rotating: {
//     opacity: 0.5,
//     transform: [{rotate: '45deg'}],
//   },
//   listPadding: {padding: 6},
//   columnWrapper: {
//     justifyContent: 'space-between',
//     paddingHorizontal: 4,
//   },
//   card: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     marginBottom: 12,
//     padding: 10,
//     borderLeftWidth: 5,
//     elevation: 4,
//     width: '49%', // Slightly wider to reduce gap
//     minHeight: 280, // Keep cards consistent
//   },
//   borderPending: {borderLeftColor: '#f59e0b'},
//   borderCooking: {borderLeftColor: '#3b82f6'},
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 8,
//     gap: 4,
//   },
//   headerLeft: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: 6,
//     flex: 1, // This forces the left side to take available space
//   },
//   tableInfoContainer: {
//     flex: 1,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   orderNumberText: {
//     fontSize: 10,
//     fontWeight: 'bold',
//     color: '#64748b',
//     backgroundColor: '#f1f5f9',
//     paddingHorizontal: 4,
//     borderRadius: 4,
//   },
//   iconBox: {
//     width: 20,
//     height: 20,
//     borderRadius: 4,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 2,
//   },
//   bgPending: {backgroundColor: '#f59e0b'},
//   bgCooking: {backgroundColor: '#059669'},
//   tableNum: {
//     fontSize: 11,
//     fontWeight: '900',
//     color: '#1e293b',
//     flexShrink: 1, // Prevents pushing the badge out
//   },
//   orderTime: {fontSize: 10, color: '#94a3b8'},
//   badge: {
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//     alignSelf: 'flex-start',
//   },
//   badgeWait: {
//     backgroundColor: '#fef3c7',
//     borderWidth: 1,
//     borderColor: '#fcd34d',
//   },
//   badgeCook: {backgroundColor: '#059669'},
//   badgeText: {fontSize: 9, fontWeight: 'bold'},
//   badgeWaitText: {color: '#92400e'},
//   badgeCookText: {color: '#fff'},

//   itemsScrollView: {
//     flex: 1,
//     maxHeight: 180,
//     marginVertical: 4,
//   },
//   itemsList: {paddingBottom: 5},
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 6,
//     borderRadius: 8,
//     marginBottom: 4,
//   },
//   itemPending: {
//     backgroundColor: '#fff7ed',
//     borderWidth: 0.5,
//     borderColor: '#ffedd5',
//   },
//   itemActive: {backgroundColor: '#f8fafc'},
//   itemInfo: {flexDirection: 'row', gap: 6, flex: 1},
//   itemQty: {fontSize: 11, fontWeight: '900', color: '#64748b'},
//   itemName: {
//     fontSize: 10,
//     fontWeight: 'bold',
//     color: '#0f172a',
//     textTransform: 'uppercase',
//   },
//   itemStatus: {fontSize: 8, color: '#94a3b8', textTransform: 'lowercase'},
//   TickBtn: {
//     backgroundColor: '#fff',
//     padding: 4,
//     borderRadius: 12,
//     elevation: 2,
//     marginLeft: 4,
//   },
//   footerBtn: {
//     padding: 10,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   btnPrint: {backgroundColor: '#1e293b'},
//   btnReady: {backgroundColor: '#059669'},
//   footerBtnText: {color: 'white', fontWeight: 'bold', fontSize: 11},
//   emptyContainer: {alignItems: 'center', marginTop: 100},
//   emptyText: {marginTop: 12, fontSize: 24, color: '#94a3b8', fontWeight: '600'},
// });

// // const styles = StyleSheet.create({
// //   listPadding: {padding: 8},
// //   columnWrapper: {
// //     justifyContent: 'space-between', // Spreads the 2 cards to the edges
// //     paddingHorizontal: 8,
// //   },
// //   card: {
// //     backgroundColor: 'white',
// //     borderRadius: 12, // Slightly smaller radius looks better in grids
// //     marginBottom: 16,
// //     padding: 12,
// //     borderLeftWidth: 4,
// //     elevation: 3,
// //     shadowColor: '#000',
// //     shadowOpacity: 0.1,
// //     shadowRadius: 5,
// //     // maxHeight: 70,

// //     // Grid Math: (100% / 2 columns) - (margin/gap)
// //     width: '48%',
// //   },
// //   borderPending: {borderLeftColor: '#f59e0b'},
// //   borderCooking: {borderLeftColor: '#3b82f6'},
// //   cardHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 12,
// //   },
// //   headerLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
// //   iconBox: {
// //     width: 24,
// //     height: 24,
// //     borderRadius: 6,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   bgPending: {backgroundColor: '#f59e0b'},
// //   bgCooking: {backgroundColor: '#059669'},
// //   tableNum: {
// //     fontSize: 12, // Smaller for 2-column
// //     fontWeight: '900',
// //     color: '#1e293b',
// //   },
// //   orderTime: {fontSize: 11, color: '#64748b'},
// //   badge: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6},
// //   badgeWait: {
// //     backgroundColor: '#fef3c7',
// //     borderWidth: 1,
// //     borderColor: '#fcd34d',
// //   },
// //   badgeWaitText: {
// //     color: '#111',
// //   },
// //   badgeCookText: {
// //     color: '#fff',
// //   },

// //   badgeCook: {backgroundColor: '#059669'},
// //   badgeText: {fontSize: 8, fontWeight: 'bold', color: '#f3f3f3'},
// //   itemsScrollView: {
// //     // This is the magic part:
// //     maxHeight: 210, // Limits the list height
// //     marginVertical: 8,
// //   },
// //   itemsList: {marginVertical: 10},
// //   itemRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     padding: 8,
// //     borderRadius: 10,
// //     marginBottom: 6,
// //   },
// //   itemPending: {
// //     backgroundColor: '#fff7ed',
// //     borderWidth: 1,
// //     borderColor: '#ffedd5',
// //   },
// //   itemActive: {backgroundColor: '#f8fafc'},
// //   itemInfo: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 2, // Reduced gap
// //     flex: 1,
// //   },
// //   itemQty: {fontSize: 12, fontWeight: '900', color: '#94a3b8'},
// //   itemName: {
// //     fontSize: 10, // Smaller font
// //     fontWeight: 'bold',
// //     color: '#0f172a',
// //     textTransform: 'uppercase',
// //     flexShrink: 1, // Prevent text overflow
// //   },
// //   itemNameRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     flexWrap: 'wrap',
// //   },
// //   itemNote: {
// //     fontSize: 10,
// //     fontStyle: 'italic',
// //     color: '#d97706', // Amber/Orange color to stand out
// //     fontWeight: '600',
// //     marginTop: 2,
// //     backgroundColor: '#fffbeb', // Light yellow background for the note
// //     paddingHorizontal: 4,
// //     borderRadius: 4,
// //     alignSelf: 'flex-start',
// //   },
// //   // Update itemName to ensure it doesn't push the flame icon out
// //   // itemName: {
// //   //   fontSize: 12,
// //   //   fontWeight: 'bold',
// //   //   color: '#0f172a',
// //   //   textTransform: 'uppercase',
// //   // },
// //   itemStatus: {fontSize: 9, color: '#64748b'},
// //   footerBtn: {
// //     flexDirection: 'row',
// //     padding: 12,
// //     borderRadius: 10,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     gap: 8,
// //     marginTop: 10,
// //   },
// //   TickBtn: {
// //     backgroundColor: '#fff',
// //     padding: 2,
// //     borderRadius: 50,
// //   },
// //   btnPrint: {backgroundColor: '#1e293b'},
// //   btnReady: {backgroundColor: '#059669'},
// //   footerBtnText: {
// //     color: 'white',
// //     fontWeight: 'bold',
// //     fontSize: 12,
// //     letterSpacing: 1,
// //   },
// //   emptyContainer: {alignItems: 'center', marginTop: 100},
// //   emptyText: {marginTop: 12, fontSize: 18, color: '#94a3b8', fontWeight: '600'},
// // });

// export default KitchenDashboard;

import React, {useEffect, useState, useMemo} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import MainLayout from '../MainLayout';

import {io} from 'socket.io-client';
import api from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {socket} from '../../services/socketService';
import RoomIcon from '../../assets/Icons/housesvg.svg';
import ChairIcon from '../../assets/Icons/chair.svg';
import TickIcon from '../../assets/Icons/tick-svgrepo-com.svg';
import ProfileIcon from '../../assets/Icons/profile.svg';
import EmptyIcon from '../../assets/Icons/empty-svgrepo-com.svg';

import swiggyColors from '../../assets/Color/swiggyColor';
import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';

// Use your actual IP, not localhost for physical devices
// Use your actual IP, not localhost for physical devices

import Svg, {Path} from 'react-native-svg';
import PrinterStatusHeader from '../PrinterSettings/PrinterStatusHeader';

const RefreshIcon = ({width, height, fill, style}: any) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    style={style}>
    <Path
      d="M1 4v6h6M23 20v-6h-6"
      stroke={fill}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"
      stroke={fill}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const KitchenDashboard = ({navigation}: any) => {
  const [rawItems, setRawItems] = useState([]);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [printStatus, setPrintStatus] = useState<{
    [key: string]: 'idle' | 'printing' | 'failed';
  }>({});
  const fetchKitchenQueue = async () => {
    try {
      const res = await api.get('/orders/kitchen/pending');
      console.log('res.data', res.data);
      setRawItems(res.data);
    } catch (err) {
      console.error('Error fetching kitchen queue:', err);
    }
  };

  const printKOT = async (order: any) => {
    try {
      const divider = '--------------------------------\n';
      const maxNameLength = 26;

      // 1. Date and Time Extraction
      // Using the createdAt from the first item in the list
      const orderDateObj = order.items?.[0]?.createdAt
        ? new Date(order.items[0].createdAt)
        : new Date();

      const dateStr = orderDateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY
      const timeStr = orderDateObj.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      // 2. Data Extraction from JSON structure
      // Since all items in this group belong to the same orderId,
      // we pull order-level info from the first item's order object.
      const parentOrder = order?.items?.[0]?.order || {};
      const oNumber = parentOrder?.orderNumber || '-';
      const tNumber = parentOrder?.table?.number || order?.tableNumber || '-';
      const waiterName = parentOrder?.waiter?.name || 'Staff';
      const orderNote = parentOrder?.note || '';

      let ticket = '';

      // Header - Token and Order Info
      ticket += `<C>KOT: #${oNumber}</C>\n`;
      ticket += divider;
      ticket += `DATE: ${dateStr}  ${timeStr}\n`;
      ticket += `WAITER: ${waiterName.toUpperCase()}\n`;
      ticket += `TABLE: ${tNumber}\n`;
      ticket += divider;

      ticket += `QTY  ITEM\n`;
      ticket += divider;

      // 3. Items Logic
      const itemsText = order?.items
        ?.map((item: any) => {
          const qty = item.quantity.toString().padEnd(5, ' ');
          const name = item?.menuItem?.name || 'ITEM';
          const spicy = item.isSpicy ? ' (Spicy)' : '';
          const fullName = name + spicy;

          if (fullName.length <= maxNameLength) {
            return `${qty}${fullName}`;
          }

          // Word wrap for long item names
          const firstLine = `${qty}${fullName.substring(0, maxNameLength)}`;
          const rest = fullName.substring(maxNameLength);
          return `${firstLine}\n     ${rest}`;
        })
        .join('\n');

      ticket += itemsText || '';
      ticket += `\n${divider}`;

      // 4. Note Section (Now correctly checking parentOrder.note)
      if (orderNote.trim() !== '') {
        ticket += `NOTE: ${orderNote.toUpperCase()}\n`;
        ticket += divider;
      }

      // Space for manual tear
      ticket += `\n\n\n`;

      await BLEPrinter.printText(ticket);
    } catch (err) {
      console.error('Print failed:', err);
      Toast.show({
        type: 'error',
        text1: 'Printer Error',
        text2: 'Check connection and paper',
      });
    }
  };

  // const printKOT = async (order: any) => {
  //   try {
  //     const divider = '--------------------------------\n';
  //     const maxNameLength = 26; // Reduced slightly for safety on 58mm
  //     const orderDateObj = order.items?.[0]?.createdAt
  //       ? new Date(order.items[0].createdAt)
  //       : new Date();

  //     // 1. Time Formatting
  //     const now = new Date();
  //     const hours = now.getHours();
  //     const minutes = now.getMinutes().toString().padStart(2, '0');
  //     const ampm = hours >= 12 ? 'PM' : 'AM';
  //     const hour12 = hours % 12 || 12;
  //     const timeStr = `${hour12}:${minutes} ${ampm}`;

  //     // 2. Extract Data Safely
  //     // Based on your JSON, orderNumber is inside items[0].order
  //     const orderData = order?.items?.[0]?.order || {};
  //     const oNumber = orderData?.orderNumber || order?.orderNumber || '-';
  //     const tNumber = order?.tableNumber || '-';
  //     const orderNote = orderData?.note || order?.note || '';

  //     let ticket = '';

  //     // Header - Clean & Professional
  //     ticket += `<C><B>ORDER #${oNumber}</B></C>\n`; // Big Token Number
  //     ticket += divider;

  //     // Table/Room name can be long, so we keep it on its own line
  //     ticket += `TABLE : ${tNumber}\n`;
  //     ticket += `TIME: ${timeStr}\n`;
  //     ticket += divider;

  //     ticket += `QTY  ITEM\n`;
  //     ticket += divider;

  //     // 3. Items Logic
  //     const itemsText = order?.items
  //       ?.map((item: any) => {
  //         const qty = item.quantity.toString().padEnd(5, ' ');
  //         const name = item?.menuItem?.name || 'ITEM';
  //         const spicy = item.isSpicy ? ' (Spicy)' : '';
  //         const fullName = name + spicy;

  //         if (fullName.length <= maxNameLength) {
  //           return `${qty}${fullName}`;
  //         }

  //         // Wrap long names properly so they don't break columns
  //         const firstLine = `${qty}${fullName.substring(0, maxNameLength)}`;
  //         const rest = fullName.substring(maxNameLength);
  //         return `${firstLine}\n     ${rest}`;
  //       })
  //       .join('\n');

  //     ticket += itemsText || '';
  //     ticket += `\n${divider}`;

  //     // 4. Centered Note Section
  //     if (orderNote.trim() !== '') {
  //       ticket += `NOTE: ${orderNote}\n`;
  //       ticket += divider;
  //     }

  //     // Space for manual tear
  //     ticket += `\n\n`;

  //     await BLEPrinter.printText(ticket);
  //   } catch (err) {
  //     console.error('Print failed:', err);
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Printer Error',
  //       text2: 'Check connection and paper',
  //     });
  //   }
  // };
  // --- LOGIC PRESERVED FROM NEXT.JS ---
  const groupedOrders = useMemo(() => {
    const groups: {[key: string]: any} = {};
    rawItems.forEach((item: any) => {
      const orderId = item.orderId;
      if (!groups[orderId]) {
        const parentOrder = item.order;
        groups[orderId] = {
          id: orderId,
          tableNumber:
            parentOrder?.table?.number ||
            (parentOrder?.roomId
              ? `Room ${parentOrder.roomId.slice(0, 4)}`
              : 'N/A'),
          createdAt: parentOrder?.createdAt,
          roomId: parentOrder?.roomId,
          items: [],
        };
      }
      groups[orderId].items.push(item);
    });

    return Object.values(groups).sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [rawItems]);

  useEffect(() => {
    fetchKitchenQueue();
    const handleNewOrder = async (data: any) => {
      console.log('🔥 SOCKET EVENT RECEIVED:', data);

      fetchKitchenQueue();

      const orderToPrint = {
        id: data.id,
        tableNumber: data?.table?.number || 'N/A',
        createdAt: data.createdAt,

        // ✅ IMPORTANT: attach order inside each item
        items: (data.items || []).map((item: any) => ({
          ...item,
          status: 'PENDING', // 🔥 FORCE PRINT
          order: data, // 🔥 VERY IMPORTANT FIX
        })),
      };

      // ✅ DIRECT PRINT (bypass handlePrintKOT)
      setTimeout(async () => {
        console.log('🖨️ AUTO PRINT TRIGGERED');
        await printKOT(orderToPrint);
      }, 500);
    };

    // const handleNewOrder = async (data: any) => {
    //   console.log('🔥 SOCKET EVENT RECEIVED:', data);
    //   // 1. Refresh the list so the UI stays in sync
    //   fetchKitchenQueue();

    //   // 2. UI Notification
    //   const tableNum = data?.table?.number || 'N/A';
    //   const orderNo = data?.orderNumber ? `#${data.orderNumber}` : '';

    //   Toast.show({
    //     type: 'success',
    //     text1: `Order ${orderNo} Received!`,
    //     text2: `Table: ${tableNum}`,
    //     position: 'top',
    //     visibilityTime: 4000,
    //   });

    //   // 3. AUTO-PRINT LOGIC
    //   // We wrap this in a small delay or check to ensure
    //   // the data structure matches what handlePrintKOT expects
    //   if (data && data.items) {
    //     console.log('Auto-printing KOT for Order:', data.orderNumber);

    //     // Map the incoming socket data to the structure your printer expects
    //     const orderToPrint = {
    //       ...data,
    //       tableNumber: tableNum,
    //       id: data.id || data._id || `temp-${Date.now()}`, // Fallback ID
    //       // Ensure items have the expected structure for the print function
    //       items: data.items.map((it: any) => ({
    //         ...it,
    //         status: it.status || 'PENDING',
    //       })),
    //     };

    //     // await handlePrintKOT(orderToPrint);
    //     await printKOT(orderToPrint);
    //   }
    // };

    socket.on('kitchenUpdate', handleNewOrder);

    return () => {
      socket.off('kitchenUpdate', handleNewOrder);
    };
  }, []);
  const handleMarkItemReady = async (itemId: string) => {
    try {
      await api.patch(`/orders/item/${itemId}/status`, {status: 'READY'});
      Toast.show({
        type: 'success',
        text1: `Waiter is notified`,
        // text2: 'The kitchen has received your order.',
        position: 'top',
        topOffset: 50,
        // Pass custom data here
        props: {
          backgroundColor: swiggyColors.textPrimary,
        },
      });
      fetchKitchenQueue();
    } catch (err) {
      Toast.show({type: 'error', text1: 'Failed to update status'});
    }
  };

  const handlePrintKOT = async (order: any) => {
    const orderId = order.id || order._id;
    if (!orderId) return;

    setPrintStatus(prev => ({...prev, [orderId]: 'printing'}));

    try {
      const itemsToPrint = order.items.filter(
        (item: any) =>
          item.status === 'PENDING' &&
          item.menuItem?.requiresPreparation === true,
      );

      if (itemsToPrint.length === 0) {
        setPrintStatus(prev => ({...prev, [orderId]: 'idle'}));
        return;
      }

      await printKOT({...order, items: itemsToPrint});

      await Promise.all(
        itemsToPrint.map((item: any) =>
          api.patch(`/orders/item/${item.id || item._id}/status`, {
            status: 'PREPARING',
          }),
        ),
      );

      // Refresh the list to show "PREPARING" (COOK) status
      fetchKitchenQueue();
    } catch (err) {
      console.error('Print failed:', err);
      setPrintStatus(prev => ({...prev, [orderId]: 'failed'}));
      Toast.show({
        type: 'error',
        text1: 'Printer Disconnected',
        text2: 'Please check Bluetooth and tap Retry.',
      });
    } finally {
      // This ensures that even if it fails, it doesn't stay on "PRINTING..."
      // If it failed, the 'catch' block already set it to 'failed',
      // so we only set to 'idle' if it's not 'failed'.
      setPrintStatus(prev => {
        if (prev[orderId] === 'printing') {
          return {...prev, [orderId]: 'idle'};
        }
        return prev;
      });
    }
  };

  // const handlePrintKOT = async (order: any) => {
  //   const orderId = order.id || order._id;

  //   // Set status to printing
  //   setPrintStatus(prev => ({...prev, [orderId]: 'printing'}));

  //   try {
  //     const itemsToPrint = order.items.filter(
  //       (item: any) =>
  //         item.status === 'PENDING' &&
  //         item.menuItem?.requiresPreparation === true,
  //     );
  //     if (itemsToPrint.length === 0) return;

  //     // 1. Attempt Physical Print
  //     await printKOT({...order, items: itemsToPrint});

  //     // 2. Success: Update DB status to PREPARING
  //     await Promise.all(
  //       itemsToPrint.map((item: any) =>
  //         api.patch(`/orders/item/${item.id || item._id}/status`, {
  //           status: 'PREPARING',
  //         }),
  //       ),
  //     );

  //     setPrintStatus(prev => ({...prev, [orderId]: 'idle'}));
  //     fetchKitchenQueue();
  //   } catch (err) {
  //     console.error('Print failed:', err);
  //     // 3. Failure: Set status to failed so UI can show a Retry button
  //     setPrintStatus(prev => ({...prev, [orderId]: 'failed'}));

  //     Toast.show({
  //       type: 'error',
  //       text1: 'Printer Disconnected',
  //       text2: 'Please check Bluetooth and tap Retry.',
  //       autoHide: false, // Keep it visible until they acknowledge
  //     });
  //   }
  // };

  const handleMarkEntireOrderReady = async (order: any) => {
    try {
      const updatePromises = order.items
        .filter(
          (item: any) => item.status !== 'READY' && item.status !== 'SERVED',
        )
        .map((item: any) =>
          api.patch(`/orders/item/${item.id}/status`, {status: 'READY'}),
        );

      if (updatePromises.length === 0) return;
      await Promise.all(updatePromises);
      Toast.show({
        type: 'success',
        text1: `Table ${order.tableNumber} Ready!`,
        position: 'top',
      });
      fetchKitchenQueue();
    } catch (err) {
      Toast.show({type: 'error', text1: 'Failed to mark ready'});
    }
  };

  // Render Component for Ticket Card
  // Inside renderOrderTicket
  const renderOrderTicket = ({item: order}: {item: any}) => {
    const status = printStatus[order.id] || 'idle';
    const hasPendingItems = order.items.some(
      (i: any) => i.status === 'PENDING',
    );
    const orderTime = order.createdAt
      ? new Date(order.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '--:--';

    return (
      <View
        style={[
          styles.card,
          hasPendingItems ? styles.borderPending : styles.borderCooking,
        ]}>
        {/* HEADER SECTION */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.iconBox,
                hasPendingItems ? styles.bgPending : styles.bgCooking,
              ]}>
              {order.roomId ? (
                <RoomIcon height={12} width={12} fill={'#fff'} />
              ) : (
                <ChairIcon height={12} width={12} />
              )}
            </View>
            <View style={styles.tableInfoContainer}>
              <View style={styles.row}>
                {/* <Text style={styles.orderNumberText}>
                  #{order.items[0]?.order?.orderNumber || '0'}
                </Text> */}
                <Text style={styles.tableNum} numberOfLines={2}>
                  {order.tableNumber}
                </Text>
              </View>
              <Text style={styles.orderTime}>{orderTime}</Text>
            </View>
          </View>

          <View
            style={[
              styles.badge,
              hasPendingItems ? styles.badgeWait : styles.badgeCook,
            ]}>
            <Text
              style={[
                styles.badgeText,
                hasPendingItems ? styles.badgeWaitText : styles.badgeCookText,
              ]}>
              {hasPendingItems ? 'WAIT' : 'COOK'}
            </Text>
          </View>
        </View>

        {/* ITEMS LIST */}
        <ScrollView
          style={styles.itemsScrollView}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}>
          <View style={styles.itemsList}>
            {order.items.map((item: any) => (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  item.status === 'PENDING'
                    ? styles.itemPending
                    : styles.itemActive,
                ]}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemQty}>{item.quantity}×</Text>
                  <View style={{flex: 1}}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.menuItem?.name} {item.isSpicy && <Text>🌶️</Text>}
                    </Text>
                    <Text style={styles.itemStatus}>{item.status}</Text>
                  </View>
                </View>

                {item.status === 'PREPARING' && (
                  <TouchableOpacity
                    style={styles.TickBtn}
                    onPress={() => handleMarkItemReady(item.id)}>
                    <TickIcon height={16} width={16} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* ACTION BUTTON */}
        <TouchableOpacity
          style={[
            styles.footerBtn,
            status === 'failed'
              ? {backgroundColor: '#ef4444'}
              : hasPendingItems
              ? styles.btnPrint
              : styles.btnReady,
          ]}
          onPress={() =>
            hasPendingItems || status === 'failed'
              ? handlePrintKOT(order)
              : handleMarkEntireOrderReady(order)
          }
          disabled={status === 'printing'}>
          <Text style={styles.footerBtnText}>
            {status === 'printing'
              ? 'PRINTING...'
              : status === 'failed'
              ? 'RETRY PRINT'
              : hasPendingItems
              ? 'PRINT KOT'
              : 'MARK READY'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchKitchenQueue();
    setRefreshing(false);
  };

  return (
    <MainLayout
      title="Kitchen Queue"
      rightComponent={
        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileScreenBms')}
          style={styles.refreshBtn}
          activeOpacity={0.7}>
          <ProfileIcon width={22} height={22} />
        </TouchableOpacity>
      }
      subtitle={<PrinterStatusHeader />}
      leftComponent={
        <TouchableOpacity
          onPress={onRefresh}
          style={styles.refreshBtn}
          activeOpacity={0.7}>
          <RefreshIcon
            width={22}
            height={22}
            fill="#1e293b"
            style={refreshing ? styles.rotating : null}
          />
        </TouchableOpacity>
      }>
      <FlatList
        data={groupedOrders}
        renderItem={renderOrderTicket}
        numColumns={2} // <--- Add this
        key={'_'}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.listPadding}
        columnWrapperStyle={styles.columnWrapper}
        refreshing={refreshing}
        // onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyIcon width={62} height={62} />
            <Text style={styles.emptyText}>Kitchen Clear</Text>
          </View>
        }
      />
    </MainLayout>
  );
};
const styles = StyleSheet.create({
  refreshBtn: {
    padding: 8,
    marginRight: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
  },
  // If you want a simple rotation while refreshing
  rotating: {
    opacity: 0.5,
    transform: [{rotate: '45deg'}],
  },
  listPadding: {padding: 6},
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 12,
    padding: 10,
    borderLeftWidth: 5,
    elevation: 4,
    width: '49%', // Slightly wider to reduce gap
    minHeight: 280, // Keep cards consistent
  },
  borderPending: {borderLeftColor: '#f59e0b'},
  borderCooking: {borderLeftColor: '#3b82f6'},
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    flex: 1, // This forces the left side to take available space
  },
  tableInfoContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderNumberText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  iconBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  bgPending: {backgroundColor: '#f59e0b'},
  bgCooking: {backgroundColor: '#059669'},
  tableNum: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1e293b',
    flexShrink: 1, // Prevents pushing the badge out
  },
  orderTime: {fontSize: 10, color: '#94a3b8'},
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeWait: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  badgeCook: {backgroundColor: '#059669'},
  badgeText: {fontSize: 9, fontWeight: 'bold'},
  badgeWaitText: {color: '#92400e'},
  badgeCookText: {color: '#fff'},

  itemsScrollView: {
    flex: 1,
    maxHeight: 180,
    marginVertical: 4,
  },
  itemsList: {paddingBottom: 5},
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
    marginBottom: 4,
  },
  itemPending: {
    backgroundColor: '#fff7ed',
    borderWidth: 0.5,
    borderColor: '#ffedd5',
  },
  itemActive: {backgroundColor: '#f8fafc'},
  itemInfo: {flexDirection: 'row', gap: 6, flex: 1},
  itemQty: {fontSize: 11, fontWeight: '900', color: '#64748b'},
  itemName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  itemStatus: {fontSize: 8, color: '#94a3b8', textTransform: 'lowercase'},
  TickBtn: {
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 12,
    elevation: 2,
    marginLeft: 4,
  },
  footerBtn: {
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  btnPrint: {backgroundColor: '#1e293b'},
  btnReady: {backgroundColor: '#059669'},
  footerBtnText: {color: 'white', fontWeight: 'bold', fontSize: 11},
  emptyContainer: {alignItems: 'center', marginTop: 100},
  emptyText: {marginTop: 12, fontSize: 24, color: '#94a3b8', fontWeight: '600'},
});

export default KitchenDashboard;
