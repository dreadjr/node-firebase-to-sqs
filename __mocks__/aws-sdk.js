'use strict';
const AWS = jest.genMockFromModule('aws-sdk');

AWS.SQS.prototype.sendMessage = function(params, callback) {
  callback(null, {
    MessageId: "message123",

    // for testing
    test: {
      params: params
    }
  });
}

AWS.SQS.prototype.sendMessageBatch = function(params, callback) {
  callback(null, {
    Failed: [
    ],
    Successful: params.Entries.map(function(m) {
      var id = JSON.parse(m.MessageBody)._id;

      return {
        Id: id,
        MessageId: "MessageId_" + id
      }
    })
    // Successful: [
    //   {
    //     Id: "FuelReport-0001-2015-09-16T140731Z",
    //     MD5OfMessageAttributes: "10809b55...baf283ef",
    //     MD5OfMessageBody: "203c4a38...7943237e",
    //     MessageId: "d175070c-d6b8-4101-861d-adeb3EXAMPLE"
    //   },
    //   {
    //     Id: "FuelReport-0002-2015-09-16T140930Z",
    //     MD5OfMessageAttributes: "55623928...ae354a25",
    //     MD5OfMessageBody: "2cf0159a...c1980595",
    //     MessageId: "f9b7d55d-0570-413e-b9c5-a9264EXAMPLE"
    //   }
    // ],
    // test: {
    //   params: {
    //     MessageBody: JSON.stringify(jobs[0].msg),
    //     QueueUrl: "testQ_sqs-queue"
    //   }
    // }
  });
}

module.exports = AWS;
