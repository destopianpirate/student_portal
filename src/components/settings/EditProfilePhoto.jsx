import React, { useState, useRef } from 'react';
import { Camera, Upload, User, ZoomIn, ZoomOut, RotateCw, Grid, RefreshCw } from 'lucide-react';
import { convertGDriveUrl } from '../../utils/avatarUtils';

const AVATAR_SEEDS = [
  'Felix', 'Aneka', 'Milo', 'Luna', 'Pepper', 'Oscar', 'Bella', 'Shadow',
  'Simba', 'Nala', 'Oreo', 'Coco', 'Buddy', 'Daisy', 'Max', 'Ruby',
  'Charlie', 'Olive', 'Leo', 'Willow'
];

const EditProfilePhoto = ({
  form,
  setForm,
  update,
  activePhotoTab,
  setActivePhotoTab,
  handleFileUpload,
  currentUser
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showGridLines, setShowGridLines] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 50, posY: 50 });

  const getPreviewUrl = () => {
    if (activePhotoTab === 'upload') {
      if (form.profilePhotoBase64) return form.profilePhotoBase64;
      if (form.customPhotoUrl) return convertGDriveUrl(form.customPhotoUrl);
    }
    if (activePhotoTab === 'dicebear' && form.avatarUrl) return form.avatarUrl;
    return currentUser?.email 
      ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${currentUser.email}` 
      : 'https://api.dicebear.com/9.x/thumbs/svg?seed=default';
  };

  const previewPosition = `${form.photoPositionX}% ${form.photoPositionY}%`;

  const handleDragStart = (e) => {
    if (activePhotoTab === 'dicebear') return;
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      posX: form.photoPositionX,
      posY: form.photoPositionY
    };
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;

    const width = 150;
    const height = 195;
    const sensitivity = 0.6 * (100 / form.photoZoom);

    const newX = Math.max(0, Math.min(100, dragStartRef.current.posX - (dx / width) * 100 * sensitivity));
    const newY = Math.max(0, Math.min(100, dragStartRef.current.posY - (dy / height) * 100 * sensitivity));

    setForm(prev => ({
      ...prev,
      photoPositionX: Math.round(newX),
      photoPositionY: Math.round(newY)
    }));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="settings-accordion-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="photo-source-tabs" style={{ justifyContent: 'center', width: '100%' }}>
        <button 
          type="button"
          className={`photo-source-tab ${activePhotoTab === 'upload' ? 'active' : ''}`} 
          onClick={() => setActivePhotoTab('upload')}
        >
          <Upload size={14} /> Upload
        </button>
        <button 
          type="button"
          className={`photo-source-tab ${activePhotoTab === 'dicebear' ? 'active' : ''}`} 
          onClick={() => setActivePhotoTab('dicebear')}
        >
          <User size={14} /> Avatar
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.75rem', width: '100%' }}>
        <div style={{ flex: '0 1 350px', minWidth: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          {activePhotoTab === 'upload' && (
            <label className="file-upload-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '235px', margin: 0, width: '100%' }}>
              <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
              <p style={{ margin: 0 }}>Click to select or drag and drop<br/><small style={{ color: 'var(--text-muted)' }}>(JPEG, PNG, WebP up to 5MB)</small></p>
              <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleFileUpload} />
            </label>
          )}
          
          {activePhotoTab === 'dicebear' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.5rem', textAlign: 'center' }}>Select a dynamic avatar seed:</p>
              <div className="avatar-scroll-container">
                {AVATAR_SEEDS.map(seed => {
                  const url = `https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}`;
                  const isSelected = form.avatarUrl === url;
                  return (
                    <img 
                      key={seed} 
                      src={url} 
                      alt={seed}
                      className={`avatar-option-img ${isSelected ? 'selected' : ''}`}
                      onClick={() => { update('avatarUrl', url); update('customPhotoUrl', ''); update('profilePhotoBase64', ''); }} 
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <div style={{ flex: '0 1 450px', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', width: '100%' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', width: '100%', textAlign: 'center' }}>Interactive Focus &amp; Crop Editor</label>
          
          <div className="crop-editor-layout">
            {/* Viewport with grid overlay and drag listeners */}
            <div 
              className={`focal-editor-viewport aspect-${form.photoAspectRatio} ${isDragging ? 'dragging' : ''}`}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
              {/* Grid overlay */}
              {showGridLines && (
                <div className="viewport-grid-lines">
                  <div className="grid-line-h h-1" />
                  <div className="grid-line-h h-2" />
                  <div className="grid-line-v v-1" />
                  <div className="grid-line-v v-2" />
                </div>
              )}
              
              {/* Circular/Squircle Crop Guidelines */}
              <div className="viewport-crop-guideline" />
              
              {/* Target Reticle Crosshair */}
              <div className="viewport-target-reticle" />

              <img 
                src={getPreviewUrl()} 
                alt="Focal Preview" 
                draggable="false"
                style={{ 
                  objectPosition: previewPosition,
                  transform: `scale(${form.photoZoom / 100}) rotate(${form.photoRotation}deg)`,
                  pointerEvents: activePhotoTab === 'dicebear' ? 'auto' : 'none' /* prevent default image dragging behavior */
                }} 
              />
              
              {/* Technical Info Overlays */}
              <div className="viewport-tech-info top-left-info">FOCAL_X: {form.photoPositionX}%</div>
              <div className="viewport-tech-info bottom-right-info">FOCAL_Y: {form.photoPositionY}%</div>
            </div>

            {/* Right side controls dock */}
            <div className="focal-editor-dock">
              {/* Framing Shape Options */}
              <div className="dock-control-group">
                <label className="dock-group-label">Framing Aspect Ratio</label>
                <div className="dock-presets-row">
                  <button 
                    type="button"
                    className={`dock-preset-btn ${form.photoAspectRatio === 'card' ? 'active' : ''}`}
                    onClick={() => update('photoAspectRatio', 'card')}
                    title="Student Card (3:4)"
                  >
                    Card (3:4)
                  </button>
                  <button 
                    type="button"
                    className={`dock-preset-btn ${form.photoAspectRatio === 'circle' ? 'active' : ''}`}
                    onClick={() => update('photoAspectRatio', 'circle')}
                    title="Round Avatar (1:1)"
                  >
                    Circle
                  </button>
                  <button 
                    type="button"
                    className={`dock-preset-btn ${form.photoAspectRatio === 'squircle' ? 'active' : ''}`}
                    onClick={() => update('photoAspectRatio', 'squircle')}
                    title="Cyber Squircle (1:1)"
                  >
                    Squircle
                  </button>
                </div>
              </div>

              {/* Zoom and rotation sliders */}
              {(activePhotoTab === 'upload') && (
                <>
                  <div className="dock-control-group">
                    <label className="dock-group-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Zoom Scale</span>
                      <span>{form.photoZoom}%</span>
                    </label>
                    <div className="slider-row-new">
                      <ZoomOut size={14} style={{ color: 'var(--text-muted)' }} />
                      <input 
                        type="range" 
                        min="100" 
                        max="300" 
                        value={form.photoZoom}
                        onChange={e => update('photoZoom', parseInt(e.target.value))}
                      />
                      <ZoomIn size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>

                  <div className="dock-control-group">
                    <label className="dock-group-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Rotation Angle</span>
                      <span>{form.photoRotation}°</span>
                    </label>
                    <div className="slider-row-new">
                      <RotateCw size={14} style={{ color: 'var(--text-muted)' }} />
                      <input 
                        type="range" 
                        min="-180" 
                        max="180" 
                        value={form.photoRotation}
                        onChange={e => update('photoRotation', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Utility Action Buttons */}
              <div className="dock-presets-row" style={{ marginTop: '0.25rem' }}>
                <button 
                  type="button"
                  className={`dock-utility-btn ${showGridLines ? 'active' : ''}`}
                  onClick={() => setShowGridLines(!showGridLines)}
                  style={{ flex: 1, gap: '4px' }}
                >
                  <Grid size={12} /> Align Grid
                </button>
                <button 
                  type="button"
                  className="dock-utility-btn"
                  onClick={() => {
                    setForm(p => ({
                      ...p,
                      photoPositionX: 50,
                      photoPositionY: 50,
                      photoZoom: 100,
                      photoRotation: 0
                    }));
                  }}
                  style={{ flex: 1, gap: '4px' }}
                >
                  <RefreshCw size={12} /> Reset
                </button>
              </div>
            </div>
          </div>
          
          {activePhotoTab !== 'dicebear' && (
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0', textAlign: 'center', width: '100%' }}>
              💡 <strong>Tip:</strong> Click and drag directly on the image preview to align it!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfilePhoto;
