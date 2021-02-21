const express = require('express');
const Favorite = require('../models/favorites');
const Campsite = require('../models/campsite');
const favoriteRouter = express.Router();
const authenticate = require('../authenticate');
const cors = require('./cors');

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('user')
            .populate('campsites')
            .then(favs => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'applications/json');
                res.json(favs);
            })
            .catch(err => next(err));
    })
    .post(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(userFavs => {
                if (userFavs) {
                    let newFavs = req.body.forEach ? req.body : [];
                    newFavs.forEach(fav => { if (!userFavs.campsites.includes(fav)) { userFavs.campsites.push(fav) } });
                    userFavs.save()
                        .then(favs => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'applications/json');
                            res.json(favs);
                        });
                }
                else {
                    Favorite.create({ user: req.user._id, campsites: [] })
                        .then(userFavs => {
                            let newFavs = req.body.forEach ? req.body : [];
                            newFavs.forEach(fav => { if (!userFavs.campsites.includes(fav)) { userFavs.campsites.push(fav) } });
                            userFavs.save()
                                .then(favs => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'applications/json');
                                    res.json(favs);
                                })
                                .catch(err => next(err));
                        })
                }
            })
            .catch(err => next(err));
    })
    .delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then(userFavs => {
                if (userFavs) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'applications/json');
                    res.json(userFavs);
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('You do not have any favorites to delete.');
                }
            })
            .catch(err => next(err));
    })
    .all(cors.cors, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`${req.method} operation not supported on /favorites.`);
    })



favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        //bonus task, verifying campsite existence
        Campsite.findOne({ _id: req.params.campsiteId })
            .then(theCampsite => {
                if (theCampsite) {
                    //bonus task, verifying campsite existence
                    Favorite.findOne({ user: req.user._id })
                        .then(userFavs => {
                            if (userFavs) {
                                if (userFavs.campsites.indexOf(req.params.campsiteId) < 0) {
                                    userFavs.campsites.push(req.params.campsiteId);
                                    userFavs.save()
                                        .then(userFavs => {
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'applications/json');
                                            res.json(userFavs);
                                        })
                                        .catch(err => next(err));
                                } else {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'text/plain');
                                    res.end("That campsite is already in the list of favorites!")
                                }
                            } else {
                                Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
                                    .then(userFavs => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'applications/json');
                                        res.json(userFavs);
                                    })
                                    .catch(err => next(err));
                            }
                        })
                        .catch(err => next(err));
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end(`Could not add the campsite with ID:${req.params.campsiteId} because does not exist`);
                }
            })
            .catch(() => {
                //bonus
                // so it turns out mongo/mongoose throws an err , instead of returning null
                // if the _id provided is not correctly formed,  I chose to custom handle
                // that error  to return a user message, rather than the system error message
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end(`Could not add the campsite with   because the ID providided is not valid or an error occured`);
            });
    })
    .delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(userFavs => {
                let delIndex = userFavs.campsites.indexOf(req.params.campsiteId);
                if (delIndex > -1) {
                    userFavs.campsites.splice(delIndex, 1);
                    userFavs.save()
                        .then(userFavs => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'applications/json');
                            res.json(userFavs);
                        });
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('That campsite is not a favorites to delete.');
                }
            })
            .catch(err => next(err));
    })
    .all(cors.cors, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`${req.method} operation not supported on /favorites/${req.params.campsiteId}.`);
    })

module.exports = favoriteRouter;