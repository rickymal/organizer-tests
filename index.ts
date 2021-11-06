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

    @OneToMany(() => Auditory, s => s.supervisor)
    supervisors : Auditory[]

    @OneToMany(() => Auditory, s => s.supervised)
    supervisers : Auditory[]


}



// Sistema da auditoria

@Entity()
class Auditory {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    supervisor: User

    @ManyToOne(() => User)
    supervised: User

    @Column()
    description : string //armazena as informações para anotação no markdown 2.0

    @ManyToOne(() => AuditoryManager)
    auditory_manager_supervisor : AuditoryManager

    @ManyToOne(() => AuditoryManager)
    auditory_manager_supervised : AuditoryManager
}



@Entity()
class AuditoryManager {
    @PrimaryGeneratedColumn()
    id: number

    @OneToMany(() => Auditory, aud => aud.auditory_manager_supervisor)
    auditory_supervisor : Auditory


    @OneToMany(() => Auditory, aud => aud.auditory_manager_supervised)
    auditory_manager_supervised : Auditory
}




@Entity()
class Purpose {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    project_name: string

    @Column()
    project_description: string 

    @Column()
    project_duration: string

    @Column()
    project_type: string

    @OneToMany(() => Task, tsk => tsk.purpose)
    tasks : Task[]

}


@Entity()
class Task {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Purpose)
    purpose : Purpose

}


@Entity()
class Discrete_task {
    @PrimaryGeneratedColumn()
    id: number
}

@Entity()
class Demand_task {
    @PrimaryGeneratedColumn()
    id: number
}

@Entity()
class Goal {
    @PrimaryGeneratedColumn()
    id: number

    
}


// connection.dropDatabase()

createConnection({
    type: "sqlite",
    database: "datateste.sqlite",
    entities: [
        User,
        Auditory,
        Purpose,
        Task

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
            Purpose,
            Task
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
        const auditory = new Auditory()


        const supervised = new User()
        const supervisor = new User()

        supervised.email = "dasd"
        supervised.name = "Henrique"
        supervised.password = "teste"
        
        await connection.manager.save(supervised)
        
        supervisor.email = "anas"
        supervisor.name = "OOkk"
        supervisor.password = "123"

        await connection.manager.save(supervisor)

        auditory.description = "Isto é uma tarefa entre supervisor e supervisionado"
        auditory.supervised = supervised
        auditory.supervisor = supervisor

        await connection.manager.save(auditory)



        app.get('/',(req,res) => res.send("Express with typescript working"))
        app.post('/api/insert_task',async function (req,res) {
    
            let purpose = new Purpose()
            
            purpose.project_description = req.body.project_description
            purpose.project_duration = req.body.project_duration
            purpose.project_name = req.body.project_name
            purpose.project_type = req.body.project_type
    
    
            let purpose_serialized = await connection.manager.save(purpose)
            console.log(JSON.stringify(purpose_serialized))
    
    
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
