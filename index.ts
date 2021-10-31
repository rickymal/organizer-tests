import "reflect-metadata"
import express from 'express'
import path from 'path'
import { Entity, PrimaryGeneratedColumn, Column, createConnection, OneToMany, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
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
    id: number

    @Column()
    user_connected: string

    @Column()
    token: string
}

// criando entidade
@Entity()
class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column()
    email: string   

    @Column()
    password: string



}


@Entity()
class Supervisor {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;


}



@Entity()
class Supervised {
    @PrimaryGeneratedColumn()
    id: number

    @OneToOne(() => User)
    user: User;

}



@Entity()
class Auditory {
    @PrimaryGeneratedColumn()
    id: number;
}



@Entity()
class Goal {
    @PrimaryGeneratedColumn()
    id: number

    project_name: string

    project_description: string 

    project_duration: string

    project_type: string

    user_provider: number

    group_type: string

}




// connection.dropDatabase()

createConnection({
    type: "sqlite",
    database: "datateste.sqlite",
    entities: [
        User,
        Auditory,
        Goal,
        Supervised,
        Supervisor
    ],
    synchronize: true,
    logging: false
}).then(async (e) => {
    await e.dropDatabase()
    await e.close()
}).then(() => {

    createConnection({
        type: "sqlite",
        database: "datateste.sqlite",
        entities: [
            User,
            Auditory,
            Goal,
            Supervised,
            Supervisor
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
    
        await connection.query('PRAGMA foreign_keys=OFF');
        await connection.synchronize();
        await connection.query('PRAGMA foreign_keys=ON');
    
        // Criar um usuário supervisor
        
        const user_supervisor = new User()
        user_supervisor.email = "adsads"
        user_supervisor.name = "Diogo"
        user_supervisor.password = "dddd"
    
        await connection.manager.save(user_supervisor)
        const supervisor = new Supervisor()
        supervisor.user = user_supervisor
        await connection.manager.save(supervisor)

        // Criar um usuário supervisionado
        const user_supervised = new User()
        user_supervised.email = "dadssd"
        user_supervised.name = "Henrique"
        user_supervised.password = "teste"

        await connection.manager.save(user_supervised)
        const supervised = new Supervised()
        supervised.user = user_supervised
        await connection.manager.save(user_supervised)
    
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
})

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
