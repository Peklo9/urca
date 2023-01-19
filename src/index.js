const express = require ('express')
var cors = require('cors')
var parse = require('postgres-interval')

const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended:false}))

app.use(cors({
origin: 'https://peklo9.github.io/urcaStran/'
}))


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
      throw error
    }
    response.status(200).json(results.rows)
  })
}

app.get('/podatki', (req, res) => {
  client.query('SELECT * FROM urca', (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows)
  })
})

app.get('/stanje?:mesec?:leto', (req, res) => {
  let mesec = req.query.mesec
  let leto = req.query.leto

  client.query("select SUM(odhod.ura - prihod.ura - '08:00:00') as stanje from urca prihod join (select tip, ura, dan, mesec, leto from urca where tip = 'odhod' and mesec = $1 and leto = $2) as odhod  on prihod.dan = odhod.dan and prihod.mesec = odhod.mesec and prihod.leto = odhod.leto where prihod.tip = 'prihod'", [mesec, leto],
  (error, results) => {
    if (error) {
      throw error
    }
   //console.log(results.rows)
    res.status(200).json(results.rows)
  })
})

app.get('/tabela?:mesec?:leto', (req, res) => {
  let mesec = req.query.mesec
  let leto = req.query.leto

  console.log(mesec)

  client.query("select concat(prihod.dan, '.', prihod.mesec,'.', prihod.leto) as datum, prihod.id as prihod_id, TO_CHAR(prihod.ura, 'HH24:MI') as ura_prihoda, odhod.id as odhod_id, TO_CHAR(odhod.ura, 'HH24:MI') as ura_odhoda from urca prihod left join (select tip,id, ura, dan, mesec, leto from urca where tip = 'odhod' and mesec = $1 and leto = $2) as odhod  on prihod.dan = odhod.dan and prihod.mesec = odhod.mesec and prihod.leto = odhod.leto where prihod.tip = 'prihod' and prihod.mesec = $1 and prihod.leto = $2 order by datum;", [mesec, leto],
  (error, results) => {
    if (error) {
      throw error
    }
   //console.log(results.rows)
    res.status(200).json(results.rows)
  })
})

app.post('/posljiPodatke', async (req, res) => {
  const { tip, ura, dan, mesec, leto } = req.body
  let aliPodatki = await preveri(tip, dan, mesec, leto)
  if(aliPodatki === false) {
    console.log(tip)
    console.log(req.body)
    client.query('INSERT INTO urca (tip, ura, dan, mesec, leto) VALUES ($1, $2, $3, $4, $5);', [tip, ura, dan, mesec, leto], (error, results) => {
      if (error) {
       throw error
      }
    res.status(201).send(`Zapis dodan`)
    })
  }
  else {
    console.log('vneseno')
    res.status(409).send('Zapis je že vnesen')
  }
})

var preveri = (tip, dan, mesec, leto) => {
  return new Promise((resolve, reject) => {
     client.query("select * from urca where tip = $1 and dan = $2 and mesec = $3 and leto = $4;", [tip, dan, mesec, leto], (err, result) => {         
         if (err) {
            return reject(err);
         } else {
            if (result.rowCount > 0) {
                return resolve(true);
            } 
         }
         return resolve(false);
     });
 });
};

app.delete('/brisanje?:id', (req, res) => {
  let id = req.query.id
  client.query('delete from urca where id = $1', [id], (error, results) => {
    if (error) {
     throw error
    }
  res.status(201).send(`Zapis je izbrisan`)
  })
})

app.listen(process.env.PORT || 4000, function() {
  console.log('server running on port 3000', '');
});
