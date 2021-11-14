import "reflect-metadata"
import { PrimaryGeneratedColumn, Column, createConnection, OneToMany, ManyToOne, OneToOne, JoinColumn, EntityColumnNotFound, Entity, TreeRepositoryNotSupportedError, Connection, getManager, getRepository } from 'typeorm';

import {Purpose} from "./Purpose.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    email : string

    @Column()
    password : string

    @OneToOne(() => Purpose, {nullable : true, onDelete : 'CASCADE'})
    creator_of_purpose : Purpose

}