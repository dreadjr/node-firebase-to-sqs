var AWS = require('aws-sdk');
var Promise = require('bluebird');
var Firebase = require('firebase');
var _ = require('lodash');
var debug = require('debug');
var error = debug('firebase-to-sqs:error');
var log = debug('firebase-to-sqs:log');


function submitToSqsBatch(params) {
  //var params = {
  //  Entries: _.map(jobs, function(job, idx) {
  //    return {
  //      Id: job.msg._id,
  //      MessageBody: JSON.stringify(job.msg)
  //    }
  //  }),
  //
  //  QueueUrl: queueUrl(job.queue)
  //};

  var self = this;

  return new Promise(function(resolve, reject) {
    self.sqs.sendMessageBatch(params, function (err, data) {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
}

function submitToSqs(job) {
  var params = {
    MessageBody: JSON.stringify(job.msg),
    QueueUrl: queueUrl(job.queue)
  };

  return new Promise(function(resolve, reject) {
    sqs.sendMessage(params, function (err, data) {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
}

function mapToSqsBatch(records) {
  var max = 10;

  function queueUrl(queue) {
    return process.env.AWS_QUEUE_PREFIX + queue;
  }

  var chain = _.chain(records)
    .groupBy('queue')
    .map(function(v, k) {
      return _.chunk(v, max).map(function (c, cIdx) {
        return {
          QueueUrl: queueUrl(k),
          Entries: _.map(c, function (job, idx) {
            return {
              Id: job.msg._id || ((max * cIdx) + idx).toString(),
              MessageBody: JSON.stringify(job.msg)
            };
          })
        };
      });
    })
    .flatten();

  return Promise.resolve(chain.value());
}

function factory(func) {
  return function(event, context) {
    var sqs = new AWS.SQS();
    var fb = new Firebase(process.env.FIREBASE_URL);

    return Promise.resolve(fb.authWithCustomToken(process.env.FIREBASE_SECRET))
      .then(function(authData) {
        return func.call({ firebase: fb}, event);
      })
      .then(mapToSqsBatch)
      .bind({ sqs: sqs})
      .map(submitToSqsBatch);
  };
}

module.exports = {
  factory: factory,

  submitToSqsBatch: submitToSqsBatch,
  submitToSqs: submitToSqs,
  mapToSqsBatch: mapToSqsBatch
};
