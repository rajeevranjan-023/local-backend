import mongoose from 'mongoose'

const shopSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    username: { type: String, required: true, unique: true, trim: true },

    // ---------- Basic ----------
    shopName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },

    // ---------- Media ----------
    logoUrl: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },

    description: { type: String, default: '' },

    category: {
      type: String,
      enum: ['Grocery', 'Electronics', 'Medical', 'Hardware', 'Fashion', 'Furniture', 'Mobile Store', 'Bakery', 'Paint', 'Other'],
      default: 'Other',
    },

    // ---------- Location ----------
    location: {
      address: { type: String, default: '' }, // full manual address line
      state: { type: String, default: '' },
      district: { type: String, default: '' },
      area: { type: String, default: '' }, // local locality
      lat: { type: Number, default: null }, // auto (GPS), when granted
      lng: { type: Number, default: null },
    },

    // ---------- Business type ----------
    businessType: { type: String, enum: ['Retail', 'Wholesale', 'Both'], default: 'Retail' },
    homeDelivery: { type: Boolean, default: false },

    // ---------- Timing ----------
    timing: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '21:00' },
      openDays: { type: String, enum: ['Mon-Sat', 'All Week'], default: 'Mon-Sat' },
    },

    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

shopSchema.methods.toPublicProfile = function toPublicProfile() {
  return {
    type: 'shop',
    id: this._id,
    username: this.username,
    name: this.shopName,
    ownerName: this.ownerName,
    phone: this.phone,
    email: this.email,
    logoUrl: this.logoUrl,
    bannerUrl: this.bannerUrl,
    category: this.category,
    description: this.description,
    location: this.location,
    businessType: this.businessType,
    homeDelivery: this.homeDelivery,
    timing: this.timing,
    rating: this.rating,
    reviewCount: this.reviewCount,
    createdAt: this.createdAt,
  }
}

export default mongoose.model('Shop', shopSchema)
