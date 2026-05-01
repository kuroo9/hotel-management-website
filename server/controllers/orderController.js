const Order = require('../models/Order');
const Table = require('../models/Table');

exports.createOrder = async (req, res) => {
  try {
    const { tableId, items, totalAmount } = req.body;
    const order = await Order.create({
      tableId,
      items,
      totalAmount,
      waiterId: req.user._id,
      status: 'Pending'
    });

    // Update table status to Occupied
    await Table.findByIdAndUpdate(tableId, { status: 'Occupied', currentOrder: order._id });

    const populatedOrder = await Order.findById(order._id).populate('items.menuItem').populate('tableId');

    // Emit socket event for new order (Kitchen receives this)
    const io = req.app.get('io');
    io.emit('new_order', populatedOrder);
    io.emit('table_status_change', await Table.findById(tableId));

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query)
      .populate('items.menuItem')
      .populate('tableId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem').populate('tableId');
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' })
      .populate('items.menuItem')
      .populate('tableId');

    // Emit socket event for status update (Waiter/Admin receives this)
    const io = req.app.get('io');
    io.emit('order_status_update', order);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
