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

