'use strict';

var _ = require('lodash');

function createJobs(ids) {
  return ids.map(function(id) {
    return {
      target: 'sqs',
      queue: 'special',
      msg: {
        _id: id
      }
    };
  });
}

describe('firebase-to-sqs', function() {
  var FirebaseToSqs = require('./../src/index');

  describe('submitToSqsBatch', function() {
    // just a pass through message, nothing to test.
  });

  describe('submitToSqs', function() {
    jest.mock('aws-sdk');
    var AWS = require('aws-sdk');
    var sqs = new AWS.SQS();

    it('should do someting', function() {
      process.env.AWS_QUEUE_PREFIX = "testQ_";

      var job = {
        msg: 'job message',
        queue: 'sqs-queue'
      };

      return FirebaseToSqs.submitToSqs.call({ sqs: sqs }, job)
        .then(function(data) {
          expect(data).toEqual({
            MessageId: "message123",

            test: {
              params: {
                MessageBody: JSON.stringify(job.msg),
                QueueUrl: "testQ_sqs-queue"
              }
            }
          });
        });
    });
  });

  describe('mapToSqsBatch', function() {
    it('map to sqs message format', function() {
      process.env.AWS_QUEUE_PREFIX = "testQ_";
      var jobs = createJobs(["id123", "id456"]);

      return FirebaseToSqs.mapToSqsBatch(jobs)
        .then(function(data) {
          expect(data).toEqual([{
            QueueUrl: "testQ_special",
            Entries: [
              {
                // Id: 10,
                Id: "id123",
                MessageBody: JSON.stringify({ _id: "id123" })
              },
              {
                // Id: 11,
                Id: "id456",
                MessageBody: JSON.stringify({ _id: "id456" })
              },
            ]
          }]);
        });
    });
  });

  describe('queueUrl', function() {
    it('append to env', function() {
      process.env.AWS_QUEUE_PREFIX = "testQ_";
      expect(FirebaseToSqs.queueUrl("special")).toEqual("testQ_special");
    });
  });

  describe('factory', function() {
    jest.mock('aws-sdk');
    var AWS = require('aws-sdk');
    var sqs = new AWS.SQS();

    it('submit batch jobs', function() {
      process.env.FIREBASE_URL = "https://something.firebaseio.com/";
      process.env.FIREBASE_URL = "secret";
      process.env.AWS_QUEUE_PREFIX = "testQ_";

      var jobs = createJobs(["id123", "id456"]);
      function generateJobs(event) {
        return Promise.resolve(jobs);
      }

      var event = {};
      var context = {};

      return FirebaseToSqs.factory(generateJobs)(event, context)
        .then(function(data) {
          expect(data).toEqual([{
              Failed: [
              ],
              Successful: [
                {
                  Id: "id123",
                  MessageId: "MessageId_id123"
                },
                {
                  Id: "id456",
                  MessageId: "MessageId_id456"
                }
              ],
              // test: {
              //   params: {
              //     MessageBody: JSON.stringify(jobs[0].msg),
              //     QueueUrl: "testQ_sqs-queue"
              //   }
              // }
            }]);
        });
    });

    it('submit multiple batch jobs', function() {
      process.env.FIREBASE_URL = "https://something.firebaseio.com/";
      process.env.FIREBASE_URL = "secret";
      process.env.AWS_QUEUE_PREFIX = "testQ_";

      var jobIds = _.range(20);
      var jobs = createJobs(jobIds.map(String));
      function generateJobs(event) {
        return Promise.resolve(jobs);
      }

      var event = {};
      var context = {};

      return FirebaseToSqs.factory(generateJobs)(event, context)
        .then(function(data) {
          expect(data.length).toEqual(2);
        });
    });
  });

});
