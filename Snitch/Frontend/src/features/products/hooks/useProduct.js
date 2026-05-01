import { useDispatch } from "react-redux";
import { createProduct, getSellerProducts } from "../service/product.api.js";
import { setSellerProducts } from "../state/product.slice.js";

export const useProduct = ()=>{

    const dispatch = useDispatch();

    async function handleCreateProduct(formData) {
        const data = await createProduct(formData);
        return data.product;
        
    } 

    async function handleGetSellerProducts(){
        const data = await getSellerProducts();
        dispatch(setSellerProducts(data.products));
        return data.products;
    }

    return {
        handleCreateProduct,
        handleGetSellerProducts
    }
}