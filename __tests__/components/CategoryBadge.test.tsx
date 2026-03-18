import React from 'react';
import { render } from '@testing-library/react-native';
import { CategoryBadge } from '../../components/shared/CategoryBadge';

it('renders Temple badge', () => {
  const { getByText } = render(<CategoryBadge category="temple" />);
  expect(getByText(/Temple/i)).toBeTruthy();
});

it('renders Sacred Water badge', () => {
  const { getByText } = render(<CategoryBadge category="water" />);
  expect(getByText(/Sacred Water/i)).toBeTruthy();
});
