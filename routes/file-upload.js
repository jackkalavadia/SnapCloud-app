const express = require('express');
const router = express.Router();
const AWS = require("aws-sdk");
const multer = require("multer");
const keys = require("../config/keys");
const Files = require('./../models/files');
// var array = require('./arrayFile.js');

 const storage = multer.memoryStorage();
 const upload = multer({storage: storage, limits: {fileSize: 10 * 1024 * 1024}}).single('myImage');

// router.get('/upload',(req,res)=>res.render('dashboard'));
// POST to upload
// upload file to s3 and log file details
router.post('/', (req, res) => {

  upload(req, res, (err) => {
      
    const moment = require('moment');    
    //File Upload started
    var startDate = new Date();
  
    const uemail = req.user.email;
    const uname = req.user.name;

    const file = req.file;

    if(!file){
      req.flash('error_msg','Please select a file');
      res.redirect('/dashboard');
    }
    else{

      const s3FileURL = keys.s3Url;

      let s3bucket = new AWS.S3({
          accessKeyId: keys.AwsAccessKeyId,
          secretAccessKey: keys.AwsSecretAccessKey,
          region: keys.region
      });

      //Location of store for file upload

      var params = {
          Bucket: keys.bucketName,
          Key: file.fieldname+('-')+Date.now(),
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: "public-read"
      };

      s3bucket.upload(params, function (err, data) {
        var cnt = "";

        if (err) {
            res.status(500).json({error: true, Message: err});
        } else {
            //success
            req.flash('success_msg','File Uploaded!');
            res.redirect('/dashboard');
            //res.send(data.Location);

            //File Upload ended       
            var endDate   = new Date();
            
            const newFile = new Files({
              user : uname,
              email : uemail,
              fileUrl:data.Location,
              fileName: file.originalname,
              fileDesc: file.originalname,
              uploadTime: ((endDate - startDate) / 1000),
              modifiedDate: ((endDate - startDate) / 1000)
          });
            //check if already exisits
            Files.findOne({ fileName:file.originalname })
            .then( (fileName) => {

                newFile.save()
                .then(file => {
                  console.log('File Uploaded');
              })
              .catch(err=>console.log(err));
            });

        }
    });

    }
  
  });
});

module.exports = router;