import { useDispatch } from "react-redux";
import { createProduct, getAllProducts, getProductById, getSellerProducts } from "../service/product.api.js";
import { setSellerProducts,setProducts } from "../state/product.slice.js";

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

    async function handleGetAllProducts(){
        const data = await getAllProducts();
        dispatch(setProducts(data.products));

    }

    async function handleGetProductById(productId){
        const data = await getProductById(productId);
        return data.product;
    }

    return {
        handleCreateProduct,
        handleGetSellerProducts,
        handleGetAllProducts,
        handleGetProductById
    }
}
