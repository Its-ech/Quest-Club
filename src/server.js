require('dotenv').config;

const ex = require('express');

const app = ex();

const PORT = process.env.PORT || 3000;

app.get('/api/v1/health',(req , res)=> {
    return res.status(200).json({status:'ok'});
});

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});