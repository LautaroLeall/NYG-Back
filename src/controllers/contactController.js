const ContactRequest = require('../models/ContactRequest');

exports.createRequest = async (req, res, next) => {
  try {
    const { name, email, phone, type, message } = req.body;
    const newRequest = await ContactRequest.create({ name, email, phone, type, message });
    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    next(error);
  }
};

exports.getRequests = async (req, res, next) => {
  try {
    const requests = await ContactRequest.find().sort('-createdAt');
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const reqItem = await ContactRequest.findByIdAndUpdate(req.params.id, { status: 'Leído' }, { new: true });
    res.status(200).json({ success: true, data: reqItem });
  } catch (error) {
    next(error);
  }
};
