"use strict";
const user = {
    name: "Darshan",
    age: 22,
    isAdmin: true
};
function getUserinfo(data) {
    console.log(data.name + " " + data.age + " " + data.isAdmin);
}
getUserinfo(user);
