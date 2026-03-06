import React from 'react';

interface Props {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

const MaterialIcons: React.FC<Props> = ({ name, size = 24, color = 'currentColor', style }) => (
  <span
    className="material-icons"
    style={{
      fontSize: size,
      color,
      fontFamily: 'Material Icons',
      fontWeight: 'normal',
      fontStyle: 'normal',
      display: 'inline-block',
      lineHeight: 1,
      letterSpacing: 'normal',
      textTransform: 'none',
      userSelect: 'none',
      ...style,
    }}
  >
    {name}
  </span>
);

export default MaterialIcons;
