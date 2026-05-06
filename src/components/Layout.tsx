import type { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
  leftImage?: string;
  showImage?: boolean;
};

const Layout = ({ children, leftImage, showImage = true }: LayoutProps) => {
  return (
    <div className="main-content">
      {showImage && leftImage && (
        <div
          className="left-side"
          role="img"
          aria-label="ClassIQ learning illustration"
          style={{ backgroundImage: `url(${leftImage})` }}
        />
      )}

      <div className="right-side" style={{ flex: showImage ? 1 : 2 }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
