import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api/auth",
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

    return response.data;
}

export async function getMeUser(){

    const response = await api.get("/getme")

    return response.data;
}