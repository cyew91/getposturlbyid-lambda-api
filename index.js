"use strict";
var AWS = require('aws-sdk');
const uuid = require('uuid');

// handleHttpRequest is the entry point for Lambda requests
exports.handleHttpRequest = function(request, context, done) {
  try {
    var postUrl = '';
    let response = {
      headers: {},
      body: '',
      statusCode: 200
    };

    switch (request.httpMethod) {
      case 'GET': {
        const id = request.pathParameters.id;
        console.log('GET');
        let dynamo = new AWS.DynamoDB();
        var params = {
          TableName: 'api_post_url_details',
          Key: { 'id' : { S: id } },
          ProjectionExpression: 'post_url'
        };
        // Call DynamoDB to read the item from the tableå
        dynamo.getItem(params, function(err, data) {
          if (err) {
            console.log("Error", err);
            throw `Dynamo Get Error (${err})`
          } else {
            console.log("Success", data.Item.post_url);
            postUrl = data.Item.post_url;
            response.body = JSON.stringify(data.Item.post_url);
            done(null, response);
          }
        });
        break;
      }
      case 'POST': {
        console.log('POST');
        let bodyJSON = JSON.parse(request.body || '{}');
        let dynamo = new AWS.DynamoDB();
        let params = {
            TableName: 'api_post_url_details',
            Item: {
            'id': { S: uuid.v1() },
            'post_url': { S: bodyJSON['post_url'] }
          }
        };
        dynamo.putItem(params, function(error, data) {
          if (error) throw `Dynamo Error (${error})`;
          else done(null, response);
        })
        break;
      }
    }
  } catch (e) {
    done(e, null);
  }
}