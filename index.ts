import express from 'express'
import path from 'path'
const app = express()
const PORT = 8001;

const pages_path = path.join(__dirname,'public')
const view_path = path.join(__dirname,'views')

console.log(pages_path)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(pages_path))
app.set('views',view_path)
app.set('view engine','jsx')
app.engine('jsx', require('express-react-views').createEngine());


import {Sequelize, Model, DataTypes as Dt, Optional, HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyHasAssociationMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, HasOneSetAssociationMixin} from 'sequelize'



// criando o banco de dados
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
  });


class User extends Model {}


interface Purpose_attributes {
    id : number,
    project_name : string,
    task_duration : Date,
    project_type : number,
    description: string,
}
interface Purpose_Creation_attributes extends Optional<Purpose_attributes,"id"> {}
class Purpose extends Model<Purpose_attributes,Purpose_Creation_attributes> implements Purpose_attributes {
    public id!: number;
    public project_name!: string;
    public description!: string;
    public task_duration!: Date;
    public project_type!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getProjects!: HasManyGetAssociationsMixin<User>;
    public addProject!: HasManyAddAssociationMixin<User, number>;
    public hasProject!: HasManyHasAssociationMixin<User, number>;
    public countProjects!: HasManyCountAssociationsMixin;
    public createProject!: HasManyCreateAssociationMixin<User>;
    public setUser!: HasOneSetAssociationMixin<User, number>;



}




Purpose.init({
    id: {
        type: Dt.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
    project_name : {type : Dt.STRING, allowNull : false},
    description : {type : Dt.TEXT, allowNull : false},
    task_duration : {type : Dt.DATE, allowNull : false},
    project_type : {type : Dt.INTEGER, allowNull : false},
},{sequelize, modelName : "Purpose", timestamps : true})


User.init({
    name: {type: Dt.STRING, allowNull : false},
    email : {type : Dt.STRING, allowNull : false},
    password : {type : Dt.STRING, allowNull : false},
},{sequelize, modelName : "User", timestamps : true})


// 1:N
User.hasMany(Purpose)
Purpose.belongsTo(User)



app.get('/',(req,res) => res.send("Express with typescript working"))
app.listen(PORT, () => {
    console.log("Servidor rodando")
})

sequelize.sync({force : true})


app.get('/component/list',async (req,res) => {
    res.render('list', {
        title: "Batatinha frita",
        random: "1234e",
        description: "Uma breve descrição aqui"
    })
})

app.post('/api/insert-task',async (req,res) => {
    const data_body = req.body
    const mock_user = User.build({
        name : "Henrique",
        email : "riquemauler@gmail.com",
        password : "123"
    })

    const new_purpose = Purpose.build(data_body)
    new_purpose.setUser(mock_user)
    new_purpose.save().then(e => {
        // res.send({
        //     content : data_body,
        //     response : new_purpose.toJSON()
        // })

       res.redirect('/')
    })
})