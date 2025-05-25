/**
 * The logo component is a dynamically colored svg of the Swoosh logo.
 * It"s recommended that you use useMantineColorScheme to change the color based on the mode of the user. 
 */

import React from "react";

interface LogoProps {
  color: string; // Allows passing a dynamic color
}

const Logo: React.FC<LogoProps> = ({ color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 201.57 58.14"
    width="128"
    height="58.14"
  >
    <style>
      {`
        .text {
          fill: ${color};
          font-family: "Avenir Next Condensed", sans-serif;
          font-size: 50px;
          font-style: italic;
          font-weight: 700;
        }
        .path {
          fill: ${color};
        }
      `}
    </style>
    <g>
      <text className="text" transform="translate(.75 42.7)">
        <tspan x="0" y="0">swoosh</tspan>
      </text>
      <path
        className="path"
        d="M175.75,24.07c-.27,1.59-.54,3.18-.81,4.77,0,0,0,0,0,0l-1.61,9.13c-.05.27.16.52.44.52h27.36c.28,0,.49.26.43.54-.29,1.37-.59,2.74-.89,4.11-.04.2-.22.35-.43.35h-27.52c-.22,0-.4.15-.44.37l-2.45,13.92c-.04.21-.22.37-.44.37h-96.23c-.3,0-.52-.3-.42-.58l1.37-4.11c.06-.18.23-.3.42-.3h90.66c.22,0,.4-.15.44-.37l4.13-23.42c.05-.27-.16-.52-.44-.52h-14.99c-.28,0-.5-.26-.43-.54l.94-4.11c.02-.1.08-.19.16-.25.12-.09.24-.1.28-.1h20.27l.13.07.06.16Z"
      />
    </g>
  </svg>
);

export default Logo;
