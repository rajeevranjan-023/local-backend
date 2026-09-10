import mongoose from 'mongoose'

const serviceAreaSchema = new mongoose.Schema(
  {
    state: { type: String, default: '' },
    district: { type: String, default: '' },
    area: { type: String, default: '' },
  },
  { _id: false }
)

const serviceProviderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // Mirrors User.username — see Shop.js for why this is duplicated here.
    username: { type: String, required: true, unique: true, trim: true },

    // ---------- Basic ----------
    name: { type: String, required: true, trim: true }, // the person's own name
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },

    // ---------- Media ----------
    bannerUrl: { type: String, default: '' },

    description: { type: String, default: '' }, // work description

    workType: { type: String, required: true, trim: true }, // e.g. "Electrician"

    // ---------- Area of service (multiple allowed) ----------
    areas: { type: [serviceAreaSchema], default: [] },
    // Kept for quick display / search matching alongside the structured list above.
    serviceArea: { type: String, default: '' },

    // ---------- Pricing ----------
    price: {
      amount: { type: Number, required: true },
      unit: { type: String, enum: ['hour', 'day', 'fixed'], default: 'hour' },
    },

    // ---------- Availability ----------
    workingDays: { type: String, enum: ['Mon-Sat', 'All Week'], default: 'Mon-Sat' },
    timeSlots: { type: String, default: '' }, // e.g. "9 AM - 6 PM"
    availability: { type: String, default: 'Available Today' }, // quick status badge

    // Coordinates for the "nearby services" distance sort/filter.
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

serviceProviderSchema.methods.toPublicProfile = function toPublicProfile() {
  return {
    type: 'service',
    id: this._id,
    username: this.username,
    name: this.name,
    workType: this.workType,
    phone: this.phone,
    email: this.email,
    bannerUrl: this.bannerUrl,
    description: this.description,
    areas: this.areas,
    serviceArea: this.serviceArea,
    price: this.price,
    workingDays: this.workingDays,
    timeSlots: this.timeSlots,
    availability: this.availability,
    location: this.location,
    rating: this.rating,
    reviewCount: this.reviewCount,
    createdAt: this.createdAt,
  }
}

export default mongoose.model('ServiceProvider', serviceProviderSchema)
