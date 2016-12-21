"use strict";

let firebase = jest.genMockFromModule('firebase');

// let firebase = jest.requireActual('firebase');

// firebase.prototype.authWithCustomToken = jest.genMockFn();
// firebase.prototype.authWithCustomToken.mockImplementation((token, callback) => {
  // console.log('authWithCustomToken', token);
  // return callback(null, { uid: '123' });
// });

// firebase.prototype.authWithCustomToken.mockImplementation((token, callback) => {
//   console.log('authWithCustomToken', token);
//   return callback(null, { uid: '123' });
// });

module.exports = firebase;
