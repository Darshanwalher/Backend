import { useDispatch } from "react-redux";
import { addProductVariant, createProduct, deleteProduct, getAllProducts, getProductById, getSellerProducts,deleteProductVariant, updateProductVariant, updateProduct } from "../service/product.api.js";
import { setSellerProducts,setProducts,setDeleteProduct,setDeleteProductVariant, setUpdateProductVariant, setUpdateProduct,setLoading } from "../state/product.slice.js";

export const useProduct = ()=>{

    const dispatch = useDispatch();

    async function handleCreateProduct(formData) {
        try {
            dispatch(setLoading(true));
            const data = await createProduct(formData);
            return data.product;
        } catch (error) {
            console.error("Error creating product:", error);
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    } 

    async function handleGetSellerProducts(){
        try {
            dispatch(setLoading(true));
            const data = await getSellerProducts();
            dispatch(setSellerProducts(data.products));
            return data.products;
        } catch (error) {
            console.error("Error getting seller products:", error);
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetAllProducts(){
        try {
            dispatch(setLoading(true));
            const data = await getAllProducts();
            dispatch(setProducts(data.products));
        } catch (error) {
            console.error("Error getting all products:", error);
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetProductById(productId){
        try {
            dispatch(setLoading(true));
            const data = await getProductById(productId);
            return data.product;
        } catch (error) {
            console.error("Error getting product by ID:", error);
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleAddProductVariant(productId,newProductVariant){
        try {
            dispatch(setLoading(true));
            const data = await addProductVariant(productId,newProductVariant);
            return data;
        } catch (error) {
            console.error("Error adding product variant:", error);
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleDeleteProduct(productId){
        try {
            dispatch(setLoading(true));
            const data = await deleteProduct(productId);
            dispatch(setDeleteProduct(productId));
            return data.product;
        } catch (error) {
            console.error("Error deleting product:", error);
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleDeleteProductVariant(productId,variantId){
        try {
            dispatch(setLoading(true));
            const data = await deleteProductVariant(productId,variantId);
            dispatch(setDeleteProductVariant({productId, variantId}));
            return data.product;
        } catch (error) {
            console.error("Error deleting product variant:", error);
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleUpdateProductVariant(productId, variantId, updatedVariant){
        try {
            dispatch(setLoading(true));
            const data = await updateProductVariant(productId, variantId, updatedVariant);
            // Assuming setUpdateProductVariant updates the redux state with the updated product
            dispatch(setUpdateProductVariant({productId, variantId, variant: data.product})); 
            return data.product;
        } catch (error) {
            console.error("Error updating product variant:", error);
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleUpdateProduct(productId, updatedProduct){
        try {
            dispatch(setLoading(true));
            const data = await updateProduct(productId, updatedProduct);
            dispatch(setUpdateProduct(data.product));
            return data.product;
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
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

