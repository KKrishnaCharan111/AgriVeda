import React, { useState } from 'react';
import { X, CheckCircle, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface SellCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SellCropModal: React.FC<SellCropModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [cropName, setCropName] = useState('');
  const [cropNameTe, setCropNameTe] = useState('');
  const [variety, setVariety] = useState('');
  const [category, setCategory] = useState('Cereals');
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState('Quintal');
  const [expectedPrice, setExpectedPrice] = useState<number>(2400);
  const [qualityGrade, setQualityGrade] = useState('Grade A');
  const [organic, setOrganic] = useState(false);
  const [description, setDescription] = useState('');
  const [harvestDate, setHarvestDate] = useState('2026-11');
  const [village, setVillage] = useState(user?.village || '');
  const [district, setDistrict] = useState(user?.district || 'Guntur');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createCrop({
        crop_name: cropName,
        crop_name_te: cropNameTe || undefined,
        variety: variety || 'Standard Hybrid',
        category,
        quantity: Number(quantity),
        unit,
        expected_price_per_unit: Number(expectedPrice),
        quality_grade: qualityGrade,
        organic_certified: organic,
        description,
        harvest_date: harvestDate,
        village: village || user?.village || '',
        district: district || user?.district || 'Guntur',
        state: user?.state || 'Andhra Pradesh'
      });
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to list crop');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
        >
          <X size={20} />
        </button>

        <div className="mb-4">
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            {language === 'te' ? 'మీ పంట అమ్మకపు ప్రకటన' : 'List Crop for Sale'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {language === 'te' ? 'సరైన వివరాలు నమోదు చేస్తే కొనుగోలుదారులు వేగంగా సంప్రదిస్తారు.' : 'Enter accurate details so registered crop buyers can make purchase offers.'}
          </p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="form-group">
              <label className="form-label">Crop Name (English)</label>
              <input
                type="text"
                required
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Paddy / Red Chilli"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">పంట పేరు (తెలుగు)</label>
              <input
                type="text"
                value={cropNameTe}
                onChange={(e) => setCropNameTe(e.target.value)}
                placeholder="ఉదా: వరి ధాన్యం / ఎర్ర మిరప"
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                <option value="Cereals">Cereals (ధాన్యాలు)</option>
                <option value="Pulses">Pulses (పప్పుదినుసులు)</option>
                <option value="Vegetables">Vegetables (కూరగాయలు)</option>
                <option value="Fruits">Fruits (పండ్లు)</option>
                <option value="Spices">Spices (మసాలా దినుసులు)</option>
                <option value="Commercial">Commercial (వాణిజ్య పంటలు)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Variety / రకం</label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g. BPT 5204 / Teja S17"
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-2">
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="form-select">
                <option value="Quintal">Quintal</option>
                <option value="Kg">Kg</option>
                <option value="Ton">Ton</option>
                <option value="Bag">Bag</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Expected Price (₹)</label>
              <input
                type="number"
                required
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(Number(e.target.value))}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="form-group">
              <label className="form-label">Quality Grade</label>
              <select value={qualityGrade} onChange={(e) => setQualityGrade(e.target.value)} className="form-select">
                <option value="Premium Grade A">Premium Grade A</option>
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
                <option value="Standard">Standard</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">District</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="organicCheck"
              checked={organic}
              onChange={(e) => setOrganic(e.target.checked)}
            />
            <label htmlFor="organicCheck" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {language === 'te' ? 'సేంద్రీయ ధ్రువీకరణ ఉంది (Organic Certified)' : 'This crop is organically grown / certified'}
            </label>
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Description & Storage Details</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Stored in dry conditions, moisture below 10%, ready for immediate dispatch."
              className="form-textarea"
            />
          </div>

          <div className="flex justify-between items-center">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Publishing...' : 'Publish Crop Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
