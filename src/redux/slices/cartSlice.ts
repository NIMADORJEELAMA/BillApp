import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  isSpicy: boolean;
}

interface CartState {
  items: {[key: string]: CartItem};
}

const initialState: CartState = {
  items: {},
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    updateCartQuantity: (
      state,
      action: PayloadAction<{item: any; delta: number; toggleSpicy?: boolean}>,
    ) => {
      const {item, delta, toggleSpicy} = action.payload;

      if (!item) return;

      const existingItem = state.items[item.id];

      if (existingItem) {
        // CASE 1: Toggle Spicy Preference
        if (toggleSpicy) {
          existingItem.isSpicy = !existingItem.isSpicy;
          return; // Exit early after toggling
        }

        // CASE 2: Update Quantity
        const newQty = existingItem.quantity + delta;
        if (newQty <= 0) {
          delete state.items[item.id];
        } else {
          existingItem.quantity = newQty;
        }
      } else if (delta > 0) {
        // CASE 3: Add New Item to Cart
        state.items[item.id] = {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          isVeg: item.isVeg,
          isSpicy: false, // Default value for new items
        };
      }
    },
    clearCart: state => {
      state.items = {};
    },
  },
});

// const cartSlice = createSlice({
//   name: 'cart',
//   initialState,
//   reducers: {
//     updateCartQuantity: (
//       state,
//       action: PayloadAction<{item: any; delta: number; toggleSpicy: boolean}>,
//     ) => {
//       const {item, delta, toggleSpicy} = action.payload; // Extracting item and delta from payload

//       if (!item) return; // Guard clause

//       const existingItem = state.items[item.id];

//       if (existingItem) {
//         const newQty = existingItem.quantity + delta;
//         if (newQty <= 0) {
//           delete state.items[item.id];
//         } else {
//           state.items[item.id].quantity = newQty;
//         }
//       } else if (delta > 0) {
//         state.items[item.id] = {
//           id: item.id,
//           name: item.name,
//           price: item.price,
//           quantity: 1,
//           isVeg: item.isVeg,
//         };
//       }
//     },
//     clearCart: state => {
//       state.items = {};
//     },
//   },
// });

export const {updateCartQuantity, clearCart} = cartSlice.actions;
export default cartSlice.reducer;
