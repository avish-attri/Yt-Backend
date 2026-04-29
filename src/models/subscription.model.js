import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber: {  // user who subscribes to a channel
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        channel: {     // channel that user has subscribed 
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {timestamps: true}
);

export const Subscription = mongoose.model("Subscription",subscriberSchema);