import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Do I need an official IITGN email address to use this?',
    a: 'Yes, portal access is strictly restricted to valid IIT Gandhinagar student credentials. This maintains the privacy of portal databases, custom timetables, and academic events.'
  },
  {
    q: 'How does the auto-generated timetable mapping work?',
    a: 'During profile setup or in settings, select your courses. AcadX maps these courses against the standard IIT Gandhinagar slot matrix (e.g. Slot A, B, C etc.), instantly constructing your custom schedule without requiring manual entry.'
  },
  {
    q: 'Can I view the portal on my phone?',
    a: 'Absolutely. The entire application is built using responsive web standards. Every layout adapts dynamically to smartphones, tablets, and desktop devices for on-the-go routine checks.'
  },
  {
    q: 'Is my academic and grade data secure?',
    a: 'Yes, all personal records, grade registers, and custom tasks are cached in your local web storage and secured through Firebase Authentication. Your GPA logs are visible only to you.'
  },
  {
    q: 'Can I upload files or export records?',
    a: 'Yes. You can manage study notes with direct file attachments, record certificates in your profile page, and back up or download all of your student account data locally in structured JSON logs at any time.'
  }
];

const FaqSection = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleToggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <section className="faqs-container">
      <div className="landing-section-title-wrap">
        <h2 className="landing-section-title">Frequently Asked Questions</h2>
        <p className="landing-section-subtitle">Everything you need to know about access and security</p>
      </div>

      <div className="faqs-list">
        {FAQS.map((faq, i) => (
          <div key={i} className={`faq-item ${expandedFaq === i ? 'active' : ''}`}>
            <button className="faq-question-btn" onClick={() => handleToggleFaq(i)}>
              <span>{faq.q}</span>
              <ChevronDown size={18} className="faq-chevron" />
            </button>
            <div
              className="faq-answer"
              style={{ maxHeight: expandedFaq === i ? '150px' : '0' }}
            >
              <p style={{ margin: 0 }}>{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FaqSection;
