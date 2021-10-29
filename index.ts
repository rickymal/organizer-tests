import "reflect-metadata"
import express from 'express'
import path from 'path'
import { Entity, PrimaryGeneratedColumn, Column, createConnection } from 'typeorm';
import { createHmac } from "crypto";

const app = express()
const PORT = 8000;

const pages_path = path.join(__dirname,'public')
const view_path = path.join(__dirname,'views')

console.log(pages_path)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(pages_path))
app.set('views',view_path)
app.set('view engine','jsx')
app.engine('jsx', require('express-react-views').createEngine());



@Entity()
class Authenticator {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    user_connected!: string

    @Column()
    token!: string
}

// criando entidade
@Entity()
class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string

    @Column()
    email!: string   

    @Column()
    password!: string
}


@Entity()
class Auditory {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    supervisor!: number

    @Column()
    supervised!: number

}


@Entity()
class Goal {
    @PrimaryGeneratedColumn()
    id!: number

    title!: string

    description!: string 

    duration!: string

    type!: string


}


function authenticate(req: any,res: any,next: any) {
}




createConnection({
    type: "sqlite",
    database: "datateste.sqlite",
    entities: [
        User
    ],
    synchronize: true,
    logging: false
}).then(connection => {
    // here you can start to work with your entities
    console.log("Deu tudo certo")


    app.get('/',(req,res) => res.send("Express with typescript working"))
    
    app.get("/login",(req,res) => {
        const data_body = req.body
    
        // criptografar a senha
        const secret = data_body.password || "123"
        let hash = createHmac('sha256',secret).update("Batatinha frita 1 2 3").digest('hex')
    
        let email = data_body.email

        let new_user = new User()

    })
}).catch(error => console.log(error));





app.listen(PORT, () => {
    console.log("Servidor rodando")
})



app.get('/component/list',async (req,res) => {

  

    res.render('list', {
        title: "Batatinha frita",
        id: "collapser-list",
        description: "Uma breve descrição aqui"
    })
})

app.post('/api/insert-task',async (req,res) => {
    const data_body = req.body

})