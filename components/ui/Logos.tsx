import React from 'react';
import cevaLogo from '../../images/ceva-logo-web.png';
import c4Logo from '../../images/c4-logo-web.png';
import cmaLogo from '../../images/cma-cgm-logo-web.svg';
import siemLogo from '../../images/siem-logo-web.png';

export const LogoC4 = ({ className = "h-12 w-auto" }: { className?: string }) => (
  <img
    src={c4Logo}
    alt="C4 Engineering"
    className={`${className} object-contain`}
  />
);

export const LogoCMA = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <img 
    src={cmaLogo}
    alt="CMA CGM" 
    className={`${className} object-contain transition-all duration-300`}
  />
);

export const LogoCEVA = ({ className = "h-8 w-auto" }: { className?: string }) => (
  <img 
    src={cevaLogo}
    alt="CEVA Logistics" 
    className={`${className} object-contain transition-all duration-300`}
  />
);

export const LogoSIEM = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <img 
    src={siemLogo}
    alt="SIEM Joint" 
    className={`${className} object-contain transition-all duration-300`}
  />
);
