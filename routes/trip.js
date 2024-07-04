const router = require("express").Router();
const auth = require("../middleware/auth");
const Trip = require("../models/trip");

// Add trip
router.post("/addTrip", auth, async (req, res) => {
    const { name, location, noOfDays, noOfPersons, season, accommodation, transport, foodPackage, totalCost, totalCostPerPerson } = req.body;

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
        });

        await newTrip.save();

        res.json({ message: "Trip added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
