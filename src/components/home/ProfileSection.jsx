import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Link as LinkIcon, ChevronDown, CreditCard, QrCode, Phone, Edit2 } from 'lucide-react';

const ProfileSection = ({
  userProfile,
  currentUser,
  isMobile,
  isDetailsExpanded,
  showQrId,
  handleToggleQr,
  showContactInfo,
  setShowContactInfo,
  avatarUrl,
  photoPosition,
  mainProfileFields,
  contactFields,
  cardContainerVariants,
  singleCardVariants,
  itemVariants,
  setActiveLightBoxImage,
  navigate
}) => {
  return (
    <div 
      className="home-top" 
      style={{ 
        gridTemplateColumns: (!isMobile && isDetailsExpanded) ? '28% auto 1fr' : undefined,
        transition: !isMobile ? 'grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
      }}
    >
      {/* LEFT 30% - Avatar & Identity */}
      <motion.div className="profile-left" variants={itemVariants} style={{ zIndex: 10, position: 'relative' }}>
        {isMobile ? (
          <>
            {/* Photo Area */}
            <div className="holo-avatar-container">
              <div className="holo-avatar-frame">
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="holo-avatar-img"
                  style={{ 
                    objectPosition: photoPosition,
                    '--img-zoom': (userProfile?.photoZoom ?? 100) / 100,
                    '--img-rot': `${userProfile?.photoRotation ?? 0}deg`
                  }} 
                />
              </div>
            </div>

            {/* Data Area */}
            <div className="holo-data-container">
              <div className="holo-cursive-signature">destopian pirate</div>
              <div className="holo-id-badge">ID: {userProfile?.rollNumber || '—'}</div>
            </div>

            {/* Action Area */}
            <div className="holo-action-area">
              {userProfile?.messQrBase64 || userProfile?.studentIdBase64 ? (
                <button className="holo-action-btn" onClick={handleToggleQr}>
                  <CreditCard size={14} /> {showQrId ? 'HIDE CARDS' : 'Show Mess QR and Student ID'}
                </button>
              ) : (
                <button className="holo-action-btn upload" onClick={() => navigate('/settings', { state: { openSection: 'messqr' } })}>
                  <QrCode size={14} /> UPLOAD CREDENTIALS
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="profile-username">{userProfile?.username || currentUser?.displayName || 'Student'}</h2>
            
            <div className="avatar-containment-cell">
              {/* Futuristic ambient back glow */}
              <div className="avatar-ambient-glow" />
              
              {/* Main photo frame */}
              <div className={`avatar-photo-frame aspect-${userProfile?.photoAspectRatio || 'card'}`}>
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="profile-avatar-large" 
                  style={{ 
                    objectPosition: photoPosition,
                    '--img-zoom': (userProfile?.photoZoom ?? 100) / 100,
                    '--img-rot': `${userProfile?.photoRotation ?? 0}deg`
                  }} 
                />
                <div className="avatar-hologram-sheen" />
              </div>
            </div>

            <div className="profile-student-id">ID: {userProfile?.rollNumber || '—'}</div>

            {/* QR / ID Card Toggle Button */}
            {userProfile?.messQrBase64 || userProfile?.studentIdBase64 ? (
              <div className="qr-id-dropdown" style={{ width: '100%', marginTop: '0.75rem' }}>
                <button className="qr-id-toggle" onClick={handleToggleQr} style={{ cursor: 'pointer', width: '100%', whiteSpace: 'nowrap' }}>
                  <CreditCard size={13} /> {showQrId ? 'Hide My Cards' : 'Show My Cards'} <ChevronDown size={13} style={{ transform: showQrId ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              </div>
            ) : (
              <div className="qr-id-upload-prompt" style={{ marginTop: '0.75rem', width: '100%' }}>
                <button 
                  className="btn btn-outline btn-sm" 
                  style={{ fontSize: '0.75rem', gap: '0.4rem', width: '100%', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  onClick={() => navigate('/settings', { state: { openSection: 'messqr' } })}
                >
                  <QrCode size={14} /> Upload QR & ID Card
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* MIDDLE COLUMN - Vertically stacked QR/ID cards that slide out from behind profile-left */}
      <AnimatePresence>
        {showQrId && (
          <motion.div
            variants={cardContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
              justifyContent: 'center',
              overflow: 'hidden',
              zIndex: 5,
              position: 'relative',
              paddingLeft: isMobile ? 0 : '0.5rem',
              paddingTop: isMobile ? '0.5rem' : 0,
              height: isMobile ? 'auto' : '100%',
              width: isMobile ? '100%' : 'auto',
              alignItems: isMobile ? 'center' : 'stretch'
            }}
          >
            {userProfile?.messQrBase64 && (
              <motion.div 
                variants={singleCardVariants}
                className={`qr-id-card ${isMobile ? 'mobile-holo-qr-card' : ''}`}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: isMobile ? '1.25rem' : '0.4rem',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: isMobile ? 'auto' : 'auto',
                  width: '100%',
                  maxWidth: isMobile ? '280px' : '220px',
                  margin: '0 auto',
                  aspectRatio: '1 / 1',
                  flex: 'none',
                  minHeight: 0,
                  overflow: 'hidden'
                }}
              >
                <label style={{ margin: '0 0 0.15rem 0', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mess QR</label>
                <img 
                  src={userProfile.messQrBase64} 
                  alt="Mess QR" 
                  style={{ 
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%',
                    flex: 'none',
                    minHeight: 0,
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: '#fff',
                    padding: isMobile ? '0.6rem' : '0.2rem'
                  }}
                  onClick={() => setActiveLightBoxImage({ url: userProfile.messQrBase64, label: 'Mess QR' })}
                />
              </motion.div>
            )}

            {userProfile?.studentIdBase64 && (
              <motion.div 
                variants={singleCardVariants}
                className={`qr-id-card ${isMobile ? 'mobile-holo-qr-card' : ''}`}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: isMobile ? '1.25rem' : '0.4rem',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: isMobile ? 'auto' : 'auto',
                  width: '100%',
                  maxWidth: '280px',
                  flex: isMobile ? 'none' : '1',
                  minHeight: 0,
                  overflow: 'hidden'
                }}
              >
                <label style={{ margin: '0 0 0.15rem 0', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student ID</label>
                <img 
                  src={userProfile.studentIdBase64} 
                  alt="Student ID" 
                  style={{ 
                    cursor: 'pointer',
                    width: '100%',
                    flex: isMobile ? 'none' : '1',
                    minHeight: 0,
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: '#fff'
                  }}
                  onClick={() => setActiveLightBoxImage({ url: userProfile.studentIdBase64, label: 'Student ID Card' })}
                />
              </motion.div>
            )}

            {(!userProfile?.messQrBase64 || !userProfile?.studentIdBase64) && (
              <motion.div
                variants={singleCardVariants}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px dashed var(--border)',
                  borderRadius: '12px',
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  aspectRatio: isMobile ? 'auto' : '1.58 / 1',
                  height: isMobile ? 'auto' : 'auto',
                  width: isMobile ? '100%' : '100%',
                  maxWidth: isMobile ? '260px' : '100%',
                  flex: isMobile ? 'none' : '1',
                  textAlign: 'center'
                }}
              >
                <button 
                  className="btn btn-ghost btn-xs" 
                  style={{ width: '100%', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', padding: '0.2rem' }}
                  onClick={() => navigate('/settings', { state: { openSection: 'messqr' } })}
                >
                  <QrCode size={12} /> Add missing {!userProfile?.messQrBase64 ? 'Mess QR' : 'Student ID'}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT 70% - Profile Details (View Only) */}
      <motion.div className="profile-right" variants={itemVariants}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '.5rem', margin: 0 }}><User size={18} /> Profile Details</h3>
        </div>

        <div 
          className="profile-details-grid"
          style={{
            gridTemplateColumns: (!isMobile && isDetailsExpanded) ? '1fr 1fr' : undefined
          }}
        >
          {(() => {
            const combinedFields = [
              ...mainProfileFields,
              ...(!isMobile ? contactFields : [])
            ];
            const maxFields = isDetailsExpanded ? 6 : 9;
            const visibleFields = combinedFields.slice(0, maxFields);
            
            return visibleFields.map(({ label, value, link, isNameField, rollNumber }) => (
              <div key={label} className="profile-detail-item">
                <span className="detail-label">{label}</span>
                {isNameField ? (
                  <span className="detail-value">
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>{value || '—'}</span>
                    {rollNumber && <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.3rem' }}>({rollNumber})</span>}
                  </span>
                ) : (
                  <span className="detail-value">
                    {link && value ? <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer">{value}</a> : (value || '—')}
                  </span>
                )}
              </div>
            ));
          })()}
        </div>

        {/* Mobile Contact & Links Dropdown - initially collapsed */}
        {isMobile && (
          <div className="profile-contact-dropdown">
            <button className="profile-contact-toggle" onClick={() => setShowContactInfo(!showContactInfo)}>
              <LinkIcon size={14} />
              <span>Contact & Links</span>
              <ChevronDown size={14} style={{ transform: showContactInfo ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease', marginLeft: 'auto' }} />
            </button>
            {showContactInfo && (
              <div className="profile-contact-items">
                {contactFields.length > 0 ? (
                  <>
                    {contactFields.map(({ label, value, link }) => (
                      <div key={label} className="profile-detail-item">
                        <span className="detail-label">{label}</span>
                        <span className="detail-value">
                          {link && value ? <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer">{value}</a> : (value || '—')}
                        </span>
                      </div>
                    ))}
                    <div style={{ gridColumn: 'span 2', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                      <button 
                        className="btn btn-ghost btn-xs" 
                        style={{ width: '100%', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' }}
                        onClick={() => navigate('/settings', { state: { openSection: 'contact' } })}
                      >
                        <Edit2 size={12} /> Manage Contact & Socials
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '0.75rem 0.25rem', textAlign: 'center', fontSize: '0.8rem', gridColumn: 'span 2' }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>No public contact details setup yet.</p>
                    <button 
                      className="btn btn-outline btn-sm" 
                      style={{ fontSize: '0.75rem', gap: '0.4rem', width: '100%', cursor: 'pointer' }}
                      onClick={() => navigate('/settings', { state: { openSection: 'contact' } })}
                    >
                      <Phone size={12} /> Setup Contact & Social Links
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default React.memo(ProfileSection);
