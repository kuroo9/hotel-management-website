const MenuItem = require('../models/MenuItem');
const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '..', 'data');
const dataPath = path.join(dataDir, 'menu.json');
const uploadsDir = path.join(__dirname, '..', 'uploads');

/**
 * Convert a locally-uploaded image filename to a base64 data URL.
 * This ensures images survive backend restarts (the data is embedded in the JSON,
 * not referenced by a filesystem path that could be wiped).
 */
function fileToBase64DataUrl(filename) {
  try {
    const filePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filePath)) return filename; // file missing, keep filename as-is
    const ext = path.extname(filename).toLowerCase().replace('.', '');
    const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
    const mime = mimeMap[ext] || 'image/jpeg';
    const data = fs.readFileSync(filePath);
    return `data:${mime};base64,${data.toString('base64')}`;
  } catch (e) {
    console.warn('Could not encode image to base64:', e.message);
    return filename;
  }
}

/**
 * Persist all menu items to disk as JSON backup.
 * Locally uploaded images (bare filenames) are converted to base64 data URLs
 * so the backup is fully self-contained and doesn't depend on the uploads/ folder.
 */
function persistMenuToFile() {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    MenuItem.find().lean().then(all => {
      const serialized = all.map(item => {
        let image = item.image;
        // If image is a plain filename (not a URL or base64), encode it
        if (image && !image.startsWith('http') && !image.startsWith('data:')) {
          image = fileToBase64DataUrl(image);
        }
        return { ...item, image };
      });
      fs.writeFileSync(dataPath, JSON.stringify(serialized, null, 2), 'utf8');
    }).catch(e => console.warn('Failed to persist menu:', e.message));
  } catch (e) {
    console.warn('Failed to persist menu to file:', e.message);
  }
}

exports.getMenu = async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;
    let image = null;
    if (req.file) {
      // Store as base64 data URL directly in DB so it's restart-proof
      image = fileToBase64DataUrl(req.file.filename);
    }
    const menuItem = await MenuItem.create({
      name, description, price, category, isAvailable, image
    });
    // persist to disk so uploads + menu survive restarts when using in-memory DB
    persistMenuToFile();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;
    const updateData = { name, description, price, category, isAvailable };
    if (req.file) {
      // Store as base64 data URL directly in DB so it's restart-proof
      updateData.image = fileToBase64DataUrl(req.file.filename);
    }
    
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' });
    persistMenuToFile();
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    persistMenuToFile();
    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPublicMenu = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ isAvailable: true });
    const menu = menuItems.map(item => {
      // For public menu: if image is base64 or URL, use directly; if filename, build URL
      let imageUrl = null;
      if (item.image) {
        if (item.image.startsWith('http') || item.image.startsWith('data:')) {
          imageUrl = item.image;
        } else {
          imageUrl = `/uploads/${item.image}`;
        }
      }
      return {
        id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: imageUrl,
        isAvailable: item.isAvailable
      };
    });
    res.status(200).json({ menu });
  } catch (error) {
    res.status(500).json({ message: 'Error getting public menu', error: error.message });
  }
};