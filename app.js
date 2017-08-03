const
http = require('http'),
util = require('util'),
fs = require('fs'),
path = require('path'),
contentTypes = require('./utils/content-types'),
sysInfo = require('./utils/sys-info'),
env = process.env
R = require('ramda')

let server = http.createServer(function (req, res) {
  let url = req.url
  if (url == '/') {
    url += 'index.html'
  }

  // IMPORTANT: Your application HAS to respond to GET /health with status 200
  //            for OpenShift health monitoring

  if (url == '/health') {
    res.writeHead(200)
    res.end()
  } else if(url == '/ramdaeval' && req.method === 'POST') {
    var jsonString = ''

    req.on('data', function (data) {
      jsonString += data
    })

    req.on('end', function () {
      //console.log(JSON.parse(jsonString))
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', 'no-cache, no-store')
      with(R) {
        let postJson = JSON.parse(jsonString)
        let typedmsg = postJson.item.message.message
        let code = typedmsg.split('/ramda')[1]
        try {
          with(R) {
            res.end(JSON.stringify({
              'color': 'green',
              'message': util.inspect(eval(code)),
              'notify': false,
              'message_format': 'text'
            }))
          }
        } catch (err) {
          res.end(JSON.stringify({
            'color': 'red',
            'message': 'Check your functional fu my friend',
            'notify': false,
            'message_format': 'text'
          }))
        }
      }
    })

  } else if (url == '/info/gen' || url == '/info/poll') {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-cache, no-store')
    res.end(JSON.stringify(sysInfo[url.slice(6)]()))
  } else {
    fs.readFile('./static' + url, function (err, data) {
      if (err) {
        res.writeHead(404)
        res.end('Not found')
      } else {
        let ext = path.extname(url).slice(1)
        if (contentTypes[ext]) {
          res.setHeader('Content-Type', contentTypes[ext])
        }
        if (ext === 'html') {
          res.setHeader('Cache-Control', 'no-cache, no-store')
        }
        res.end(data)
      }
    })
  }
})

server.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function () {
  console.log(`Application worker ${process.pid} started...`)
})
