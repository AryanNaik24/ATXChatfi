import React from 'react';

import {HeaderProps } from '../types/types';

const Header: React.FC<HeaderProps> = ({ header }) => {
  return (
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">{header}</h2>

  );
};

Header.propTypes = {};

export default Header;
