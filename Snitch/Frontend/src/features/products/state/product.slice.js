import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
    name:"product",
    initialState:{
        sellerProducts:[],
        products:[]
    },
    reducers:{
        setSellerProducts:(state,action)=>{
            state.sellerProducts = action.payload;
        },
        setProducts:(state,action)=>{
            state.products = action.payload;
        }
        ,
        setDeleteProduct(state, action) {
            state.products = state.products.filter((p) => p.id !== action.payload);
        },
        setDeleteProductVariant:(state,action)=>{
            state.sellerProducts = state.sellerProducts.map((p)=>{
                if(p.id === action.payload.productId){
                    p.variants = p.variants.filter((v)=>v.id !== action.payload.variantId)
                }
                return p
            })
        },
        setUpdateProductVariant:(state,action)=>{
            state.sellerProducts = state.sellerProducts.map((p)=>{
                if(p.id === action.payload.productId){
                    p.variants = p.variants.map((v)=>{
                        if(v.id === action.payload.variantId){
                            return action.payload.variant;
                        }
                        return v;
                    })
                }
                return p
            })
        }

    }
    

})

export const {setSellerProducts,setProducts,setDeleteProduct,setDeleteProductVariant,setUpdateProductVariant} = productSlice.actions;
export default productSlice.reducer;