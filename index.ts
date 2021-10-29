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
class Supervior {
    @PrimaryGeneratedColumn()
    id!: number;
}



@Entity()
class Supervised {
    @PrimaryGeneratedColumn()
    id!: number
}



@Entity()
class Auditory {
    @PrimaryGeneratedColumn()
    id!: number;
}



@Entity()
class Goal {
    @PrimaryGeneratedColumn()
    id!: number

    project_name!: string

    project_description!: string 

    project_duration!: string

    project_type!: string

}


function authenticate(req: any,res: any,next: any) {
}


createConnection({
    type: "sqlite",
    database: "datateste.sqlite",
    entities: [
        User,
        Auditory,
        Goal
    ],
    synchronize: true,
    logging: false
}).then(async connection => {
    // here you can start to work with your entities
    

    // apagando todo o conteudo (o id continua na contagem normal)
    const entt = connection.entityMetadatas;
    for (let e of entt) {
        let repository = connection.getRepository(e.name)
        await repository.delete({})
    }

    // Criando um supervisor e um supervisionado para testes
    let supervisor = new User()
    let supervisioned = new User()

    supervisor.name = "Diogo"
    supervisor.password = "Batata doce"
    supervisor.email = "sdahdsuodhausi"

    supervisioned.name = "Henrique"
    supervisioned.password = "ahjksdh"
    supervisioned.email = "dashduisahd"

    let sup = await connection.manager.save(supervisor)
    let supe = await connection.manager.save(supervisioned)
     
    console.log("supervisor",JSON.stringify(sup))
    console.log("supervisied",JSON.stringify(supe))

    let new_auditory = new Auditory()

    new_auditory.supervisor = sup.id
    new_auditory.supervised = supe.id
    let auditory_save = await connection.manager.save(new_auditory)
    app.get('/',(req,res) => res.send("Express with typescript working"))
    app.post('/api/insert_task',async function (req,res) {

        let goal = new Goal()
        
        goal.project_description = req.body.project_description
        goal.project_duration = req.body.project_duration
        goal.project_name = req.body.project_name
        goal.project_type = req.body.project_type


        let goal_serialized = await connection.manager.save(goal)
        console.log(JSON.stringify(goal_serialized))


        res.json(req.body)
    })

    app.post('/', function(req,res) {
        console.log("TESTE")
    })

    app.get("/login",(req,res) => {
        const data_body = req.body
        console.log("Entrou aqui não?!")
        // criptografar a senha
        const secret = data_body.password || "123"
        let hash = createHmac('sha256',secret).update("Batatinha frita 1 2 3").digest('hex')
        let email = data_body.email
        let new_user = new User()

        new_user.email = "teste@teste.com"
        new_user.name= "Antônio"
        new_user.password = secret

        connection.manager.save(new_user).then(new_user => {
            console.log("Novo usuário foi adicionado com sucesso",new_user.id)
            res.send(JSON.stringify(new_user))
        })
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
