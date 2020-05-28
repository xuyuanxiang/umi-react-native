import React from 'react';
import { BackButton } from 'umi';

export default function Layout({ children }) {
  return <BackButton>{children}</BackButton>;
}
