const Table = require('../models/Table');

exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find().populate('currentOrder');
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    // Emit socket event for table update
    const io = req.app.get('io');
    io.emit('table_status_change', table);
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: 'Table deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
