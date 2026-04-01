// src/services/kitchenBackgroundService.ts
import BackgroundActions from 'react-native-background-actions';
import {socket} from './socketService';
import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';
import api from './axiosInstance';

// -------------------------------------------------------------------
// PRINT LOGIC (decoupled from the component)
// -------------------------------------------------------------------
const printKOT = async (order: any) => {
  const divider = '--------------------------------\n';
  const maxNameLength = 26;

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const timeStr = `${hour12}:${minutes} ${ampm}`;

  const orderData = order?.items?.[0]?.order || {};
  const oNumber = orderData?.orderNumber || order?.orderNumber || '-';
  const tNumber = order?.tableNumber || '-';
  const orderNote = orderData?.note || order?.note || '';

  let ticket = '';
  ticket += `<C><B>ORDER #${oNumber}</B></C>\n`;
  ticket += divider;
  ticket += `TABLE : ${tNumber}\n`;
  ticket += `TIME: ${timeStr}\n`;
  ticket += divider;
  ticket += `QTY  ITEM\n`;
  ticket += divider;

  const itemsText = order?.items
    ?.map((item: any) => {
      const qty = item.quantity.toString().padEnd(5, ' ');
      const name = item?.menuItem?.name || 'ITEM';
      const spicy = item.isSpicy ? ' (Spicy)' : '';
      const fullName = name + spicy;

      if (fullName.length <= maxNameLength) {
        return `${qty}${fullName}`;
      }
      const firstLine = `${qty}${fullName.substring(0, maxNameLength)}`;
      const rest = fullName.substring(maxNameLength);
      return `${firstLine}\n     ${rest}`;
    })
    .join('\n');

  ticket += itemsText || '';
  ticket += `\n${divider}`;

  if (orderNote.trim() !== '') {
    ticket += `NOTE: ${orderNote}\n`;
    ticket += divider;
  }
  ticket += `\n\n`;

  await BLEPrinter.printText(ticket);
};

// -------------------------------------------------------------------
// AUTO-PRINT HANDLER — called on every kitchenUpdate socket event
// -------------------------------------------------------------------
const handleAutoPrint = async (data: any) => {
  try {
    if (!data?.items?.length) return;

    const tableNum = data?.table?.number || 'N/A';
    const itemsToPrint = data.items.filter(
      (item: any) => item.status === 'PENDING',
    );

    if (itemsToPrint.length === 0) return;

    const orderToPrint = {
      ...data,
      tableNumber: tableNum,
      items: itemsToPrint.map((it: any) => ({
        ...it,
        status: it.status || 'PENDING',
      })),
    };

    // 1. Print physically
    await printKOT(orderToPrint);

    // 2. Update DB: PENDING → PREPARING
    await Promise.all(
      itemsToPrint.map((item: any) =>
        api.patch(`/orders/item/${item.id || item._id}/status`, {
          status: 'PREPARING',
        }),
      ),
    );
  } catch (err) {
    console.error('[BG] Auto-print failed:', err);
  }
};

// -------------------------------------------------------------------
// BACKGROUND TASK — heartbeat keeps the JS thread alive
// -------------------------------------------------------------------
const kitchenTask = async (_taskData: any) => {
  // Re-connect socket if it dropped
  if (!socket.connected) {
    socket.connect();
  }

  // Register listener (clear first to avoid duplicates)
  socket.off('kitchenUpdate', handleAutoPrint);
  socket.on('kitchenUpdate', handleAutoPrint);

  // Heartbeat: BackgroundActions requires an async Promise that resolves
  // only when the task should stop.
  await new Promise<void>(resolve => {
    const interval = setInterval(() => {
      // Reconnect socket if it went away while we were in the background
      if (!socket.connected) {
        socket.connect();
      }

      if (!BackgroundActions.isRunning()) {
        socket.off('kitchenUpdate', handleAutoPrint);
        clearInterval(interval);
        resolve();
      }
    }, 10_000); // check every 10 s
  });
};

// -------------------------------------------------------------------
// NOTIFICATION / TASK OPTIONS
// -------------------------------------------------------------------
const backgroundOptions = {
  taskName: 'KitchenQueue',
  taskTitle: 'Kitchen Queue Active',
  taskDesc: 'Listening for new orders and auto-printing KOTs.',
  taskIcon: {
    name: 'ic_launcher', // must exist in android/app/src/main/res/mipmap-*
    type: 'mipmap',
  },
  color: '#f97316',
  linkingURI: 'yourapp://kitchen', // optional deep-link back to the screen
  parameters: {},
};

// -------------------------------------------------------------------
// PUBLIC API — call these from KitchenDashboard
// -------------------------------------------------------------------
export const startKitchenBackgroundService = async () => {
  if (BackgroundActions.isRunning()) return;
  await BackgroundActions.start(kitchenTask, backgroundOptions);
  console.log('[BG] Kitchen background service started');
};

export const stopKitchenBackgroundService = async () => {
  socket.off('kitchenUpdate', handleAutoPrint);
  await BackgroundActions.stop();
  console.log('[BG] Kitchen background service stopped');
};
