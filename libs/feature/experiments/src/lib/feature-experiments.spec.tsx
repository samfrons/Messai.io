import { render } from '@testing-library/react';

import FeatureExperiments from './feature-experiments';

describe('FeatureExperiments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeatureExperiments />);
    expect(baseElement).toBeTruthy();
  });
});
