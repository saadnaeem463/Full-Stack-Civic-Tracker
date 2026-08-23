import { Schema, model, models } from 'mongoose'

const CategoryBudgetSchema = new Schema({
  category: {
    type: String,
    enum: ["Roads", "Lightning", "Cleanliness", "Parks"],
    required: true,
  },
  allocated: { type: Number, required: true ,default : 0 },
  spend: {type : Number,required : true ,default : 0} // e.g. 50000
}, { timestamps: true })

CategoryBudgetSchema.index({ category: 1, period: 1 }, { unique: true })

export const CategoryBudget = models.CategoryBudget || model("CategoryBudget", CategoryBudgetSchema)