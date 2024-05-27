import mongoose from "mongoose";

const terminalsSchema = mongoose.Schema(
    {
        terminal_city: {
            type: String,
            required: [true]
        }
    },
    {
        timestamps: true
    }
)

export const terminals = mongoose.model('terminals', terminalsSchema)