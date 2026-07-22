import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValidationPanel } from './ValidationPanel';
import type { Issue } from '@nxgen/configurator-core';

describe('ValidationPanel', () => {
  it('shows the empty state when there are no issues', () => {
    render(<ValidationPanel issues={[]} emptyTitle="Wszystko OK" />);
    expect(screen.getByText('Wszystko OK')).toBeTruthy();
    expect(screen.getByText('OK')).toBeTruthy();
  });

  it('renders issue rows with rule + message', () => {
    const issues: Issue[] = [
      { id: 'r1', rule: 'rise_max', severity: 'error', field: 'stepCount', message: 'za wysoko' },
    ];
    render(<ValidationPanel issues={issues} />);
    expect(screen.getByText(/rise_max/)).toBeTruthy();
    expect(screen.getByText('za wysoko')).toBeTruthy();
    expect(screen.getByText('1 UWAG')).toBeTruthy();
  });
});
