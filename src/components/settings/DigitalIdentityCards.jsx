import React from 'react';
import { QrCode, CreditCard, Upload, Eye, Trash2 } from 'lucide-react';

const DigitalIdentityCards = ({
  form,
  update,
  handleQrUpload,
  handleIdCardUpload,
  setLightboxImage
}) => {
  return (
    <div className="settings-accordion-body">
      <div className="cards-layout-grid">
        {/* Mess QR Code Card */}
        <div className="digital-card-container">
          <h4 className="digital-card-title">
            <QrCode size={16} style={{ color: 'var(--primary)' }} /> Mess QR Code
          </h4>
          <div className="digital-card-body">
            {form.messQrBase64 ? (
              <>
                <img 
                  src={form.messQrBase64} 
                  alt="Mess QR" 
                  className="digital-card-image" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setLightboxImage({ url: form.messQrBase64, label: 'Mess QR Code' })}
                />
                <div 
                  className="digital-card-overlay" 
                  onClick={() => setLightboxImage({ url: form.messQrBase64, label: 'Mess QR Code' })}
                  style={{ cursor: 'pointer' }}
                >
                  <button 
                    type="button"
                    className="card-overlay-btn" 
                    title="View Card" 
                    onClick={(e) => { e.stopPropagation(); setLightboxImage({ url: form.messQrBase64, label: 'Mess QR Code' }); }}
                  >
                    <Eye size={18} />
                  </button>
                  <label className="card-overlay-btn" title="Replace Card" onClick={(e) => e.stopPropagation()}>
                    <Upload size={18} />
                    <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleQrUpload} />
                  </label>
                  <button 
                    type="button"
                    className="card-overlay-btn btn-delete" 
                    title="Remove Card" 
                    onClick={(e) => { e.stopPropagation(); update('messQrBase64', ''); }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </>
            ) : (
              <label className="digital-card-empty">
                <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                <p><strong>Click to upload Mess QR</strong><br/>JPEG, PNG or WebP</p>
                <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleQrUpload} />
              </label>
            )}
          </div>
        </div>

        {/* Student ID Card Card */}
        <div className="digital-card-container">
          <h4 className="digital-card-title">
            <CreditCard size={16} style={{ color: 'var(--primary)' }} /> Student ID Card
          </h4>
          <div className="digital-card-body">
            {form.studentIdBase64 ? (
              <>
                <img 
                  src={form.studentIdBase64} 
                  alt="Student ID" 
                  className="digital-card-image" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setLightboxImage({ url: form.studentIdBase64, label: 'Student ID Card' })}
                />
                <div 
                  className="digital-card-overlay" 
                  onClick={() => setLightboxImage({ url: form.studentIdBase64, label: 'Student ID Card' })}
                  style={{ cursor: 'pointer' }}
                >
                  <button 
                    type="button"
                    className="card-overlay-btn" 
                    title="View Card" 
                    onClick={(e) => { e.stopPropagation(); setLightboxImage({ url: form.studentIdBase64, label: 'Student ID Card' }); }}
                  >
                    <Eye size={18} />
                  </button>
                  <label className="card-overlay-btn" title="Replace Card" onClick={(e) => e.stopPropagation()}>
                    <Upload size={18} />
                    <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleIdCardUpload} />
                  </label>
                  <button 
                    type="button"
                    className="card-overlay-btn btn-delete" 
                    title="Remove Card" 
                    onClick={(e) => { e.stopPropagation(); update('studentIdBase64', ''); }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </>
            ) : (
              <label className="digital-card-empty">
                <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                <p><strong>Click to upload ID Card</strong><br/>JPEG, PNG or WebP</p>
                <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleIdCardUpload} />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalIdentityCards;
