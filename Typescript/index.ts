const user = {
    name: "Darshan",
    age: 22,
    isAdmin: true
}

function getUserinfo(data:{name:string,age:number,isAdmin:boolean}): void{
    console.log(data.name+ " " + data.age + " " + data.isAdmin);
    
}

getUserinfo(user)