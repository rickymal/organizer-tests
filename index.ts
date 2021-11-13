import "reflect-metadata"
import express, { application } from 'express'
import path from 'path'
import { PrimaryGeneratedColumn, Column, createConnection, OneToMany, ManyToOne, OneToOne, JoinColumn, EntityColumnNotFound, Entity, TreeRepositoryNotSupportedError, Connection, getManager } from 'typeorm';
import { createHmac } from "crypto";
import { connection } from "mongoose";
import { Response } from "express-serve-static-core";

const app = express()
const PORT = 8000

const pages_path = path.join(__dirname,'public')
const view_path = path.join(__dirname,'views')

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(express.static(pages_path))
app.set('views',view_path)
app.set('view engine','jsx')
app.engine('jsx',require('express-react-views').createEngine());

@Entity()
class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    email : string

    @Column()
    password : string

}


@Entity()
class Notebook {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User)
    owner : User 
}


@Entity()
class Purpose {

    @PrimaryGeneratedColumn()
    id : number

    @Column()
    name : string

    @Column()
    description: string 

    @Column({nullable : true})
    duration : number

    // @OneToMany(() => Relashionshiper_of_task, aud => aud.p1)
    // purpose_p1 : Relashionshiper_of_task

    // @OneToMany(() => Relashionshiper_of_task, aud => aud.p2)
    // purpose_p2 : Relashionshiper_of_task

}

// Equelivante ao nó das conexões. Necessário para criação de chats privados entre 
@Entity()
class Relashionshiper_of_task {

    @PrimaryGeneratedColumn()
    id : number

    @ManyToOne(() => Purpose, )
    p1 : Purpose

    @ManyToOne(() => Purpose, )
    p2 : Purpose

}


// a implementar
@Entity()
class Auditory_manager_RH {
    @PrimaryGeneratedColumn()
    id : number

    @ManyToOne(() => User)
    supervisor : User

    @ManyToOne(() => User)
    supervised : User
}

createConnection({
    type: "sqlite",
    "database" : "db.sqlite",
    "entities" : [
        Relashionshiper_of_task,
        User,
        Purpose,
        Auditory_manager_RH
    ],
    synchronize : true,
    logging : false
}).then(async (e) => {
    await e.dropDatabase()
    await e.close()
}).then(() => {
    createConnection({
        type: "sqlite",
        database: "db.sqlite",
        entities: [
            Relashionshiper_of_task,
            User,
            Purpose,
            Auditory_manager_RH
        ],
        synchronize: true,
        logging: false
    }).then(async connection => {
        console.log("Meu irmão.. estamos conectados")

        app.post('/api/insert_purpose', async function (request : any, response) {
            console.log("entoru eadasidbnhui")
            let purpose = new Purpose()
            purpose.description = request.body['project-description']
            purpose.name = request.body['project-name']
            purpose.duration = request.body['duration']
            var emaned_from_purpose = request.body['emaneded-from-purpose']

            if (emaned_from_purpose.length != 0)
            await create_connected_task(connection, purpose, response, request);

            if (emaned_from_purpose.length == 0)
            await create_isolated_task(connection, purpose, response, request);
        })

        app.post('/api/create_user', async function(request,response) {
            let email = request.body.email
            let password = request.body.password
            let name = request.body.name

            let user = new User()
            user.email = email
            user.password = password
            user.name = name

            connection.manager.save(user)

            response.send(JSON.stringify(request.body))
        
        })

        app.post('/api/set_management',async function (request,response) {
            let project_name = request.body['project-name']
            let manager : Management_RH_content_view = new Object() as Management_RH_content_view
            manager.supervised = request.body['manager']['supervisor']
            manager.supervisor = request.body['manager']['supervised']
            console.log("supervisor: " + manager.supervised)


            let purpose = await connection.getRepository(Purpose).createQueryBuilder("purpose").where("purpose.name = :name", {
                name : project_name
            }).getOne()

            try {
                manager.supervised.forEach(async supervised => {
                    manager.supervisor.forEach(async supervisor => {
                        console.log(`Supervisor : ${supervisor} e supervisionado: ${supervised}` )
                        // existe um jeito bem mais eficiente de fazer isso utilizando o join (verificar como fazer isso depois com calma)
                        let supervisor_model = await connection.getRepository(User).createQueryBuilder("user").where("user.name = :name", {
                            name  : supervisor
                        }).getOne()
    
                        let supervised_model = await connection.getRepository(User).createQueryBuilder("user").where("user.name = :name", {
                            name  : supervised
                        }).getOne()
    
                        let amrh = new Auditory_manager_RH()
                        amrh.supervised = supervised_model as User
                        amrh.supervisor = supervisor_model as User
    
                        connection.manager.save(amrh)
    
        
                    })
                })
            } catch (error) {
                response.send(JSON.stringify({
                    error 
                }))
            }

         

        })
    })
})


interface Management_RH_content_view {
    supervisor: Array<string>
    supervised: Array<string>
}

async function create_connected_task(connection: Connection, purpose: Purpose, response: Response<any, Record<string, any>, number>, request: any) {
    let connectors : Array<any> = request.body["emaneded-from-purpose"]
    let manager = getManager()

    await connection.manager.save(purpose);

    connectors.forEach(async e => {
        let auditory = new Relashionshiper_of_task()
        auditory.p2 = purpose

        let p1 = await connection.getRepository(Purpose).createQueryBuilder("purpose").where("purpose.name = :name", {
            name : e
        }).getOne()

        console.log(purpose)
        console.log(p1)

        auditory.p1 = p1 as Purpose


        console.log("chegou aqui mi amigo")

        connection.manager.save(auditory)
        
    })



    response.send(JSON.stringify(request.body));
}

async function create_isolated_task(connection: Connection, purpose: Purpose, response: Response<any, Record<string, any>, number>, request: any) {
    await connection.manager.save(purpose);
    response.send(JSON.stringify(request.body));
}



app.listen(PORT, () => {
    console.log("Servidor rodando")
})