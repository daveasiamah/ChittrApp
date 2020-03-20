/**
 * @format
 */

import 'react-native';
import React from 'react';
import {getId} from '../src/UsersPage';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

test('getId', () =>
{
  expect(getId(18)).toBe(18);
});
