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
      enum: ["campaign", "copy", "hashtag", "calendar", "video"],
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
    imageUrl: {
      type: String,
      default: null,
    },
    videoUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "approved", "published"],
      default: "draft",
    },
    /* Agendar publicación de un item del historial: se elige fecha/hora y una o varias
       redes, y el cron de historyPublishScheduler.js publica solo cuando llega la hora,
       usando la cuenta social que el usuario ya tenga conectada. */
    scheduledPublish: {
      type: new mongoose.Schema(
        {
          date: { type: Date, required: true },
          platforms: [{ type: String }],
          status: { type: String, enum: ["pending", "done"], default: "pending" },
          results: [
            {
              platform: String,
              status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
              error: String,
              publishedAt: Date,
              notifiedFailure: { type: Boolean, default: false },
            },
          ],
        },
        { _id: false }
      ),
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Generation", GenerationSchema);
