const cron = require('node-cron');
const orderModel = require('../models/orderModel');
const { sendOrderDeliveredEmail } = require('./sendEmail');

// Helper function to get date range (start and end of day)
const getDateRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

// Helper function to process order status updates
const processOrderStatusUpdates = async () => {
  try {
    const { start, end } = getDateRange();
    let updateCount = 0;

    // CHECK 1: Update "confirmed" to "shipped" if shippedDate matches
    const confirmedOrders = await orderModel.find({
      status: 'confirmed',
      shippedDate: {
        $gte: start,
        $lt: end
      }
    }).populate('userId');

    for (const order of confirmedOrders) {
      order.status = 'shipped';
      await order.save();
      console.log(`✅ Order ${order._id} updated to: SHIPPED`);
      updateCount++;
    }

    // CHECK 2: Update "shipped" to "out for delivery" if outForDeliveryDate matches
    const shippedOrders = await orderModel.find({
      status: 'shipped',
      outForDeliveryDate: {
        $gte: start,
        $lt: end
      }
    }).populate('userId');

    for (const order of shippedOrders) {
      order.status = 'out for delivery';
      await order.save();
      console.log(`✅ Order ${order._id} updated to: OUT FOR DELIVERY`);
      updateCount++;
    }

    // CHECK 3: Update "out for delivery" to "delivered" if deliveredDate matches
    const outForDeliveryOrders = await orderModel.find({
      status: 'out for delivery',
      deliveredDate: {
        $gte: start,
        $lt: end
      }
    }).populate('userId');

    for (const order of outForDeliveryOrders) {
      order.status = 'delivered';
      await order.save();
      console.log(`✅ Order ${order._id} updated to: DELIVERED`);
      updateCount++;

      // Send delivery email
      if (order.userId?.email) {
        await sendOrderDeliveredEmail(
          order.userId.email,
          order.userId.name,
          order
        );
        console.log(`📧 Delivery email sent to ${order.userId.email}`);
      }
    }

    if (updateCount > 0) {
      console.log(`✅ Cron job completed - ${updateCount} order(s) updated`);
    }
  } catch (error) {
    console.error('❌ Error processing order status updates:', error);
  }
};

// CRON JOB: Run every minute (for testing) - Change to '0 * * * *' for hourly or '0 10 * * *' for 10 AM
// For production, use: '0 7 * * *' (7 AM) and '0 10 * * *' (10 AM) in separate cron jobs
const orderStatusCronJob = cron.schedule('* * * * *', processOrderStatusUpdates, {
  scheduled: true,
  timezone: process.env.TZ || 'Asia/Kolkata' // India timezone
});

const startCronJobs = () => {
  console.log('═══════════════════════════════════════════');
  console.log('[STARTUP] Initializing cron jobs...');
  console.log('[JOB] Running every minute (testing mode)');
  console.log('[TIMEZONE] ' + (process.env.TZ || 'Asia/Kolkata'));
  console.log('[TASK] Auto-update order statuses based on dates');
  console.log('═══════════════════════════════════════════');
  console.log('💡 For production, change cron expression to:');
  console.log('   - "0 7 * * *" for 7:00 AM');
  console.log('   - "0 10 * * *" for 10:00 AM');
  console.log('═══════════════════════════════════════════');
};

module.exports = { startCronJobs, orderStatusCronJob };