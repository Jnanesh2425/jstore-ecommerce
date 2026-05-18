const orderModel = require('../../models/orderModel');
const { sendOrderDeliveredEmail } = require('../../helpers/sendEmail');

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID and status are required' 
      });
    }

    // Update order status
    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('userId');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Send delivered email only if status changes to 'delivered'
    if (status === 'delivered' && order.userId?.email) {
      await sendOrderDeliveredEmail(
        order.userId.email,
        order.userId.name,
        order
      );
    }

    res.json({ 
      success: true, 
      message: `Order status updated to ${status}`,
      data: order 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = updateOrderStatus;