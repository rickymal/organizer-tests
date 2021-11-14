import "reflect-metadata"
import { PrimaryGeneratedColumn, Column, createConnection, OneToMany, ManyToOne, OneToOne, JoinColumn, EntityColumnNotFound, Entity, TreeRepositoryNotSupportedError, Connection, getManager, getRepository } from 'typeorm';
import {Purpose} from "./Purpose.entity";
import {User} from "./User.entity";


// Pareciso com a tabela Relashionshiper_of_task mas nesta é dito quem é o supervisor (que irá monitorar) e quem é o supervisionado (monitorado) na tarefa
// A tabela acima apenas informa os envolvidos.
@Entity()
export class Auditory_manager_RH {
    @PrimaryGeneratedColumn()
    id : number

    @ManyToOne(() => User, {nullable : true, onDelete : 'CASCADE'})
    supervisor : User

    @ManyToOne(() => User, {nullable : true, onDelete : 'CASCADE'})
    supervised : User

    @ManyToOne(() => Purpose, {nullable : true, onDelete : 'CASCADE'})
    purpose : Purpose

    @Column({ type: 'datetime', nullable : true })
    date_of_beginning : string | null

    @Column({ type: 'datetime', nullable : true })
    date_of_ending : string | null 

}