import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  stock: number;
  lineDiscount?: number; // Add this
  taxRate?: number; // Add this
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
          lineDiscount: 0, // Initialize
          taxRate: 0,
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
    // Add/Update this in your cartSlice.js
    updateItemDetails: (state, action) => {
      const {id, updates} = action.payload;
      const item = state.items.find(i => i.productId === id);
      if (item) {
        // Updates could be { price: 100, lineDiscount: 10, taxRate: 18 }
        Object.assign(item, updates);
      }
    },
  },
});

export const {addToCart, updateQty, setDiscount, clearCart, updateItemDetails} =
  cartSlice.actions;
export default cartSlice.reducer;
