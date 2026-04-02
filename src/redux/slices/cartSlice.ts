// import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   isVeg: boolean;
//   isSpicy: boolean;
// }

// interface CartState {
//   items: {[key: string]: CartItem};
// }

// const initialState: CartState = {
//   items: {},
// };

// const cartSlice = createSlice({
//   name: 'cart',
//   initialState,
//   reducers: {
//     updateCartQuantity: (
//       state,
//       action: PayloadAction<{item: any; delta: number; toggleSpicy?: boolean}>,
//     ) => {
//       const {item, delta, toggleSpicy} = action.payload;

//       if (!item) return;

//       const existingItem = state.items[item.id];

//       if (existingItem) {
//         // CASE 1: Toggle Spicy Preference
//         if (toggleSpicy) {
//           existingItem.isSpicy = !existingItem.isSpicy;
//           return; // Exit early after toggling
//         }

//         // CASE 2: Update Quantity
//         const newQty = existingItem.quantity + delta;
//         if (newQty <= 0) {
//           delete state.items[item.id];
//         } else {
//           existingItem.quantity = newQty;
//         }
//       } else if (delta > 0) {
//         // CASE 3: Add New Item to Cart
//         state.items[item.id] = {
//           id: item.id,
//           name: item.name,
//           price: item.price,
//           quantity: 1,
//           isVeg: item.isVeg,
//           isSpicy: false, // Default value for new items
//         };
//       }
//     },
//     clearCart: state => {
//       state.items = {};
//     },
//   },
// });

// // const cartSlice = createSlice({
// //   name: 'cart',
// //   initialState,
// //   reducers: {
// //     updateCartQuantity: (
// //       state,
// //       action: PayloadAction<{item: any; delta: number; toggleSpicy: boolean}>,
// //     ) => {
// //       const {item, delta, toggleSpicy} = action.payload; // Extracting item and delta from payload

// //       if (!item) return; // Guard clause

// //       const existingItem = state.items[item.id];

// //       if (existingItem) {
// //         const newQty = existingItem.quantity + delta;
// //         if (newQty <= 0) {
// //           delete state.items[item.id];
// //         } else {
// //           state.items[item.id].quantity = newQty;
// //         }
// //       } else if (delta > 0) {
// //         state.items[item.id] = {
// //           id: item.id,
// //           name: item.name,
// //           price: item.price,
// //           quantity: 1,
// //           isVeg: item.isVeg,
// //         };
// //       }
// //     },
// //     clearCart: state => {
// //       state.items = {};
// //     },
// //   },
// // });

// export const {updateCartQuantity, clearCart} = cartSlice.actions;
// export default cartSlice.reducer;

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  discount: number;
}

const initialState: CartState = {
  items: [],
  discount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<any>) => {
      const product = action.payload;
      const existing = state.items.find(item => item.productId === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({
          productId: product.id,
          name: product.name,
          quantity: 1,
          price: parseFloat(product.price) || 0,
          stock: product.stockQty || 0,
        });
      }
    },
    updateQty: (state, action: PayloadAction<{id: string; delta: number}>) => {
      const item = state.items.find(i => i.productId === action.payload.id);
      if (item) {
        item.quantity = Math.max(0, item.quantity + action.payload.delta);
      }
      state.items = state.items.filter(i => i.quantity > 0);
    },
    setDiscount: (state, action: PayloadAction<number>) => {
      state.discount = action.payload;
    },
    clearCart: state => {
      state.items = [];
      state.discount = 0;
    },
  },
});

export const {addToCart, updateQty, setDiscount, clearCart} = cartSlice.actions;
export default cartSlice.reducer;
