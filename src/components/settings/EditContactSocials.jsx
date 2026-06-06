import React from 'react';
import { Phone, Mail, Globe } from 'lucide-react';

const EditContactSocials = ({
  form,
  update,
  updateNested
}) => {
  return (
    <div className="settings-accordion-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', margin: 0 }}>
        Adjust your details and choose what's visible publicly on your student card.
      </p>
      
      {/* Contact Information Group */}
      <div className="settings-form-group">
        <h4 className="settings-form-subtitle">
          <Mail size={14} /> Contact Information
        </h4>
        <div className="edit-profile-grid" style={{ marginTop: 0 }}>
          <div className="edit-field">
            <label>Phone Number</label>
            <div className="premium-input-wrapper">
              <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91..." />
              <Phone className="premium-input-icon" size={16} />
            </div>
            <div className="privacy-toggle" style={{ marginTop: '0.4rem' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Show Publicly on Card?</label>
              <button 
                type="button"
                className={`toggle-switch ${form.privacy.phone ? 'active' : ''}`} 
                onClick={() => updateNested('privacy', 'phone', !form.privacy.phone)} 
              />
            </div>
          </div>

          <div className="edit-field">
            <label>Recovery Email</label>
            <div className="premium-input-wrapper">
              <input value={form.gmail} onChange={e => update('gmail', e.target.value)} placeholder="personal@gmail.com" />
              <Mail className="premium-input-icon" size={16} />
            </div>
            <div className="privacy-toggle" style={{ marginTop: '0.4rem' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Show Publicly on Card?</label>
              <button 
                type="button"
                className={`toggle-switch ${form.privacy.email ? 'active' : ''}`} 
                onClick={() => updateNested('privacy', 'email', !form.privacy.email)} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Connections Group */}
      <div className="settings-form-group">
        <h4 className="settings-form-subtitle">
          <Globe size={14} /> Social Connections
        </h4>
        <div className="edit-profile-grid" style={{ marginTop: 0 }}>
          <div className="edit-field">
            <label>GitHub Profile</label>
            <div className="premium-input-wrapper">
              <input value={form.github} onChange={e => update('github', e.target.value)} placeholder="https://github.com/username" />
              <Globe className="premium-input-icon" size={16} />
            </div>
          </div>
          <div className="edit-field">
            <label>LinkedIn Profile</label>
            <div className="premium-input-wrapper">
              <input value={form.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" />
              <Globe className="premium-input-icon" size={16} />
            </div>
          </div>
          <div className="edit-field" style={{ gridColumn: 'span 2' }}>
            <label>Instagram Handle</label>
            <div className="premium-input-wrapper">
              <input value={form.instagram} onChange={e => update('instagram', e.target.value)} placeholder="https://instagram.com/username" />
              <Globe className="premium-input-icon" size={16} />
            </div>
          </div>
        </div>
        
        <div className="privacy-toggle" style={{ borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>Show Social Links Publicly?</label>
          <button 
            type="button"
            className={`toggle-switch ${form.privacy.social ? 'active' : ''}`} 
            onClick={() => updateNested('privacy', 'social', !form.privacy.social)} 
          />
        </div>
      </div>

    </div>
  );
};

export default EditContactSocials;
