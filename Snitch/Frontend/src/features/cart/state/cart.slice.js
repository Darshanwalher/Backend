import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name:"cart",
    initialState:{
        items:[],
    },
    reducers:{
        setItems:(state,action)=>{
            state.items = action.payload;
        },
        addItem:(state,action)=>{
            state.items.push(action.payload)
        },
        increamentCartItem:(state,action)=>{
            const {productId,variantId} = action.payload;

            state.items = state.items.map(item=>{
                if(item.product._id === productId && item.variant === variantId){
                    return {
                        ...item,
                        quantity:item.quantity+1
                    }
                }
                return item;
            })
        },
        decrementCartItem:(state,action)=>{
            const {productId,variantId} = action.payload;

            state.items = state.items.map(item=>{
                if(item.product._id === productId && item.variant === variantId){
                    return {
                        ...item,
                        quantity:item.quantity-1
                    }
                }
                return item;
            })
        },
        removeItem:(state,action)=>{
            const {productId,variantId} = action.payload;

            state.items = state.items.filter(item=>{
                return !(item.product._id === productId && item.variant === variantId);
            })
        }
    }
});


export const {setItems,addItem,increamentCartItem,decrementCartItem,removeItem} = cartSlice.actions;
export default cartSlice.reducer;

