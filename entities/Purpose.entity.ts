import "reflect-metadata"
import { PrimaryGeneratedColumn, Column, createConnection, OneToMany, ManyToOne, OneToOne, JoinColumn, EntityColumnNotFound, Entity, TreeRepositoryNotSupportedError, Connection, getManager, getRepository } from 'typeorm';
import {User} from "./User.entity";

@Entity()
export class Purpose {

    @PrimaryGeneratedColumn()
    id : number

    @Column()
    name : string

    @ManyToOne(() => User, {nullable : true, onDelete : "CASCADE"})
    created_by : User

    @Column()
    description: string 

    @Column({nullable : true})
    duration : number

    // @OneToMany(() => Relashionshiper_of_task, aud => aud.p1)
    // purpose_p1 : Relashionshiper_of_task

    // @OneToMany(() => Relashionshiper_of_task, aud => aud.p2)
    // purpose_p2 : Relashionshiper_of_task

}