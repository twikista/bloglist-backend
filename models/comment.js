const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
  text: { type: String, require: true, trim: true },
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
})

module.exports = mongoose.model('Comment', commentSchema)
