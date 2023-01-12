const express = require('express');
const router = express.Router();
const AWS = require("aws-sdk");
const keys = require("../config/keys");
const Files = require('./../models/files');

router.post('/', (req, res) => {

    var fileUrl;
    for(var myKey in req.body) {
        fileUrl=myKey;
     }
    var fileName = fileUrl.split('/')[3];

    let s3bucket = new AWS.S3({
        accessKeyId: keys.AwsAccessKeyId,
        secretAccessKey: keys.AwsSecretAccessKey,
        region: keys.region
    });

    var params = {
        Bucket: keys.bucketName,
        Delete: {
            Objects: [
              {
                Key: fileName 
              },
            ],
          }
    };

    s3bucket.deleteObjects(params, function(err, data) {
        if (err) {
            res.status(500).json({error: true, Message: err});
        }
        else{
            req.flash('success_msg','File Deleted!');
            res.redirect('/dashboard');

            Files.deleteOne({ fileUrl: fileUrl }, function (err) {
                if (err) {
                    return err;
                }
                else{
                    console.log('File deleted from database');
                }
                
              });
        }      
    });


});

module.exports = router;