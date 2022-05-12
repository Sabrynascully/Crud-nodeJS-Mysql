const express =require('express');
const app = express();


app.use(express.urlencoded({ extended: false }));
app.use(express.json());


var pg = require('pg');
var conString = 'postgres://ibiflddvcnabkq:d74e4fbad63a30cc09fc12b02a3d0757b2159adbfd4686bde19b6e1925f71360@ec2-107-22-238-112.compute-1.amazonaws.com:5432/d966qcb858vcjg'


const pool = new pg.Pool({connectionString: conString, ssl: {rejectUnauthorized: false}})

app.get('/', (req, res) =>{
    pool.connect((err, client)=>{
        if (err){
            return res.status(401).send('Não foi possível conectar')
        }
        res.status(200).send('conectado com sucesso')
    })
})

//outra rota -> create table usuarios (email varchar(50), senha varchar(200), perfil varchar(15))

app.get('/criartabelausuario', (req, res) =>{
    pool.connect((err, client)=>{
        if (err){
            return res.status(401).send('Não foi possível conectar')
        }

        client.query('create table usuarios (email varchar(50), senha varchar(200), perfil varchar(15))', (error, result) =>{
            if (error){
                return res.status(401).send('operação não autorizada')
            }
            res.status(200).send(result.rows)
        })
    })
})

app.post('/usuario', (req, res) => {
    pool.connect((err, client) =>{
        if (err) {
            return res.status(401).send('conexão nao autorizada')
        }

        client.query('select * from usuarios where email = $1', [req.body.email], (error,result) =>{
            if (error) {
                return res.status(401).send('operação não autorizada')
            }
            if (result.rowCount > 0) {
                return res.status(200).send('Registro já existe')
            }
             var sql = 'INSERT INTO usuarios(email, senha, perfil) VALUES ($1, $2, $3)'

            client.query(sql, [req.body.email, req.body.senha, req.body.perfil], (error, result) => {
                if (error) {
                    return res.status(403).send('operação não permitida')
            }

            res.status(201).send({
                mensagem: 'criado com sucesso',
                status: 201
            })
            
            })
        
        }) 
        
    })
})
app.get('/usuario', (req, res) => {
    pool.connect((err, client) => {
        if(err){
            res.status(401).send('conexão não autorizada')
        }

        client.query('select * from usuarios', (error, result) => {
            if(error) {
               return res.status(401).send('operaçao nao autorizada')
            }
            res.status(200).send(result.rows)
        })
    })
})

//consulta por email
app.get('/usuario/:email', (req, res) =>{
    pool.connect((err, client) => {
        if (err) {
            return res.status(401).send('conexão não autorizada')
         }
         client.query('select * from usuarios where email = $1', [req.params.email], (error, result) =>{
             if(error) {
                 return res.status(401).send('operação não autorizada')
             }
             res.status(200).send(result.rows[0])
         })
    })
})


app.delete('/usuario/:email', (req, res) =>{
    pool.connect((err, client) => {
        if (err) {
           return res.status(401).send('conexão não autorizada')
        }

        client.query('delete from usuarios where email = $1', [req.params.email], (error, result) =>{

            if (error) {
                return res.status(401).send('Operação não autorizada')
            }
                res.status(200).send({message: 'registro excluido com sucesso'})
        })
    })
})


app.listen(8081, () => console.log('aplicação em execução na url http://localhost:8081'))