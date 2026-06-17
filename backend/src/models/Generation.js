const mongoose = require("mongoose");

const GenerationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["campaign", "copy", "hashtag", "calendar"],
      required: true,
    },
    input: {
      type: mongoose.Schema.Types.Mixed, // Objeto con los campos del formulario
      required: true,
    },
    output: {
      type: mongoose.Schema.Types.Mixed, // String o Array (para hashtags/calendario)
      required: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Generation", GenerationSchema);
