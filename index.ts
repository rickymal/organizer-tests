import express from 'express'
import path from 'path'
import mongoose from 'mongoose';
const app = express()
const PORT = 8001;
const all_path = path.join(__dirname,'public')
console.log(all_path)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(all_path))


// Criar a instância do mongoose
async function configMongo(){
    await mongoose.connect('mongodb://localhost:27017/test');

    const purpose_planning_schema = new mongoose.Schema({
        project_name: String,
        description : String,
        task_duration : Date,
        project_type : Number,
      });
      // continuar a partir da documentação
      // https://mongoosejs.com/docs/

      const task = mongoose.model("Purpose_Planning",)
}



app.get('/',(req,res) => res.send("Express with typescript working"))
app.listen(PORT, () => {
    console.log("Servidor rodando")
})

app.post('/api/insert-task',(req,res) => {
    const data_query = req.query
    console.log(req.body)
    res.send({
        content : req.body,
    })
})