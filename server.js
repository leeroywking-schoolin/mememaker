const express = require('express');
const cors = require('cors');
const ejs = require('ejs');
const dotenv = require('dotenv');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public/'));
const methodOverride = require('method-override');

app.use(methodOverride((request, response) => {
    if (request.body && typeof request.body === 'object' && '_method' in request.body) {
        // look in urlencoded POST bodies and delete it
        let method = request.body._method;
        delete request.body._method;
        return method;
    }
}));

const client = new pg.Client(process.env.DATABASE_URL);

client.connect();
client.on('error', err => console.log(err));

app.set('view engine', 'ejs');
app.get('/', loadHomePage);
app.post('/detail/:memeid', loadDetail)
app.post('/makeMeme', makeMeme)


function loadHomePage(request, response){
let memeList = [];
superagent.get('https://api.imgflip.com/get_memes')
.then(reply => {
    memeList = reply.body.data.memes
    response.render('pages/index', { memeList: memeList})
})
.catch(err => errorHandler(err));
}

function loadDetail(request, response){
    let memeid = request.params.memeid;
    let memeInfo = request.body.memeInfo;
    console.log(memeInfo)
    console.log(memeid);
    response.render('pages/detailview', {memeInfo: memeInfo});
}

function makeMeme(request, response){
    console.log(request.body.text)
    memeid = request.body.text[0];
    let text0=request.body.text[1];
    let text1=request.body.text[2];
    let auth = `&username=${proccess.env.username}&password=${process.env.password}`
    let url = `https://api.imgflip.com/caption_image?template_id=${memeid}`
    url = url + `&text0=${text0}&text1=${text1}`
    url = url + auth
    superagent.get(url)
    .then(memeResponse => console.log(memeResponse.body.data))
}

const errorHandler = (err, response) => {
    console.log(err);
    if (response) response.status(500).render('pages/error');
  }