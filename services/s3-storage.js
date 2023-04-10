const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  region: "eu-west-1",
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  endpoint: process.env.AWS_ENDPOINT,
  signatureVersion: "v4",
  params: {},
});

module.exports = s3;
