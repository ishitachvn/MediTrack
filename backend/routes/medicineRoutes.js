// routes/medicineRoutes.js
const express = require('express');
const {
  addMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  markMedicineTaken,
} = require('../controllers/medicineController');
const { protect } = require('../utils/jwt');

const router = express.Router();

// All routes are protected – user must be authenticated
router.use(protect);

router.post('/', addMedicine);
router.get('/', getMedicines);
router.get('/:id', getMedicineById);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);
router.put('/:id/taken', markMedicineTaken);

module.exports = router;
