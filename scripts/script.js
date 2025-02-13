const express = require('express')
const app = express()
app.set('view-engine', 'ejs')

// This alows the ejs files to recognize CSS styling in the public folder
var path = require('path')
app.use(express.static('../public'))
app.use(express.static(path.join(__dirname, "../public")))


app.listen(3000)

app.get('/', (req,res) => {
    res.render('index.ejs')
})

