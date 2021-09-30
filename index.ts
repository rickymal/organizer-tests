import express from 'express'
import path from 'path'

const app = express()
const PORT = 8000;
const all_path = path.join(__dirname,'public')
console.log(all_path)


app.use(express.static(all_path))
app.get('/',(req,res) => res.send("Express with typescript working"))



app.listen(PORT, () => {
    console.log("Servidor rodando")
})

