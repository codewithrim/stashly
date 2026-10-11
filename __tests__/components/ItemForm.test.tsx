import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ItemForm } from '../../src/components/items/ItemForm';

describe('ItemForm', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('renders inputs and submit button', async () => {
    await render(<ItemForm onSubmit={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByText('Title *')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g. Ideas for app redesign')).toBeTruthy();
    expect(screen.getByText('Create Item')).toBeTruthy();
  });

  it('shows error when submitting empty title', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    await render(<ItemForm onSubmit={onSubmit} onCancel={jest.fn()} />);

    await user.press(screen.getByRole('button', { name: /create item/i }));

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeTruthy();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid values', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    await render(<ItemForm onSubmit={onSubmit} onCancel={jest.fn()} />);

    await user.type(
      screen.getByPlaceholderText('e.g. Ideas for app redesign'),
      'My New Note'
    );
    await user.type(
      screen.getByPlaceholderText('Write your note or thoughts here...'),
      'Some important detail'
    );

    await user.press(screen.getByRole('button', { name: /create item/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        type: 'note',
        title: 'My New Note',
        content: 'Some important detail',
        url: '',
        imageUri: null,
        tags: [],
      });
    });
  });
});
