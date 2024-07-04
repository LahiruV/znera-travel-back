const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TripSchema = new Schema({

    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    noOfDays: {
        type: String,
        required: true,
    },
    noOfPersons: {
        type: String,
        required: true,
    },
    season: {
        type: String,
        default: "",
    },
    accommodation: {
        type: String,
        default: "",
    },
    transport: {
        type: String,
        default: "",
    },
    foodPackage: {
        type: String,
        default: "",
    },
    totalCost: {
        type: Number,
        required: true,
    },
    totalCostPerPerson: {
        type: Number,
        required: true,
    },
    loguser: {
        type: String,
        required: true,
      },

});

module.exports = mongoose.model('Trip', TripSchema);
