const fetch = require('./fetchPdf.js');
const parse = require('./parsePdf.js');
const util = require('./Util.js');
const fs = require('fs-extra');
const md5File = require('md5-file');
const Koa = require('koa');
const Router = require('koa-router');

var app = new Koa();
var router = new Router();

var cached = [];

const pdfPath = './pdf/ON_Mailer.pdf';
async function fetchAndParse() {
    let url = await fetch.fetch();
    let fileExist = await util.fileExist(pdfPath);
    if (fileExist) await fs.rename(pdfPath, pdfPath+'.bak');
    await util.downloadFile(url, pdfPath);
    if (fileExist && util.sameFile(pdfPath, pdfPath+'.bak')){
        console.log('No new coupons found');
        return cached;
    }
    let text = await parse.parsePdf(pdfPath);
    console.log('New coupons fetched');
    cached = text;
    return text;
}

router.get('/getCoupons', async ctx => {
    let text = await fetchAndParse();
    ctx.status = 200;
    ctx.body = text;
});

app.use(router.routes())
   .use(router.allowedMethods());

app.listen(3060, () => console.log('App listening on 3060'));
