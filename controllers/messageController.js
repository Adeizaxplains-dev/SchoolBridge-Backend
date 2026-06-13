import Message from "../models/Message.js";

export const createMessage = async (req, res) => {
  try {
    const message = await Message.create({
      ...req.body,
      school: req.school._id,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  const messages = await Message.find({
    school: req.school._id,
  });

  res.json(messages);
};

export const getMessage = async (req, res) => {
  const message = await Message.findById(req.params.id);

  res.json(message);
};

export const sendMessage = async (req, res) => {
  res.json({
    success: true,
    message: "Message sent successfully",
  });
};

export const scheduleMessage = async (req, res) => {
  res.json({
    success: true,
    message: "Message scheduled",
  });
};

export const getMessageStats = async (req, res) => {
  const total = await Message.countDocuments({
    school: req.school._id,
  });

  res.json({
    totalMessages: total,
  });
};