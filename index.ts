import "reflect-metadata"
import express, { application } from 'express'
import path from 'path'
import { PrimaryGeneratedColumn, Column, createConnection, OneToMany, ManyToOne, OneToOne, JoinColumn, EntityColumnNotFound, Entity, TreeRepositoryNotSupportedError, Connection, getManager, getRepository, getConnection, CustomRepositoryCannotInheritRepositoryError } from 'typeorm';
import { createHmac } from "crypto";
import { connection } from "mongoose";
import { Response } from "express-serve-static-core";
import cors from 'cors';

const app = express()
const PORT = 8000

const pages_path = path.join(__dirname,'public')
const view_path = path.join(__dirname,'views')

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(express.static(pages_path))
app.use(cors())
app.set('views',view_path)
app.set('view engine','jsx')
app.engine('jsx',require('express-react-views').createEngine());


/*
SELECT p1.name as supervisor, p2.name as supervisionado FROM auditory_manager_rh 
LEFT JOIN user p1 ON (auditory_manager_rh.supervisedId = p1.id)
LEFT JOIN user p2 ON (auditory_manager_rh.supervisorId = p2.id)


SELECT p1.name as supervisor, p2.name as supervisionado, p3.name as Tarefa, p3.Author as "Autor da tarefa" FROM auditory_manager_rh 
LEFT JOIN user p1 ON (auditory_manager_rh.supervisedId = p1.id)
LEFT JOIN user p2 ON (auditory_manager_rh.supervisorId = p2.id)
LEFT JOIN (SELECT purpose.*, user.name  as "Author"  FROM purpose CROSS JOIN user ON user.id = purpose.createdById) p3 ON (auditory_manager_rh.purposeId = p3.id


SELECT * from purpose where purpose.createdById = (SELECT d.id FROM user d where d.name = "Henrique")

Query para saber quem é o supervisor e quem é o supervisionado
*/


import {Auditory_manager_RH} from './entities/Auditory_manager_RG.entity'
import {Relashionshiper_of_task} from './entities/Relashionshiper_of_task.entity'
import {User} from './entities/User.entity'
import {Purpose} from './entities/Purpose.entity'


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
    
    // await e.dropDatabase()
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

        app.delete('/api/delete_purpose', async function (request,response) {
            let project_name = request.body["project-name"]

            console.log("!!!!!!!!!!!!!!!!!!!!!")
            console.log(project_name)
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(Purpose)
                .where("name = :name", { name: project_name })
                .execute();


            response.send("OK")
        })

        app.put('/api/edit_purpose',async function(request,response) {
            let project_name : string = request.body['project-name']
            let project_description : string = request.body['project-description']

            let response_from_sqlite = await getConnection().createQueryBuilder().update(Purpose)
                .set(
                    {
                        description : project_description
                    }
                )
                .where('name = :name', {name : project_name})
                .execute()


            response.send("OK")

        })

        app.get('/api/show_resume',async function (request, response) {
            let user_name = request.body['user']

            // // SELECT * from purpose where purpose.createdById = (SELECT d.id FROM user d where d.name = "Henrique")
            // let internal_query  = getRepository(User).createQueryBuilder('user').where("user.name = :name",{name : user_name})

            // let external_query = getRepository(Purpose).createQueryBuilder('purpose').where('purpose.createdById = ('+internal_query.getQuery() + ")")

            let query_to_send = "SELECT * from purpose where purpose.createdById = (SELECT d.id FROM user d where d.name = \"" + user_name + "\")"
            console.log(query_to_send)
            let informativo_1 = await connection.query(query_to_send)

            query_to_send = "SELECT p1.name as supervisor, p2.name as supervisionado, p3.name as Tarefa, p3.Author as \"Autor da tarefa\" FROM auditory_manager_rh LEFT JOIN user p1 ON (auditory_manager_rh.supervisedId = p1.id) LEFT JOIN user p2 ON (auditory_manager_rh.supervisorId = p2.id) LEFT JOIN (SELECT purpose.*, user.name  as \"Author\"  FROM purpose CROSS JOIN user ON user.id = purpose.createdById) p3 ON (auditory_manager_rh.purposeId = p3.id)"


            let informativo_2 = await connection.query(query_to_send)

            
            let for_supervisor: { Tarefa: any; supervisionado: any; }[] = []
            let for_supervised: { Tarefa: any; supervisor: any; }[] = []

            informativo_2.forEach((e: any) => {
                if (e['supervisor'] == user_name)
                {
                    for_supervisor.push({
                        Tarefa: e['Tarefa'],
                        supervisionado: e['supervisionado']
                    })
                }

                if (e['supervisionado'] == user_name)
                {
                    for_supervised.push({
                        Tarefa: e['Tarefa'],
                        supervisor: e['supervisor']
                    })
                }
            })

  

            response.send(JSON.stringify({
                Tarefas: {
                    supervisor : for_supervisor,
                    supervisionado: for_supervised
                }
            }))

            

        })

        app.post('/api/insert_purpose', async function (request : any, response) {
            console.log("entoru eadasidbnhui")
            let purpose = new Purpose()
            purpose.description = request.body['project-description']
            purpose.name = request.body['project-name']
            purpose.duration = request.body['duration']
            let name_creator = request.body['created_by']
            // Diogo
            let user = await getRepository(User).createQueryBuilder("user").where("user.name = :name", {name : name_creator}).getOne()


            purpose.created_by = user as User


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
            console.log("Usuário criado com sucesso")
            response.send(JSON.stringify(request.body))
        
        })

        app.post('/api/set_management',async function (request,response) {
            let project_name = request.body['project-name']
            let date_of_beginning = request.body['date_of_beginning']
            let date_of_ending = request.body['date_of_ending'] != null ? parseInt(request.body['date_of_ending']) : null


            let manager : Management_RH_content_view = new Object() as Management_RH_content_view
            manager.supervised = request.body['manager']['supervisor']
            manager.supervisor = request.body['manager']['supervised']
            console.log("supervisor: " + manager.supervised)




            let purpose = await connection.getRepository(Purpose).createQueryBuilder("purpose").where("purpose.name = :name", {
                name : project_name
            }).getOne()

            function addDays(date : Date, days : number) {
                var result = new Date(date);
                result.setDate(result.getDate() + days);
                return result;
              }


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
                        amrh.purpose = purpose as Purpose

                        console.log("Dat: " + date_of_beginning)
                        console.log("Dat: " + date_of_ending)
                        amrh.date_of_beginning = date_of_beginning == null ? null : new Date(date_of_beginning).toString()
                        amrh.date_of_ending = date_of_ending == null ? null : new Date(date_of_beginning).toString()
                        connection.manager.save(amrh)    
        
                    })
                })
            } catch (error) {
                response.send(JSON.stringify({
                    error 
                }))
            }

            response.send("OK")

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