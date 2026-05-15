import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello World!' });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: 'OK' });
});


app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})