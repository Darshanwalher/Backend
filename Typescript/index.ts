const user = {
    name: "Darshan",
    age: 22,
    isAdmin: true
}

function getUserinfo(data:{name:string,age:number,isAdmin:boolean}): void{
    console.log(data.name+ " " + data.age + " " + data.isAdmin);
    
}

type User = {
    name:string,
    age:number,
    isAdmin:boolean
}

function getUserinfo1(data:User): void{
    console.log(data.name+ " " + data.age + " " + data.isAdmin);
}

function getUserinfo12(data:User): void{
    console.log(data.name+ " " + data.age + " " + data.isAdmin);
}

getUserinfo(user)
getUserinfo1(user)
getUserinfo12(user)