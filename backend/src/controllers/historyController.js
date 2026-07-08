const Generation = require("../models/Generation");

/* Historial compartido: todo el equipo ve y puede editar las creaciones de todos,
   no solo las propias. Se muestra quién creó cada una uniendo el nombre del usuario. */
const getHistory = async (req, res) => {
  try {
    const generations = await Generation.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("userId", "name");

    const history = generations.map((g) => {
      const obj = g.toObject();
      obj.creatorName = obj.userId?.name || "Alguien del equipo";
      obj.userId = obj.userId?._id || obj.userId;
      return obj;
    });

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteHistoryItem = async (req, res) => {
  try {
    const generation = await Generation.findById(req.params.id);

    if (!generation) {
      return res.status(404).json({ success: false, message: "No encontrado" });
    }

    await generation.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* "Vaciar historial" solo borra lo propio, para que nadie borre por accidente
   el trabajo del resto del equipo con un solo clic */
const clearHistory = async (req, res) => {
  try {
    await Generation.deleteMany({ userId: req.user._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const generation = await Generation.findById(req.params.id);

    if (!generation) {
      return res.status(404).json({ success: false, message: "No encontrado" });
    }

    generation.isFavorite = !generation.isFavorite;
    await generation.save();

    res.json({ success: true, isFavorite: generation.isFavorite });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateImageUrl = async (req, res) => {
  try {
    const generation = await Generation.findById(req.params.id);

    if (!generation) {
      return res.status(404).json({ success: false, message: "No encontrado" });
    }

    generation.imageUrl = req.body.imageUrl || null;
    await generation.save();

    res.json({ success: true, imageUrl: generation.imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateVideoUrl = async (req, res) => {
  try {
    const generation = await Generation.findById(req.params.id);
    if (!generation) return res.status(404).json({ success: false, message: "No encontrado" });
    generation.videoUrl = req.body.videoUrl || null;
    await generation.save();
    res.json({ success: true, videoUrl: generation.videoUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOutput = async (req, res) => {
  try {
    const generation = await Generation.findById(req.params.id);
    if (!generation) return res.status(404).json({ success: false, message: "No encontrado" });
    generation.output = req.body.output;
    await generation.save();
    res.json({ success: true, output: generation.output });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const saveGeneration = async (req, res) => {
  try {
    const { type, input, output } = req.body;
    const saved = await Generation.create({ userId: req.user._id, type, input: input || {}, output });
    res.json({ success: true, generation: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getHistory, deleteHistoryItem, clearHistory, toggleFavorite, updateImageUrl, updateVideoUrl, updateOutput, saveGeneration };
