const cors = require('cors');
const express = require('express');
const admin = require('../config/admin');
const firestore = admin.firestore();
const path = require("path");



const dashboardController = express();

dashboardController.use(cors({ origin: true }));

dashboardController.set("views", path.join(__dirname, "views"));
dashboardController.set("view engine", "ejs");

dashboardController.get('/test', async (req, res) => {
    try{
        let userRef = firestore.collection('allstats').doc('stat');
        let snap = await userRef.get();

        res.render('dashboard', {
            stat: snap.data().allvisitor,
            user: snap.data().alluser,
            gen: snap.data().allgenerate,
            bounty: snap.data().allbounty,
            scan: snap.data().allscan
        });
    }catch(e){
        res.status(500).send({
            'statusCode': '500',
            'statusText': 'Internal Server Error',
            'error': true,
            'message': 'FUCTION NOT FOUND'
        });
    }
    

})



module.exports = dashboardController;