import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import VoiceRecorder from './VoiceRecorder';

expect.extend(toHaveNoViolations);

describe('VoiceRecorder a11y', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<VoiceRecorder />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 