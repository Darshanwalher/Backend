const Redis = require("ioredis").default;

const redius = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD

})

redius.on("connect",()=>{
    console.log("server is connected to redis");
})

module.exports = redius;