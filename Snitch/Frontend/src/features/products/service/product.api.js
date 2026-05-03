import axios from "axios";


const productApiInstance = axios.create({
    baseURL: "/api/products",
    withCredentials:true,
});

export const createProduct = async(formData)=>{
    const response = await productApiInstance.post("/",formData)
    return response.data;
}

export const getSellerProducts = async()=>{
   
    const response = await productApiInstance.get("/seller");
    return response.data;
    
}

export const getAllProducts = async()=>{
    const response = await productApiInstance.get("/");
    return response.data;
}

export const getProductById = async(productId)=>{
    const response = await productApiInstance.get(`/detail/${productId}`);
    return response.data;
}

export const addProductVariant = async(productId,newProductVariant)=>{

    const formData = new FormData();

    newProductVariant.images.forEach((image)=>{
        formData.append(`images`,image.file)
    })

    formData.append("stock",newProductVariant.stock)
    formData.append("priceAmount",newProductVariant.price.amount)
    formData.append("priceCurrency",newProductVariant.price.currency)
    formData.append("attributes",JSON.stringify(newProductVariant.attributes))

    const response = await productApiInstance.post(`/${productId}/variants`,formData)
    return response.data;
    
}

