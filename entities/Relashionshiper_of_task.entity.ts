import "reflect-metadata"
import { PrimaryGeneratedColumn, Column, createConnection, OneToMany, ManyToOne, OneToOne, JoinColumn, EntityColumnNotFound, Entity, TreeRepositoryNotSupportedError, Connection, getManager, getRepository } from 'typeorm';
import {Purpose} from "./Purpose.entity";



// Equelivante ao nó das conexões. Necessário para criação de chats privados entre. Esta tabela mostra quais propósitos (indiretamente pessoas) são os associados à responsabilidade
@Entity()
export class Relashionshiper_of_task {

    @PrimaryGeneratedColumn()
    id : number

    @ManyToOne(() => Purpose, {nullable : true, onDelete : 'CASCADE'} )
    p1 : Purpose

    @ManyToOne(() => Purpose, {nullable : true, onDelete : 'CASCADE'} )
    p2 : Purpose

}