import axios from "axios";

const api = axios.create({
    baseURL: "https://social-space-l1ot.onrender.com/api/auth",
    withCredentials:true
})


export async function loginUser(username,password){

    const response = await api.post("/login",{
        username,
        password
    })

    return response.data;
}

export async function registerUser(username,email,password){

    const response = await api.post("/register",{
        username,
        email,
        password
    })
    console.log(response.data);
    

    return response.data;
}

export async function getMeUser(){

    const response = await api.get("/getme")

    return response.data;
}