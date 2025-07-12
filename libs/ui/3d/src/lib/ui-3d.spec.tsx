import { render } from '@testing-library/react';

import Ui3d from './ui-3d';

describe('Ui3d', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Ui3d />);
    expect(baseElement).toBeTruthy();
  });
});
