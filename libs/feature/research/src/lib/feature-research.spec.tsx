import { render } from '@testing-library/react';

import FeatureResearch from './feature-research';

describe('FeatureResearch', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeatureResearch />);
    expect(baseElement).toBeTruthy();
  });
});
