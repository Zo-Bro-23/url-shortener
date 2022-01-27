const express = require('express')
const app = express()
const fs = require('fs')
const urls = require('./urls.json')
const randomstring = require('randomstring')
const charset = require('./charset.json').charset
app.listen(5210)

app.get('/shorten', (req, resp) => {
    if (!req.query.url) {
        resp.status(400)
        resp.send('Gimme a URL to shorten.')
        return
    } else if (!req.query.alias) {
        resp.status(400)
        resp.send('Gimme your preferred alias.')
        return
    }

    let expiry
    let password
    let views

    if (!req.query.expiry) {
        expiry = false
    } else {
        expiry = req.query.expiry
    }

    if (!req.query.password) {
        password = 'f@ls#'
    } else {
        password = req.query.password
    }

    if (!req.query.views) {
        views = false
    } else {
        views = req.query.views
    }

    const preferred = req.query.alias
    if (urls.aliases[preferred]) {
        resp.status(412)
        resp.send('Sorry! The requested alias is already taken.')
        return
    }
    urls.aliases[preferred] = {
        url: req.query.url,
        expiry,
        views,
        password,
        current_views: 0,
        created: Date.now()
    }
    resp.send('Done!')
    fs.writeFileSync('./urls.json', JSON.stringify(urls, null, 4))
})

app.get('/random', (req, resp) => {
    if (!req.query.url) {
        resp.status(400)
        resp.send('Gimme a URL to shorten.')
        return
    }

    let expiry
    let password
    let views

    if (!req.query.expiry) {
        expiry = false
    } else {
        expiry = req.query.expiry
    }

    if (!req.query.password) {
        password = 'f@ls#'
    } else {
        password = req.query.password
    }

    if (!req.query.views) {
        views = false
    } else {
        views = req.query.views
    }

    const preferred = randomstring.generate({
        length: 6,
        readable: true,
        charset: charset
    })
    check
    function check() {
        if (urls.aliases[preferred]) {
            preferred = randomstring.generate({
                length: 6,
                readable: true,
                charset: charset
            })
            check()
        } else {
            return
        }
    }
    urls.aliases[preferred] = {
        url: req.query.url,
        expiry,
        views,
        password,
        current_views: 0,
        created: Date.now()
    }
    resp.send(`realtime/${preferred}`)
    fs.writeFileSync('./urls.json', JSON.stringify(urls, null, 4))
})

app.get('/:alias', (req, resp) => {
    const object = urls.aliases[req.params.alias]
    if (object) {
        resp.send(`
        <html>
        <script>
        function everything(){
        if(${object.expiry}){
            if(${object.created} + ${object.expiry} < Date.now()){
                window.location.replace('realtime/expired')
                return
            }
        }
        if(${object.views}){
            if(${object.current_views + 1} > ${object.views}){
                window.location.replace('realtime/expired')
                return
            }
        }
        if('${object.password}' !== 'f@ls#'){
            promptFunc()
            function promptFunc(){
            if(prompt("That's not right! Please enter the password to continue to the site:") !== '${object.password}'){
                promptFunc()
            }else{
                return
            }
            }
        }
        ${object.current_views++}
        window.location.replace('${object.url}')
    }
    everything()
        </script>
        </html>
        `)
        fs.writeFileSync('./urls.json', JSON.stringify(urls, null, 4))
    } else {
        resp.redirect('realtime/404')
    }
})

app.get('/')

app.get('/404')

app.get('/expired')