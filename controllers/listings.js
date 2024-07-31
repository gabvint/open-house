const express = require('express');
const router = express.Router();

const Listing = require('../models/listing');


router.get('/', async (req, res) => {
    try {
        const populatedListings = await Listing.find({}).populate('owner');
        console.log('Populated Listings: ', populatedListings);
        res.render('listings/index.ejs', {
            listings: populatedListings,
        })
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})

router.get('/new', async (req, res) => {
    res.render('listings/new.ejs')
})

router.post('/', async (req, res) => {
    req.body.owner = req.session.user._id
    await Listing.create(req.body)

    res.redirect('/listings')
})

router.get('/:listingId', async (req, res) => {
    try {
        const populatedListings = await Listing.findById(req.params.listingId).populate('owner');

        // this determines if the user has already favorited/clicked the favorite button
        // it finds if the user's name is one the list of the favorites
        // true or false
        const userHasFavorited = populatedListings.favoritedByUsers.some((user) =>
            user.equals(req.session.user._id)
          );
      
          res.render('listings/show.ejs', {
            listing: populatedListings,
            userHasFavorited: userHasFavorited,
          });
    } catch (error) {
        console.log(error)
        res.redirect('/') 
    }
})

router.delete('/:listingId', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.listingId);

        // if the current user is equal to the owner of the listing
        if(listing.owner.equals(req.session.user._id)){ 
            await listing.deleteOne()
            console.log('Permission granted')
            res.redirect('/listings')
        } else{
            console.log('Permission denied')
        }

    
    } catch (error) {
        console.log(error)
        res.redirect('/') 
    }
})

router.get('/:listingId/edit', async (req, res) => {
    try {
        const currentLising = await Listing.findById(req.params.listingId);
        
        res.render('listings/edit.ejs', {
            listing: currentLising,
        })
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})

router.put('/:listingId', async (req, res) => {
    try {
        const currentListing = await Listing.findById(req.params.listingId);

        if (currentListing.owner.equals(req.session.user._id)){
            await currentListing.updateOne(req.body)
            res.redirect(`/listings/${req.params.listingId}`)
        } else{
            res.send('You dont have permission to update this listing')
        }
    
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})

router.post('/:listingId/favorited-by/:userId', async (req, res) => {
    try {
        // finds the listing and then pushed the current user's id to the listing's
        // favorited object
        await Listing.findByIdAndUpdate(req.params.listingId, {
            $push: { favoritedByUsers: req.params.userId },
        });

        res.redirect(`/listings/${req.params.listingId}`)
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})

router.delete('/:listingId/favorited-by/:userId', async (req, res) => {
    try {
        await Listing.findByIdAndUpdate(req.params.listingId, {
            $pull: { favoritedByUsers: req.params.userId },
        });

        res.redirect(`/listings/${req.params.listingId}`)
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})




module.exports = router;