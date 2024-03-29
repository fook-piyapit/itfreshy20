const cors = require('cors');
const express = require('express');
const admin = require('../config/admin');
const firestore = admin.firestore();
const profileController = express();
const bunyan = require("bunyan");
const e = require('express');
const log = bunyan.createLogger({ name: "myapp" });
const minify = require("express-minify");
const { auth } = require('firebase-admin');
const authService = auth(); 

profileController.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "https://itfreshy2020.web.app");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,Content-Type,Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
  });
profileController.use(minify());
profileController.use(cors({ origin: true }));
profileController.post('/create', isLoggedIn, async (req, res) => {
    //Create users profile
    //try {
        let batch = firestore.batch();
        let uid = req.user.uid; //require front-end send uid to know where to update the info
        let userRef = firestore.collection('users').doc(uid);
        let haveUID = await userRef.get();
        let {id, fname, surname, nickname, age, sex, religion, branch, year, contact, like ,player,gate} = req.body;
        
        let status;
        if (year == 1){
            status = "pirate"
        } else {
            status = "captain"
        }

        let payload = {};
        if (year >= 3) {
            payload = {
                'id' : id,
                'fname' : fname,
                'surname' : surname,
                'nickname' : nickname,
                'age' : age,
                'sex' : sex,
                'religion' : religion,
                'branch' : branch,
                'year' : year,
                'contact' : contact,
                'like' : null,
                'newuser': 0,
                'point': 0,
                'player': player,
                'status' : status
            }
        } else {
            if (like.length != 5) {
                res.status(400).send({
                    'statusCode' : '400',
                    'statusText' : 'Bad Request',
                    'error' : true,
                    'message' : 'INVALID PAYLOAD'
                });
                return ;
            }
            else if (year == 1) {
            payload = {
                'id' : id,
                'fname' : fname,
                'surname' : surname,
                'nickname' : nickname,
                'age' : age,
                'sex' : sex,
                'religion' : religion,
                'branch' : branch,
                'year' : year,
                'contact' : contact,
                'like' : {
                    '1' : like[0],
                    '2' : like[1],
                    '3' : like[2],
                    '4' : like[3],
                    '5' : like[4]
                },
                'newuser': 0,
                'point': 0,
                'player': player,
                'status' : status,
                'gate': gate
            }}
            else{
                payload = {
                    'id' : id,
                    'fname' : fname,
                    'surname' : surname,
                    'nickname' : nickname,
                    'age' : age,
                    'sex' : sex,
                    'religion' : religion,
                    'branch' : branch,
                    'year' : year,
                    'contact' : contact,
                    'like' : {
                        '1' : like[0],
                        '2' : like[1],
                        '3' : like[2],
                        '4' : like[3],
                        '5' : like[4]
                    },
                    'newuser': 0,
                    'point': 0,
                    'player': player,
                    'status' : status,
                    'gate': gate
                }

            }
        }
        //Check that we have this uid in db or not?
        if (haveUID.exists){
        // upload payload that have all info to db
        batch.update(userRef, payload);

        // Create info in 'scans' db
        let scan = [];
        scan.push(uid);
        batch.set(firestore.collection('scans').doc(uid), {
            'scan' : scan,
            'uid' : uid,
            'year': year,
        });
            
        // if input year = 1
        // Update uid in db 'secretfromuser'
        if (year == 1){
            batch.update(firestore.collection('secretfromuser').doc(id), {
                'family' : "",
                'uid' : uid
            });
        }
        } else {
            res.status(404).send({
                'statusCode' : '404',
                'statusText' : 'Not Found',
                'error' : true,
                'message' : 'UID NOT FOUND'
            }); 
            return ;
        }

        await batch.commit();

        res.status(200).send({
            'statusCode' : '200',
            'statusText' : 'OK',
            'error' : false,
            'message' : 'PROFILE UPDATED',
            'data' : payload
        }); 
        return ;

    //} 
    // catch (e) {
    //     log.info(e);
    //     res.status(500).send({
    //         'statusCode': '500',
    //         'statusText': 'Internal Server Error',
    //         'error': true
    //     });
    // } 
    return;
});

profileController.put('/edit',isLoggedIn, async (req, res) => {
    //Edit(Change info) users profile on db
    try {
        let uid = req.user.uid; //require front-end send uid to know where to update the info
        let {fname, surname, nickname, age, sex, religion, contact} = req.body;
        // อันไหนที่ไม่ต้องการให้แก้ให้ก็ให้ frontend lock ไว้ เอาเเล้วกันนะ!

        let payload = {
            'fname' : fname,
            'surname' : surname,
            'nickname' : nickname,
            'age' : age,
            'sex' : sex,
            'religion' : religion,
            // 'branch' : branch,
            // 'year' : year,
            'contact' : contact
        };

        let userRef = firestore.collection('users').doc(uid);
        let haveUID = await userRef.get();

        //Check that we have this uid in db or not?
        if (haveUID.exists) {
            let userData = haveUID.data(); //that UID exist on db so let's get it's data

            //Ternary operation
            //syntax: condition ? exprIfTrue : exprIfFalse
            //This mean if front-end didn't send anything we gonna let's each info be the same as on db
            //but if front-end send changed info we gonna put it to db by payload
            fname =  req.body.fname == null ? userData.fname : req.body.fname;
            surname =  req.body.surname == null ? userData.surname : req.body.surname;
            nickname =  req.body.nickname == null ? userData.nickname : req.body.nickname;
            age =  req.body.age == null ? userData.age : req.body.age;
            sex =  req.body.sex == null ? userData.sex : req.body.sex;
            religion =  req.body.religion == null ? userData.religion : req.body.religion;
            // branch =  userData.branch;  //cannot change so we return the same data to db
            // year = userData.year;   //cannot change so we return the same data to db
            contact =  req.body.contact == null ? userData.contact : req.body.contact;
            // like = userData.like;

            let payload = {
                'fname' : fname,
                'surname' : surname,
                'nickname' : nickname,
                'age' : age,
                'sex' : sex,
                'religion' : religion,
                // 'branch' : branch,
                // 'year' : year,
                'contact' : contact
            };
            
            await userRef.update(payload);

            res.status(200).send({
                'statusCode': '200',
                'statusText': 'OK',
                'error': false,
                'message': 'PROFILE UPDATED',
                'data updated': payload
            });
            return;
            // If uid is not exist on db then mean the we don't have that uid on db
        } else {
            res.status(404).send({
                'statusCode': '404',
                'statusText': '404 Not Found',
                'error': true,
                'message': 'UID NOT FOUND'
            });
        }
        return;
    }
    catch (e) {
        log.info(e);
        res.status(500).send({
            'statusCode': '500',
            'statusText': 'Internal Server Error',
            'error': true
        });
    } return;
});

profileController.get('', async (req, res) => {
    //To get users info in db and put it to front-end as them requst
    try {
        let uid = req.headers.uid;
        let userDoc = await firestore.collection('users').doc(uid).get();

        if (userDoc.exists) {
            let userData = userDoc.data();

            res.status(200).send({
                'statusCode': '200',
                'statusText': 'OK',
                'error': false,
                'message': 'DATA FOUND',
                'data': userData
            });
            return;
        } else {
            res.status(404).send({
                'statusCode': '404',
                'statusText': 'Not Found',
                'error': true,
                'message': 'UID NOT FOUND'
            });
        } return;
    } catch (e) {
        log.info(e);
        res.status(500).send({
            'statusCode': '500',
            'statusText': 'Internal Server Error',
            'error': true
        });
        return;
    }
});

profileController.put('/scaned', async (req, res) => {
    //To get users info in db and put it to front-end as them requst
    //And update info in db 'scans'
    try {
        let uid = req.headers.uid; //uid ของคนที่แสกนไป
        let userRef = await firestore.collection('users').doc(uid).get();

        if (userRef.exists) {
            let userDoc = userRef.data();
            let userData = {
                'name' : userDoc.name,
                'year' : userDoc.year,
                'pic' : userDoc.pic,
            };
            let userLike = userDoc.like;
            await firestore.collection('scans').doc(uid).update(userData);

            res.status(200).send({
                'statusCode' : '200',
                'statusText' : 'OK',
                'error' : false,
                'message' : 'SCAN FOUND',
                'data' : userData,
                'like' : userLike
                });
            return ;
        } else {
            res.status(404).send({
                'statusCode' : '404',
                'statusText' : 'Not Found',
                'error' : true,
                'message' : 'UID NOT FOUND'
            });
            return ;
        }

    } catch (e) {
        log.info(e);
        res.status(500).send({
            'statusCode' : '500',
            'statusText' : 'Internal Server Error',
            'error' : true
        });
        return ;
    }

});

profileController.put('/answer', async (req, res) => {
    // try {
        
        // นายต้องส่งกลับมาเป็น object นะ เเล้วก็บอกด้วยว่าอันไหนคือคำตอบของข้อไหน
        // let answer = {
        // first : (number)
        // second : (number)
        // third : (number)
        // fourth : (number)
        // fifth : (number)
        // };
        let answer = req.body.answer;
        let year = req.headers.year; //require ปีของคนที่ตอบคำถามอ่ะ หมายถึง คนที่ทำอยู่นะไม่ใช่เจ้าของคำถามนั้นๆ

        let score = 0;
        score += answer.first * 2.5;
        score += answer.second * 2;
        score += answer.third *  1.5;
        score += answer.fourth * 1.25;
        score += answer.fifth;

        let id = req.headers.id; // uid น้องบน firebase ไม่ใช่ Token ยาวๆนะ ชื่อ DOC ใน 'users' อ่ะ
        let uid = req.headers.uid;  // uid พี่บน firebase ไม่ใช่ Token ยาวๆนะ ชื่อ DOC ใน 'users' อ่ะ
        //owner = ของน้อง in every อันเลย
        //scorer = ของพี่ in every อันเลย

        //if he/she is 1st year
        if (year == 1) {
            if (id != undefined) {
                let owner = await firestore.collection('users').doc(id).get();
                let owner_data = owner.data();
                let owner_id = owner_data.id;

                let scorer = await firestore.collection('users').doc(uid).get();
                let scorer_data = scorer.data();
                let scorer_id = scorer_data.id;                

                let userRef = firestore.collection('secretfromuser').doc(owner_id);
                let userGet = await userRef.get();
                let userData = userGet.data();

                let user = userData.score.filter(element => element.uid == scorer_id);

                if (user.length != 0) {
                    let total = user[0].point;
                    if (total != 0) {
                        score += total;
                        let remove = {
                            'uid' : scorer_id,
                            'point' : total
                        }
                        await userRef.update({
                            'score' : admin.firestore.FieldValue.arrayRemove(remove)
                        });
                    }
                }
                    let payload = {
                        'uid' : scorer_id,
                        'point' : score
                    }
                    console.log(payload);
                    await userRef.update({
                        'score' : admin.firestore.FieldValue.arrayUnion(payload)
                    });

                res.status(200).send({
                    'statusCode' : '200',
                    'statusText' : 'OK',
                    'error' : false,
                    'message' : 'SCORE UPDATE',
                    'score' : score
                });
                return ;

            } else {
                res.status(404).send({
                    'statusCode' : '404',
                    'statusText' : 'Not Found',
                    'error' : true,
                    'message' : 'ID NOT FOUND'
                });
                return ;
            }
        }
        else if (year >= 2) {
            if (uid != undefined) {
                let x = uid; // uid พี่ สลับค่ากัน
                uid = id; // id น้อง nws
                id = x; // uid พี่ 1tx

                let owner = await firestore.collection('users').doc(uid).get();
                let owner_data = owner.data();
                let owner_id = owner_data.id;

                let scorer = await firestore.collection('users').doc(id).get();
                let scorer_data = scorer.data();
                let scorer_id = scorer_data.id;

                let userRef = firestore.collection('secretfromuser').doc(owner_id);
                let userGet = await userRef.get();
                let userData = userGet.data();

                let user = userData.score.filter(element => element.uid === scorer_id);
                
                if (user.length != 0) {
                    let total = user[0].point;
                    if (total != 0) {
                        score += total;
                        let remove = {
                            'uid' : scorer_id,
                            'point' : total
                        }
                        await userRef.update({
                            'score' : admin.firestore.FieldValue.arrayRemove(remove)
                        });
                    }
                }
                let payload = {
                    'uid' : scorer_id,
                    'point' : score
                }
                console.log(payload);
                await userRef.update({
                    'score' : admin.firestore.FieldValue.arrayUnion(payload)
                });

                res.status(200).send({
                    'statusCode' : '200',
                    'statusText' : 'OK',
                    'error' : false,
                    'message' : 'SCORE UPDATE',
                    'score' : score
                });
                return
            } else {
                res.status(404).send({
                    'statusCode' : '404',
                    'statusText' : 'Not Found',
                    'error' : true,
                    'message' : 'UID NOT FOUND'
                });
                return ;
            }
        }

    // } catch (e) {
    //     console.log(e);
    //     res.status(500).send({
    //         'statusCode' : '500',
    //         'statusText' : 'Internal Server Error',
    //         'error' : true,
    //     });
    //     return ;
    // }
});



// One-use function
// To Create All year1 profile
// profileController.post('/total', async (req, res) => {
//     // Create all year1 users in db 'secretfromuser' to keep info family and uid
//     try {
//         let userRef = firestore.collection('secretfromuser');
//         let batch = firestore.batch();

//         for (let i = 63070001; i < 63070252; i++) {
//             let ref = i.toString();
//             batch.set(userRef.doc(ref), {'family' : '', 'uid':'', 'score' : []});
//         }
//         await batch.commit();

//         res.status(200).send({
//             'statusCode' : '200',
//             'statusText' : 'OK',
//             'error' : false,
//             'message' : 'All Year1 users has been created'
//             }); 

//     } catch (e) {
//         log.info(e);
//         res.status(500).send({
//             'statusCode' : '500',
//             'statusText' : 'Internal Server Error',
//             'error' : true
//         });
//         return ;
//     }
// });


// Another One-Used function
// To rnadom gate of year1 users
// profileController.put('/gate/random', async (req, res) => {
//     try {
//         let gate = ['AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND',
//         'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND',
//         'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND',
//         'AND','AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND', 'AND',
//         'AND', 'AND', 'AND', 'AND', 'AND','OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR',
//         'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR',
//         'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR',
//         'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR', 'OR','NOR', 'NOR', 'NOR',
//         'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR',
//         'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR',
//         'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR',
//         'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOR', 'NOT', 'NOT', 'NOT', 'NOT',
//         'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT',
//         'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT',
//         'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT',
//         'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT', 'NOT'];

//         let batch = firestore.batch();

//         for (let i = 63070001; i < 63070252; i++) {
//             let index = Math.floor(Math.random() * gate.length);
//             let user_gate = gate[index];
//             gate.splice(index, 1);
//             let ref = firestore.collection('secretfromuser').doc(i.toString());
//             console.log(i.toString() + "'s Gate is " + user_gate);
//             batch.update(ref, {'gate': user_gate});
//         }
//         batch.commit();

//         res.status(200).send({
//             'statusCode' : '200',
//             'statusText' : 'OK',
//             'error' : false,
//             'message' : 'Random Complete',
//             }); 
//         return ;
//     } catch (e) {


//         console.log(e);
//         res.status(500).send({
//             'statusCode' : '500',
//             'statusText' : 'Internal Server Error',
//             'error' : true
//         });
//         return ;
//     }
// });

profileController.post('/nubyear', async(req, res) => {
    try {
        let users = await firestore.collection('scans').get();
        users.forEach(async function (element) {
            let user = element.data();
            // let year1 = 0;
            // let year2 = 0;
            // let year3 = 0;
            // let year4 = 0;
            // for (let i = 1; i < user.scan.length; i++) {
            //     scan_ref = firestore.collection('users').doc(user.scan[i]);
            //     scan_get = await scan_ref.get();
            //     scan_data = scan_get.data();
            //     year = scan_data.year;
            //     year == "1" ? year1++ : null;
            //     year == "2" ? year2++ : null;
            //     year == "3" ? year3++ : null;
            //     year == "4" ? year4++ : null;
            // }
            // await firestore.collection('users').doc(user.uid).update({
            //     'all_year1' : 0,
            //     'all_year2' : 0,
            //     'all_year3' : 0,
            //     'all_year4' : 0
            // });
            await firestore.collection('users').doc(user.uid).update({
                'year1' : 0,
                'year2' : 0,
                'year3' : 0,
                'year4' : 0
            });
        });

        res.status(200).send({
            'statusCode' : '200',
            'statusText' : 'OK',
            'error' : false,
            'message' : 'Random Complete',
            }); 
        return ;
    } catch (e) {
        console.log(e);
        res.status(500).send({
            'statusCode' : '500',
            'statusText' : 'Internal Server Error',
            'error' : true
        });
        return ;
    }
});

//exports this function to index.js
async function isLoggedIn(req, res, next) {
    const idToken = req.header('FIREBASE_AUTH_TOKEN');
    let decodedIdToken;
    try {
      decodedIdToken = await authService.verifyIdToken(idToken);
    } catch (error) {
      next(error);
      return;
    }
    req.user = decodedIdToken;
    next();
  }
module.exports = profileController;