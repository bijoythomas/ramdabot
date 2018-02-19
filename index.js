
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
    let code = event['body-json'].item.message.message.split('/ramda')[1]
    let result = vm.runInNewContext(code, R.mergeAll([R, RF, {R, moment, _, S}]), {timeout: 5000})
    callback(null, {
        'color': 'green',
        'message': util.inspect(result),
        'notify': false,
        'message_format': 'text'
    })
  } catch (err) {
    console.error(err)
    callback(null, {
        'color': 'red',
        'message': 'Check your functional fu my friend' + '\n' + err,
        'notify': false,
        'message_format': 'text'
    })
  }
};
