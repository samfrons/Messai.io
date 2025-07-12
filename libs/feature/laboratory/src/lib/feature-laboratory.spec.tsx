import { render } from '@testing-library/react';

import FeatureLaboratory from './feature-laboratory';

describe('FeatureLaboratory', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeatureLaboratory />);
    expect(baseElement).toBeTruthy();
  });
});
