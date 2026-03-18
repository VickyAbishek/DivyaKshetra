import React from 'react';
import { render } from '@testing-library/react-native';
import { StatusBadge } from '../../components/shared/StatusBadge';

it('renders Under Review badge', () => {
  const { getByText } = render(<StatusBadge status="under_review" />);
  expect(getByText(/Under Review/i)).toBeTruthy();
});

it('renders Approved badge', () => {
  const { getByText } = render(<StatusBadge status="approved" />);
  expect(getByText(/Approved/i)).toBeTruthy();
});

it('renders Not Approved badge', () => {
  const { getByText } = render(<StatusBadge status="rejected" />);
  expect(getByText(/Not Approved/i)).toBeTruthy();
});
