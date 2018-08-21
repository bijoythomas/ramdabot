
const
http = require('http'),
util = require('util'),
vm = require('vm'),
fs = require('fs'),
path = require('path'),
safeEval = require('safe-eval'),
R = require('ramda'),
_ = require('lodash'),
moment = require('moment'),
RF = require('ramda-fantasy')
const {create, env}  = require('sanctuary')
const S = create({checkTypes: process.env.NODE_ENV !== 'production', env})

exports.handler = (event, context, callback) => {

  try {
    if (event.channel_name !== 'jsbot') {
      callback(null, 'Run me in the #jsbot channel')
      return
    }
    let code = event.text.trim()

    // checking if requesting a ramda function definition
    if (R.test(/^[a-zA-Z]+$/, code) && R[code]) {
      let contents = fs.readFileSync('./node_modules/ramda/src/' + code + '.js', 'utf8')
      let comments = R.compose(
        R.join('\n'),
        R.head,
        R.splitWhen(line => line.startsWith(' */')),
        R.last,
        R.splitWhen(line => line.startsWith('/**')),
        R.split('\n')
      )(contents)
      return callback(null, {
        "response_type": "in_channel",
        "text": comments,
        "attachments": [{
          "color": "#00FF00"
        }]
      })
    }

    // run code
    let result = vm.runInNewContext(code, R.mergeAll([R, RF, {R, moment, _, S}]), {timeout: 5000})
    callback(null, {
      "response_type": "in_channel",
      "text": util.inspect(result),
      "attachments": [{
        "color": "#00FF00"
      }]
    })
  } catch (err) {
    console.error(err)
    callback(null, {
      "response_type": "in_channel",
      "text": "Check your JS foo my friend",
      "attachments": [{
        "color": "#FF0000"
      }]
    })
  }
};
