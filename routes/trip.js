const router = require("express").Router();
const auth = require("../middleware/auth");
const Trip = require("../models/trip");

// Add trip
router.post("/addTrip", auth, async (req, res) => {
    const { name, location, noOfDays, noOfPersons, season, accommodation, transport, foodPackage, totalCost, totalCostPerPerson, loguser } = req.body;
console.log(req.body);
    try {
        const newTrip = new Trip({
            name,
            location,
            noOfDays,
            noOfPersons,
            season,
            accommodation,
            transport,
            foodPackage,
            totalCost,
            totalCostPerPerson,
            loguser
        });

        await newTrip.save();

        res.json({ message: "Trip added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/trips", auth, async (req, res) => {
    try {
        const trips = await Trip.find({});
        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/trips/:id", auth, async (req, res) => {
    const tripId = req.params.id;

    try {
        const deletedTrip = await Trip.findByIdAndDelete(tripId);
        
        if (!deletedTrip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        res.json({ message: "Trip deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
