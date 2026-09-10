import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sold: { type: Number, default: 0, min: 0 },
    icon: { type: String, default: '📦' },
  },
  { timestamps: true }
)

productSchema.virtual('profit').get(function profit() {
  return (this.price - this.costPrice) * this.sold
})

productSchema.set('toJSON', { virtuals: true })

export default mongoose.model('Product', productSchema)
