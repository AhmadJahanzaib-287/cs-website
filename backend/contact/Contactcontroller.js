import ContactMessage from './ContactMessage.js';

/**
 * @desc    Submit a new contact message from the public website
 * @route   POST /api/v1/contact
 * @access  Public
 */
export const createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required',
      });
    }

    const newMessage = await ContactMessage.create({ name, email, subject, message });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error(`[Create Contact Message Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while sending message',
    });
  }
};

/**
 * @desc    Get all contact messages (admin inbox)
 * @route   GET /api/v1/contact
 * @access  Private (Admin)
 */
export const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error(`[Get Contact Messages Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching messages',
    });
  }
};

/**
 * @desc    Mark a contact message as read/unread
 * @route   PATCH /api/v1/contact/:id/read
 * @access  Private (Admin)
 */
export const toggleMessageReadStatus = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    message.isRead = !message.isRead;
    await message.save();

    res.status(200).json({
      success: true,
      message: `Message marked as ${message.isRead ? 'read' : 'unread'}`,
      data: message,
    });
  } catch (error) {
    console.error(`[Toggle Message Read Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while updating message',
    });
  }
};

/**
 * @desc    Delete a contact message
 * @route   DELETE /api/v1/contact/:id
 * @access  Private (Admin)
 */
export const deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error(`[Delete Contact Message Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while deleting message',
    });
  }
};