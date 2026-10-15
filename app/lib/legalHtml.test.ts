import {describe, expect, it} from 'vitest';
import {formatLegalHtml} from './legalHtml';

describe('formatLegalHtml', () => {
  it('turns bold only paragraphs into headings', () => {
    expect(
      formatLegalHtml(
        '<p><strong>How to start a return</strong></p><p>Email us.</p>',
      ),
    ).toBe('<h2>How to start a return</h2><p>Email us.</p>');
  });

  it('handles <b> and a trailing line break', () => {
    expect(formatLegalHtml('<p><b>Refunds</b><br></p>')).toBe(
      '<h2>Refunds</h2>',
    );
  });

  it('leaves paragraphs that only start in bold alone', () => {
    const html = '<p><strong>Note:</strong> returns must be unopened.</p>';
    expect(formatLegalHtml(html)).toBe(html);
  });

  it('does not promote long bold paragraphs', () => {
    const long = 'A'.repeat(120);
    const html = `<p><strong>${long}</strong></p>`;
    expect(formatLegalHtml(html)).toBe(html);
  });

  it('splits <br> separated lines into paragraphs before promoting', () => {
    expect(
      formatLegalHtml(
        '<p><strong>Refunds</strong><br>Approved refunds go back in 5 to 10 days.<br><br>Questions? Email us.</p>',
      ),
    ).toBe(
      '<h2>Refunds</h2><p>Approved refunds go back in 5 to 10 days.</p><p>Questions? Email us.</p>',
    );
  });

  it('drops a first line that repeats the title', () => {
    expect(
      formatLegalHtml(
        '<p><strong>Refund Policy</strong></p><p>We want you to love SleepFuel.</p>',
        'Refund Policy',
      ),
    ).toBe('<p>We want you to love SleepFuel.</p>');
    expect(
      formatLegalHtml('<h1>Terms of Service</h1><p>Hello</p>', 'Terms of Service'),
    ).toBe('<p>Hello</p>');
  });

  it('keeps a first line that is not the title', () => {
    expect(
      formatLegalHtml('<p>We want you to love SleepFuel.</p>', 'Refund Policy'),
    ).toBe('<p>We want you to love SleepFuel.</p>');
  });

  it('keeps existing headings and lists untouched', () => {
    const html = '<h2>Shipping</h2><ul><li>Free over $50</li></ul>';
    expect(formatLegalHtml(html, 'Shipping Policy')).toBe(html);
  });

  it('handles empty input', () => {
    expect(formatLegalHtml('')).toBe('');
  });
});
