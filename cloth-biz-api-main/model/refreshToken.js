import mongoose from "mongoose";
const refreshTokenSchema = new 
mongoose.Schema({
  customer: 
  { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Customer", 
    required: true, 
    index: true 
  },

  tokenHash: 
  { 
    type: String, 
    required: true,
    unique: true 
  },

  expiresAt:
   { 
    type: Date, 
    required: true, 
    index: { expires: 0 } 
  },

  revokedAt: 
  { 
    type: Date,
     default: null 
  },

}, 

{ timestamps: true });

export default mongoose.model("RefreshToken", refreshTokenSchema);
