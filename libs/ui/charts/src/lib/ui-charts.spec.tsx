import { render } from '@testing-library/react';

import UiCharts from './ui-charts';

describe('UiCharts', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiCharts />);
    expect(baseElement).toBeTruthy();
  });
});
