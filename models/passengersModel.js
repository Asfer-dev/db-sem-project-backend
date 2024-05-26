import mongoose from "mongoose";

const passengersSchema = mongoose.Schema(
    {
        CNIC: {
            type: String,
            required: [true, "Please enter your CNIC"]
        },
        name: {
            type: String,
            required: [true]
        },
        contact_no: {
            type: String,
            required: [true]
        }
    },
    {
        timestamps: true
    }
)

export const passengers = mongoose.model('passengers', passengersSchema);

// module.exports = passengers