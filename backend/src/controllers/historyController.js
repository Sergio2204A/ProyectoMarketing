const Generation = require("../models/Generation");

const getHistory = async (req, res) => {
  try {
    const generations = await Generation.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, history: generations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteHistoryItem = async (req, res) => {
  try {
    const generation = await Generation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!generation) {
      return res.status(404).json({ success: false, message: "No encontrado" });
    }

    await generation.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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
    const generation = await Generation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

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
    const generation = await Generation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

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

module.exports = { getHistory, deleteHistoryItem, clearHistory, toggleFavorite, updateImageUrl };
