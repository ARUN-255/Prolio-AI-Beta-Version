const express = require('express');
const router = express.Router();

router.get('/',function(req,res){
    res.json({message:'AI routes comming soon'});
});

module.exports = router;