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
class Purpose {

    @PrimaryGeneratedColumn()
    id : number

    @Column()
    name : string

    @Column()
    description: string 

    // @OneToMany(() => Auditory_task_manager, aud => aud.supervisor)
    // purpose_supervisor : Auditory_task_manager

    // @OneToMany(() => Auditory_task_manager, aud => aud.supervised)
    // purpose_supervised : Auditory_task_manager

}

// A auditoria seria o equivalente ao nó das conexões
@Entity()
class Auditory_task_manager {

    @PrimaryGeneratedColumn()
    id : number

    @ManyToOne(() => Purpose, )
    supervisor : Purpose

    @ManyToOne(() => Purpose, )
    supervised : Purpose

}



createConnection({
    type: "sqlite",
    "database" : "db.sqlite",
    "entities" : [
        Auditory_task_manager,
        User,
        Purpose
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
            Auditory_task_manager,
            User,
            Purpose
        ],
        synchronize: true,
        logging: false
    }).then(async connection => {
        console.log("Meu irmão.. estamos conectados")

        app.post('/api/insert_purpose', async function (request : any,response) {
            console.log("entoru eadasidbnhui")
            let purpose = new Purpose()
            purpose.description = request.body['project-description']
            purpose.name = request.body['project-name']
            var emaned_from_purpose = request.body['emaneded-from-purpose']

            if (emaned_from_purpose.length != 0)
            await create_connected_task(connection, purpose, response, request);

            await create_isolated_task(connection, purpose, response, request);
        })
    })
})




async function create_connected_task(connection: Connection, purpose: Purpose, response: Response<any, Record<string, any>, number>, request: any) {
    let connectors : Array<any> = request.body["emaneded-from-purpose"]
    let manager = getManager()



    connectors.forEach(async e => {
        let auditory = new Auditory_task_manager()
        auditory.supervised = purpose

        auditory.supervisor = await manager.findOne(Purpose, {
            where : {
                name : e
            }
        }
        ) as Purpose

 =
        
    })


    await connection.manager.save(purpose);
    response.send(JSON.stringify(request.body));
}

async function create_isolated_task(connection: Connection, purpose: Purpose, response: Response<any, Record<string, any>, number>, request: any) {
    await connection.manager.save(purpose);
    response.send(JSON.stringify(request.body));
}



app.listen(PORT, () => {
    console.log("Servidor rodando")
})