import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Globe, 
  Link as LinkIcon, 
  Trash2, 
  Plus, 
  BookOpen, 
  Palette 
} from 'lucide-react';

// Custom inline SVG icons for brands to ensure cross-version Lucide compatibility
const LinkedInIcon = ({ size = 16, className = "" }) => (
  <svg className={`lucide lucide-linkedin ${className}`} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
);

const InstagramIcon = ({ size = 16, className = "" }) => (
  <svg className={`lucide lucide-instagram ${className}`} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);

const TwitterIcon = ({ size = 16, className = "" }) => (
  <svg className={`lucide lucide-twitter ${className}`} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const GithubIcon = ({ size = 16, className = "" }) => (
  <svg className={`lucide lucide-github ${className}`} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
);

const YoutubeIcon = ({ size = 16, className = "" }) => (
  <svg className={`lucide lucide-youtube ${className}`} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>
);

const FacebookIcon = ({ size = 16, className = "" }) => (
  <svg className={`lucide lucide-facebook ${className}`} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);

const EditContactSocials = ({
  form,
  update,
  updateNested
}) => {
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Function to resolve link icons dynamically based on URL domains
  const resolveLinkIcon = (url = '') => {
    const lowercaseUrl = url.toLowerCase();
    if (lowercaseUrl.includes('github.com')) return <GithubIcon size={16} />;
    if (lowercaseUrl.includes('linkedin.com')) return <LinkedInIcon size={16} />;
    if (lowercaseUrl.includes('instagram.com')) return <InstagramIcon size={16} />;
    if (lowercaseUrl.includes('twitter.com') || lowercaseUrl.includes('x.com')) return <TwitterIcon size={16} />;
    if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) return <YoutubeIcon size={16} />;
    if (lowercaseUrl.includes('facebook.com')) return <FacebookIcon size={16} />;
    if (lowercaseUrl.includes('medium.com')) return <BookOpen size={16} />;
    if (lowercaseUrl.includes('dribbble.com') || lowercaseUrl.includes('behance.net')) return <Palette size={16} />;
    return <LinkIcon size={16} />;
  };

  const handleAddLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    let url = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    const newLink = {
      id: Date.now(),
      label: newLinkLabel.trim(),
      url
    };
    update('customLinks', [...(form.customLinks || []), newLink]);
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

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
              <input value={form.phone || ''} onChange={e => update('phone', e.target.value)} placeholder="+91..." />
              <Phone className="premium-input-icon" size={16} />
            </div>
            <div className="privacy-toggle" style={{ marginTop: '0.4rem' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Show Publicly on Card?</label>
              <button 
                type="button"
                className={`toggle-switch ${form.privacy?.phone ? 'active' : ''}`} 
                onClick={() => updateNested('privacy', 'phone', !form.privacy?.phone)} 
              />
            </div>
          </div>

          <div className="edit-field">
            <label>Recovery Email</label>
            <div className="premium-input-wrapper">
              <input value={form.gmail || ''} onChange={e => update('gmail', e.target.value)} placeholder="personal@gmail.com" />
              <Mail className="premium-input-icon" size={16} />
            </div>
            <div className="privacy-toggle" style={{ marginTop: '0.4rem' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Show Publicly on Card?</label>
              <button 
                type="button"
                className={`toggle-switch ${form.privacy?.email ? 'active' : ''}`} 
                onClick={() => updateNested('privacy', 'email', !form.privacy?.email)} 
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
            <label>LinkedIn Profile</label>
            <div className="premium-input-wrapper">
              <input value={form.linkedin || ''} onChange={e => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" />
              <LinkedInIcon className="premium-input-icon" size={16} />
            </div>
          </div>
          <div className="edit-field">
            <label>Instagram Handle</label>
            <div className="premium-input-wrapper">
              <input value={form.instagram || ''} onChange={e => update('instagram', e.target.value)} placeholder="https://instagram.com/username" />
              <InstagramIcon className="premium-input-icon" size={16} />
            </div>
          </div>
          <div className="edit-field" style={{ gridColumn: 'span 2' }}>
            <label>X (Twitter) Profile</label>
            <div className="premium-input-wrapper">
              <input value={form.x || ''} onChange={e => update('x', e.target.value)} placeholder="https://x.com/username" />
              <TwitterIcon className="premium-input-icon" size={16} />
            </div>
          </div>
        </div>
        
        <div className="privacy-toggle" style={{ borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>Show Social Links Publicly?</label>
          <button 
            type="button"
            className={`toggle-switch ${form.privacy?.social ? 'active' : ''}`} 
            onClick={() => updateNested('privacy', 'social', !form.privacy?.social)} 
          />
        </div>
      </div>

      {/* Portfolios & Custom Links Group */}
      <div className="settings-form-group">
        <h4 className="settings-form-subtitle">
          <LinkIcon size={14} /> Portfolios &amp; Custom Links
        </h4>
        
        <div className="edit-profile-grid" style={{ marginTop: 0, marginBottom: '1.25rem' }}>
          <div className="edit-field">
            <label>GitHub Profile</label>
            <div className="premium-input-wrapper">
              <input value={form.github || ''} onChange={e => update('github', e.target.value)} placeholder="https://github.com/username" />
              <GithubIcon className="premium-input-icon" size={16} />
            </div>
          </div>

          <div className="edit-field">
            <label>Personal Website</label>
            <div className="premium-input-wrapper">
              <input value={form.website || ''} onChange={e => update('website', e.target.value)} placeholder="https://yourwebsite.com" />
              <Globe className="premium-input-icon" size={16} />
            </div>
          </div>
        </div>

        {/* Dynamic Custom Links List */}
        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          My Custom Links
        </label>
        
        {form.customLinks && form.customLinks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {form.customLinks.map(link => (
              <div 
                key={link.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: 'var(--input-bg)', 
                  padding: '0.5rem 1.25rem', 
                  borderRadius: '9999px',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                  {resolveLinkIcon(link.url)}
                  <span style={{ fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{link.label}:</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a href={link.url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{link.url}</a>
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    update('customLinks', form.customLinks.filter(l => l.id !== link.id));
                  }}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: '#ef4444', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0 0 1rem 0' }}>No custom links added yet.</p>
        )}

        {/* Add Custom Link Form */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <div className="premium-input-wrapper" style={{ flex: '1 1 150px' }}>
            <input 
              placeholder="e.g. My Portfolio" 
              value={newLinkLabel} 
              onChange={e => setNewLinkLabel(e.target.value)} 
              style={{ paddingLeft: '2.5rem', paddingRight: '1rem' }}
            />
            <LinkIcon className="premium-input-icon" size={16} />
          </div>
          <div className="premium-input-wrapper" style={{ flex: '2 1 200px' }}>
            <input 
              placeholder="URL (e.g. portfolio.com)" 
              value={newLinkUrl} 
              onChange={e => setNewLinkUrl(e.target.value)} 
              style={{ paddingLeft: '2.5rem', paddingRight: '1rem' }}
            />
            <Globe className="premium-input-icon" size={16} />
          </div>
          <button 
            type="button" 
            className="btn btn-primary btn-sm" 
            onClick={handleAddLink}
            style={{ 
              borderRadius: '9999px', 
              padding: '0 1rem', 
              height: '38px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '4px',
              whiteSpace: 'nowrap'
            }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditContactSocials;
