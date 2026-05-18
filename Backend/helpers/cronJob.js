const cron = require('node-cron');
const orderModel = require('../models/orderModel');
const { sendOrderDeliveredEmail } = require('./sendEmail');
// import { FiClock } from "react-icons/fi";

// CRON JOB 1: Run @ 10:00 AM - Check for shipped & delivered orders
const cronJob10AM = cron.schedule('0 10 * * *', async () => {
  try {
    console.log('[10:00 AM] Cron job running - Checking shipped & delivered orders...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day
    const tomorrowStart = new Date(today);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1); // End of day

    // ─────────────────────────────────────
    // CHECK 1: Update "confirmed" to "shipped" if shippedDate matches
    // ─────────────────────────────────────
    const confirmedOrders = await orderModel.find({
      status: 'confirmed',
      shippedDate: {
        $gte: today,
        $lt: tomorrowStart
      }
    }).populate('userId');

    for (const order of confirmedOrders) {
      order.status = 'shipped';
      await order.save();
      console.log(`✅ Order ${order._id} updated to: SHIPPED`);
    }

    // ─────────────────────────────────────
    // CHECK 2: Update "out for delivery" to "delivered" if deliveredDate matches
    // ─────────────────────────────────────
    const outForDeliveryOrders = await orderModel.find({
      status: 'out for delivery',
      deliveredDate: {
        $gte: today,
        $lt: tomorrowStart
      }
    }).populate('userId');

    for (const order of outForDeliveryOrders) {
      order.status = 'delivered';
      await order.save();
      console.log(`✅ Order ${order._id} updated to: DELIVERED`);

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

    console.log('✅ Cron job @ 10:00 AM completed!');
  } catch (error) {
    console.error('❌ Error in cron job @ 10 AM:', error);
  }
});

// ─────────────────────────────────────────────────────
// CRON JOB 2: Run @ 7:00 AM - Check for "out for delivery" orders
// ─────────────────────────────────────────────────────
const cronJob7AM = cron.schedule('0 7 * * *', async () => {
  try {
    console.log('[07:00 AM] Cron job running - Checking out for delivery orders...');

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day
    const tomorrowStart = new Date(today);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1); // End of day

    // Check if outForDeliveryDate matches today
    const shippedOrders = await orderModel.find({
      status: 'shipped',
      outForDeliveryDate: {
        $gte: today,
        $lt: tomorrowStart
      }
    }).populate('userId');

    for (const order of shippedOrders) {
      order.status = 'out for delivery';
      await order.save();
      console.log(`✅ Order ${order._id} updated to: OUT FOR DELIVERY (7 AM)`);
    }

    console.log('[COMPLETE] Cron job @ 07:00 AM completed successfully!');
  } catch (error) {
    console.error('❌ Error in cron job @ 7 AM:', error);
  }
});

// Start both cron jobs
const startCronJobs = () => {
  console.log('═══════════════════════════════════════════');
  console.log('[STARTUP] Initializing cron jobs...');
  console.log('[JOB-1] 10:00 AM - Update shipped & delivered orders');
  console.log('[JOB-2] 07:00 AM - Update out for delivery orders');
  console.log('═══════════════════════════════════════════');
  // Jobs start automatically on schedule
};

module.exports = { startCronJobs, cronJob10AM, cronJob7AM };