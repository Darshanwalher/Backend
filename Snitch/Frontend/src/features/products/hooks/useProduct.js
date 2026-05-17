import { useDispatch } from "react-redux";
import { addProductVariant, createProduct, deleteProduct, getAllProducts, getProductById, getSellerProducts,deleteProductVariant, updateProductVariant, updateProduct } from "../service/product.api.js";
import { setSellerProducts,setProducts,setDeleteProduct,setDeleteProductVariant, setUpdateProductVariant, setUpdateProduct } from "../state/product.slice.js";

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

    async function handleAddProductVariant(productId,newProductVariant){
        const data = await addProductVariant(productId,newProductVariant);
        return data
    }

    async function handleDeleteProduct(productId){
        const data = await deleteProduct(productId);
        dispatch(setDeleteProduct(productId));
        return data.product;
    }

    async function handleDeleteProductVariant(productId,variantId){
        const data = await deleteProductVariant(productId,variantId);
        dispatch(setDeleteProductVariant(productId,variantId));
        return data.product;
    }

    async function handleUpdateProductVariant(productId, variantId, updatedVariant){
        const data = await updateProductVariant(productId, variantId, updatedVariant);
        // Assuming setUpdateProductVariant updates the redux state with the updated product
        dispatch(setUpdateProductVariant(data.product)); 
        return data.product;
    }

    async function handleUpdateProduct(productId, updatedProduct){
        const data = await updateProduct(productId, updatedProduct);
        dispatch(setUpdateProduct(data.product));
        return data.product;
    }

    return {
        handleCreateProduct,
        handleGetSellerProducts,
        handleGetAllProducts,
        handleGetProductById,
        handleAddProductVariant,
        handleDeleteProduct,
        handleDeleteProductVariant,
        handleUpdateProductVariant,
        handleUpdateProduct
    }
}

