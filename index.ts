import express from 'express'
import path from 'path'
import teste from './src/test';
import React from 'react'
import ReactDOM from 'react-dom'
const app = express()
const PORT = 8000;
const all_path = path.join(__dirname,'public')
console.log(all_path)

app.use(express.static(all_path))
app.get('/',(req,res) => res.send("Express with typescript working"))



app.listen(PORT, () => {
    console.log("Servidor rodando")
})

