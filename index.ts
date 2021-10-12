import express from 'express'
import path from 'path'

const app = express()
const PORT = 8001;
const all_path = path.join(__dirname,'public')
console.log(all_path)
app.use(express.static(all_path))
app.use(express.json())
app.get('/',(req,res) => res.send("Express with typescript working"))
app.listen(PORT, () => {
    console.log("Servidor rodando")
})


app.post('/api/insert-task',(req,res) => {
    const data_query = req.query
    const data_body = req.body
    
    res.send({
        query: data_query,
        body: data_body,
    })
})

