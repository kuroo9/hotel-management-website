const Bill = require('../models/Bill');
const Order = require('../models/Order');
const Table = require('../models/Table');

exports.generateBill = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { discount, taxRate } = req.body; // taxRate e.g. 5 or 18

    const order = await Order.findById(orderId).populate('items.menuItem');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const subtotal = order.totalAmount;
    const taxAmount = (subtotal * (taxRate || 5)) / 100;
    const total = subtotal + taxAmount - (discount || 0);

    const bill = await Bill.create({
      orderId,
      tableId: order.tableId,
      items: order.items,
      subtotal,
      tax: taxAmount,
      discount: discount || 0,
      total,
      paymentStatus: 'Unpaid'
    });

    // Update order status to Completed
    await Order.findByIdAndUpdate(orderId, { status: 'Completed' });

    // Update table status to Available
    await Table.findByIdAndUpdate(order.tableId, { status: 'Available', currentOrder: null });

    const io = req.app.get('io');
    io.emit('bill_generated', bill);
    io.emit('table_status_change', await Table.findById(order.tableId));

    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('tableId').populate('orderId');
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find().populate('tableId').sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(req.params.id, { paymentStatus: req.body.paymentStatus }, { returnDocument: 'after' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
