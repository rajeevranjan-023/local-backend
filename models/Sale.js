import mongoose from 'mongoose'

const saleSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtSale: { type: Number, required: true }, // snapshot, in case price changes later
    costAtSale: { type: Number, required: true },
    channel: { type: String, enum: ['online', 'offline'], default: 'offline' },
    customerName: { type: String, default: '' },
  },
  { timestamps: true }
)

saleSchema.virtual('revenue').get(function revenue() {
  return this.priceAtSale * this.quantity
})

saleSchema.virtual('profit').get(function profit() {
  return (this.priceAtSale - this.costAtSale) * this.quantity
})

saleSchema.set('toJSON', { virtuals: true })

export default mongoose.model('Sale', saleSchema)
