var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');
const nodemailer = require("nodemailer");
const session = require('express-session');
let list = [];
let userlati = 0;
let querylat = 0;
let smalldis = 9007199254740991;
// display books page
router.get('/', function (req, res, next) {

    dbConn.query('SELECT * FROM food', function (err, rows) {
        let flag = req.session.flag;
        let city = req.session.city;
        console.log(flag);
        console.log(city);
        if (err) {
            req.flash('error', err);
            // render to views/books/index.ejs

            res.render('books', { data: '', flag: '', city: '' });
        } else {
            // render to views/books/index.ejs
            res.render('books', { data: rows, flag: flag, city: city });
        }
    });
});
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180; // Convert degrees to radians
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}
// function getUserLocation() {
//     if (global.navigator.geolocation) {
//         global.navigator.geolocation.getCurrentPosition(showPosition);
//     } else {
//         alert("Geolocation is not supported by this browser.");
//     }
// }
function showPosition(userLat, userLon) {

    // Example destination addresses

    // Convert addresses to coordinates using a geocoding service or API
    // For simplicity, let's assume we already have the coordinates
    for (let i = 0; i < list.length; i++) {
        if (list[i].lat != null && list[i].log != null) {
            const distanceToAddress = calculateDistance(userLat, userLon, list[i].lat, list[i].log);
            if (distanceToAddress <= smalldis) {
                smalldis = distanceToAddress;
                querylat = list[i].lat;
            }
        }

    }
    console.log(querylat);
    console.log(smalldis);
    console.log("hereeeee");
}
router.get('/loc/(:city)/(:flag)', function (req, res, next) {
    // render to add.ejs
    let city = req.params.city;
    let flag = req.params.flag;
    console.log(city);

    // dbConn.query(`SELECT * FROM food where city= '${city}' order by lat ASC LIMIT 1`, function (err, rows) {
    dbConn.query('SELECT * FROM food', function (err, rows) {

        for (let i = 0; i < rows.length; i++) {
            let obj = {};
            obj.lat = rows[i].lat;
            obj.log = rows[i].log;
            console.log(rows[i].lat);
            console.log(rows[i].log);
            list.push(obj);
        }

        console.log(list);
        console.log(global.ulatitude, global.ulongitude);
        showPosition(global.ulatitude, global.ulongitude);
        dbConn.query(`SELECT * FROM food where lat BETWEEN '${querylat - 0.025}' AND '${querylat + 0.025}'  order by lat `, function (err, rows) {
            console.log(`SELECT * FROM food where lat BETWEEN '${querylat - 0.025}' AND '${querylat + 0.025}'  order by lat `);
            console.log("done");
            res.render('books', { data: rows, flag: flag, city: city });
        });

    });
})
router.get('/history', function (req, res, next) {

    console.log(global.mail);
    dbConn.query(`SELECT * FROM food where email= '${global.mail}'`, function (err, rows) {
        let flag = req.session.flag;
        console.log(rows.length);
        if (err) {
            req.flash('error', err);
            // render to views/books/index.ejs

            res.render('books/history', { data: '', flag: '' });
        } else {
            // render to views/books/index.ejs
            res.render('books/history', { data: rows, flag: flag });
        }
    });
});
//-------------------------------------------------------------------------------------
// display add book page
router.get('/add', function (req, res, next) {
    // render to add.ejs
    res.render('books/add', {
        name: '',
        author: ''
    })
})
router.get('/login', function (req, res, next) {
    // render to add.ejs
    res.render('books/login')
})
router.get('/historyLogin', function (req, res, next) {
    // render to add.ejs
    res.render('books/historyLogin')
})
// router.get('/userRegistration', function (req, res, next) {
//     // render to add.ejs
//     res.render('books/userRegistration')
// })
router.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
router.post('/login', function (req, res, next) {
    let email = req.body.email;
    let password = req.body.password;

    dbConn.query(`SELECT * FROM login WHERE email = '${email}' AND password='${password}'`, function (err, rows, fields) {
        if (err) throw err
        if (rows.length <= 0) {
            req.flash('error', 'No user found')
            res.redirect('/books/login')
        }
        else {
            // router.use(function (req, res, next) {
            //     res.locals.currentUser = row[0].flag;////
            //     next()
            // })

            req.session.flag = rows[0].flag;
            req.session.city = rows[0].city;
            global.ulatitude = rows[0].lat;
            global.ulongitude = rows[0].log;
            res.redirect('/books');
        }
    })
})
router.post('/historyLogin', function (req, res, next) {
    let email = req.body.email;
    let password = req.body.password;

    dbConn.query(`SELECT * FROM login WHERE email = '${email}' AND password='${password}'`, function (err, rows, fields) {
        if (err) throw err
        if (rows.length <= 0) {
            req.flash('error', 'No history found')
            res.redirect('/books/historyLogin')
        }
        else {
            // router.use(function (req, res, next) {
            //     res.locals.currentUser = row[0].flag;////
            //     next()
            // })
            global.mail = email;
            req.session.flag = rows[0].flag;
            res.redirect('/books/history');
        }
    })
})
//-----------------------------------------------------------------------------
router.get('/contactdetail', function (req, res, next) {

    res.render('books/contactdetail')
})
router.get('/display', function (req, res, next) {

    res.render('books/display')
})
router.get('/ur', function (req, res, next) {

    res.render('books/ur')
})
router.get('/register', function (req, res, next) {

    res.render('books/register')
})
router.get('/about', function (req, res, next) {

    res.render('books/about')
})

// add-------------------------------------------------------------------------------
router.post('/add', function (req, res, next) {

    let name = req.body.myname1;
    let email = req.body.myemail;
    let phone_no = req.body.myphone;
    let address = req.body.myadd;
    let city = req.body.city;
    let category = req.body.myfood;
    let quanity = req.body.quantity;
    let preparation_date = req.body.fooddate1;
    let issue_date = req.body.fooddate2;
    let expiry_date = req.body.fooddate3;
    let details = req.body.note;
    let lat = req.body.lat;
    let log = req.body.log;
    let errors = false;
    console.log(name);
    // if (nanameme.length === 0) {
    //     errors = true;

    //     // set flash message
    //     req.flash('error', "Please enter all deatils");
    //     // render to add.ejs with flash message
    //     res.render('books/add', {
    //         name: name,
    //         author: email
    //     })
    // }

    // if no error
    if (!errors) {

        var form_data = {
            name: name,
            email: email,
            phone_no: phone_no,
            address: address,
            city: city,
            lat: lat,
            log: log,
            category: category,
            quanity: quanity,
            preparation_date: preparation_date,
            issue_date: issue_date,
            expiry_date: expiry_date,
            details: details
        }

        // insert query
        dbConn.query('INSERT INTO food SET ?', form_data, function (err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)

                // render to add.ejs
                res.render('books/add', {
                    name: form_data.name,
                    author: form_data.email
                })
            } else {
                req.flash('success', 'food successfully added');
                res.redirect('/books');

            }
        })
        dbConn.query(`SELECT * FROM login WHERE city = '${city}' `, function (err, rows, fields) {

            if (err) throw err
            if (rows.length > 0) {
                console.log("row exists");
                console.log(rows[0].email);
                console.log("done");
                const transporter = nodemailer.createTransport(
                    {
                        service: 'gmail',
                        auth: {
                            user: 'sanjumurugan2002@gmail.com',
                            pass: 'ddrqhtauyjdawuqy'
                        }

                    })

                const mailOptions = {
                    from: "admin",
                    to: rows[0].email,
                    subject: 'Food donation update',
                    text: `Hey there ! Hope you are doing good . There is someone willing to donate food
                    Address : ${address} 
                    Name : ${name}
                    Phone number : ${phone_no}
                    Issue Date : ${issue_date}
                    Expiry date : ${expiry_date}`
                }

                transporter.sendMail(mailOptions, (error, info) => {

                    if (error) {
                        console.log(error);
                        res.send('error');
                    } else {
                        console.log('Email sent: ' + info.response);
                        res.send('success')
                    }

                })
            }
        })
    }
})
//------------------------------------------------------------------------------------------
router.post('/userRegistration', function (req, res, next) {

    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let city = req.body.city;
    let lat = req.body.lat;
    let log = req.body.log;
    let errors = false;

    if (!errors) {

        var form_data = {
            name: name,
            email: email,
            password: password,
            city: city,
            lat: lat,
            log: log
        }

        // insert query
        dbConn.query('INSERT INTO login SET ?', form_data, function (err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)

                // render to add.ejs
                res.render('books/ur')
            } else {
                req.flash('success', 'food successfully added');
                res.redirect('/books/login');
            }
        })
    }
})
// router.post('/login', function (req, res, next) {
//     let email = req.params.email;
//     let password = req.params.password;
//     dbConn.query('SELECT * FROM login WHERE email = "' + email + '"', function (err, rows, fields) {
//         if (err) throw err
//         if (rows.length <= 0) {
//             req.flash('error', 'No user found')
//             res.redirect('/')
//         }
//         else {
//             if (password != row[0].password) {
//                 req.flash('error', 'wrong password')
//                 res.redirect('/')
//             }
//             res.render('/books/display');
//         }
//     })
// })
//-----------------------------------------------------------------------------------------------
// display edit book page
router.get('/edit/(:name)', function (req, res, next) {

    let name = req.params.name;

    dbConn.query('SELECT * FROM food WHERE name = "' + name + '"', function (err, rows, fields) {
        if (err) throw err

        // if user not found
        if (rows.length <= 0) {
            req.flash('error', 'Book not found with name = "' + name + '"')
            res.redirect('/books')
        }
        // if book found
        else {
            // render to edit.ejs
            res.render('books/edit', {
                title: 'Edit Book',
                name: rows[0].name,
                email: rows[0].email,
                phone_no: rows[0].phone_no,
                address: rows[0].address,
                category: rows[0].category,
                quanity: rows[0].quanity,
                preparation_date: rows[0].preparation_date,
                issue_date: rows[0].issue_date,
                expiry_date: rows[0].expiry_date,
                details: rows[0].details
                //

            })
        }
    })
})
//----------------------------------------------------------------------------------------------------------
router.get('/report', function (req, res, next) {

    res.render('books/report')
})
router.post('/report', function (req, res, next) {
    console.log(req.body);
    const transporter = nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                user: 'sanjumurugan2002@gmail.com',
                pass: 'ddrqhtauyjdawuqy'
            }

        })
    console.log('Email sent: ');
    const mailOptions = {
        from: req.body.email,
        to: 'harshavardangovindaraj@gmail.com',
        subject: `Message from ${req.body.email}: ${req.body.subject}`,
        text: req.body.message
    }

    transporter.sendMail(mailOptions, (error, info) => {

        if (error) {
            console.log(error);
            res.send('error');
        } else {
            console.log('Email sent: ' + info.response);
            res.send('success')
        }

    })

})
//----------------------------------------------------------------------------------------------------

// update book data-----------------------------------------------------------------------------------
router.post('/update/:name', function (req, res, next) {
    let name = req.params.name;
    let email = req.params.email;
    let phone_no = req.params.phone_no;
    let address = req.params.address;
    let category = req.params.category;
    let quanity = req.params.quanity;
    let preparation_date = req.params.preparation_date;
    let issue_date = req.params.issue_date;
    let expiry_date = req.params.expiry_date;
    let details = req.params.details;

    let errors = false;

    if (name.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter details");
        // render to add.ejs with flash message
        res.render('books/edit', {
            name: name,
            email: email,
            phone_no: phone_no,
            address: address,
            category: category,
            quanity: quanity,
            preparation_date: preparation_date,
            issue_date: issue_date,
            expiry_date: expiry_date,
            details: details
            // id: req.params.id,
            // name: name,
            // author: author
        })
    }

    // if no error
    if (!errors) {

        var form_data = {
            name: name,
            email: email,
            phone_no: phone_no,
            address: address,
            category: category,
            quanity: quanity,
            preparation_date: preparation_date,
            issue_date: issue_date,
            expiry_date: expiry_date,
            details: details
        }
        // update query
        dbConn.query('UPDATE food SET ? WHERE name = "' + name + '"', form_data, function (err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                // render to edit.ejs
                res.render('books/edit', {

                    name: form_data.name,
                    author: form_data.email
                })
            } else {
                req.flash('success', 'food successfully updated');
                res.redirect('/books');
            }
        })
    }
})

// delete book
router.get('/delete/(:name)/(:city)', function (req, res, next) {
    let name = req.params.name;
    let city = req.params.city;
    console.log(city);
    dbConn.query(`SELECT * FROM login WHERE city = '${city}' `, function (err, rows, fields) {
        if (err) throw err
        if (rows.length > 0) {
            console.log("row exists");
            console.log(rows[0].email);
            console.log("done");
            const transporter = nodemailer.createTransport(
                {
                    service: 'gmail',
                    auth: {
                        user: 'sanjumurugan2002@gmail.com',
                        pass: 'ddrqhtauyjdawuqy'
                    }

                })

            const mailOptions = {
                from: "admin",
                to: rows[0].email,
                subject: 'Food Deletion Notification',
                text: `Hey there ! Hope you are doing good . The food donation detail by ${name}  in your city is deleted`
            }

            transporter.sendMail(mailOptions, (error, info) => {

                if (error) {
                    console.log(error);
                    res.send('error');
                } else {
                    console.log('Email sent: ' + info.response);
                    res.send('success')
                }

            })
        }
    })

    dbConn.query('DELETE FROM food WHERE name = "' + name + '"', function (err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
            // redirect to books page
            res.redirect('/books')
        } else {
            // set flash message
            req.flash('success', 'Food successfully deleted!  ')
            // redirect to books page
            res.redirect('/books')
        }
    })
})

module.exports = router;