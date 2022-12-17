const express = require ('express')
var cors = require('cors')

const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended:false}))

app.use(cors())


//konekcija

const {Pool,Client}=require('pg')

const conectionString='postgres://qmlnisvo:G4jsi6AsVQuRNEByjplKxjYH2-HVbrRX@abul.db.elephantsql.com/qmlnisvo?ssl=true'
const client= new Client({
    connectionString:conectionString
})

client.connect()

let today = new Date();
let ura1 = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
let dan1 = today.getDay()
let mesec1 = today.getMonth() + 1
let leto1 = today.getFullYear()

const getPodatki = (request, response) => {
  client.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      console.log(error)
    }
    response.status(200).json(results.rows)
  })
}

app.get('/podatki', (req, res) => {
  client.query('SELECT * FROM urca', (error, results) => {
    if (error) {
      console.log(error)
    }
    res.status(200).json(results.rows)
  })
})

app.post('/posljiPodatke', (req, res) => {
  const { tip, dan, mesec, leto } = req.body
  console.log(tip)
  console.log(req.body)
  client.query('INSERT INTO urca (tip, ura, dan, mesec, leto) VALUES ($1, NOW(), $2, $3, $4);', [tip, dan, mesec, leto], (error, results) => {
    if (error) {
       console.log(error)
    }
   res.status(201).send(`Zapis dodan`)
  })
})

app.post('/posljiPodatke1', (req, res) => {
  let tip = 'prihod'
  let ura = ura1
  let dan = dan1
  let mesec = mesec1
  let leto = leto1
  console.log(tip)
  console.log(req.body)
  client.query('INSERT INTO urca (tip, ura, dan, mesec, leto) VALUES ($1, $2, $3, $4, $5);', [tip, ura, dan, mesec, leto], (error, results) => {
    if (error) {
       console.log(error)
    }
   res.status(201).send(`Zapis dodan`)
  })
})


app.listen(process.env.PORT || 3000, function() {
  console.log('server running on port 3000', '');
});
