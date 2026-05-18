// Calculate delivery dates based on delivery type
const calculateDeliveryDates = (orderDate, deliveryType = 'standard') => {
  const date = new Date(orderDate);

  if (deliveryType === 'express') {
    // EXPRESS: 2 days total
    // Day 1: Order placed
    // Day 2: Shipped @ 10 AM
    // Day 3: Out for delivery @ 7 AM
    // Day 3: Delivered @ 10 AM
    
    const shippedDate = new Date(date);
    shippedDate.setDate(shippedDate.getDate() + 1); // +1 day
    shippedDate.setHours(10, 0, 0, 0); // 10 AM

    const outForDeliveryDate = new Date(date);
    outForDeliveryDate.setDate(outForDeliveryDate.getDate() + 2); // +2 days
    outForDeliveryDate.setHours(7, 0, 0, 0); // 7 AM

    const deliveredDate = new Date(date);
    deliveredDate.setDate(deliveredDate.getDate() + 2); // +2 days
    deliveredDate.setHours(10, 0, 0, 0); // 10 AM

    return {
      deliveryType: 'express',
      shippedDate,
      outForDeliveryDate,
      deliveredDate,
      handlingCharges: 60,
      totalDays: 2
    };
  } else {
    // STANDARD: 5 days total (default)
    // Day 1: Order placed
    // Day 4: Shipped @ 10 AM
    // Day 5: Out for delivery @ 7 AM
    // Day 5: Delivered @ 10 AM

    const shippedDate = new Date(date);
    shippedDate.setDate(shippedDate.getDate() + 3); // +3 days
    shippedDate.setHours(10, 0, 0, 0); // 10 AM

    const outForDeliveryDate = new Date(date);
    outForDeliveryDate.setDate(outForDeliveryDate.getDate() + 4); // +4 days
    outForDeliveryDate.setHours(7, 0, 0, 0); // 7 AM

    const deliveredDate = new Date(date);
    deliveredDate.setDate(deliveredDate.getDate() + 4); // +4 days
    deliveredDate.setHours(10, 0, 0, 0); // 10 AM

    return {
      deliveryType: 'standard',
      shippedDate,
      outForDeliveryDate,
      deliveredDate,
      handlingCharges: 10,
      totalDays: 5
    };
  }
};

module.exports = calculateDeliveryDates;