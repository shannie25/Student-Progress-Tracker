import React from 'react';

const Layout = ({ children, leftImage, title, showImage = true }) => {
  return (
    <div className="main-content">
  
      {showImage && (
        <div 
          className="left-side" 
          style={{ backgroundImage: `url(${leftImage})` }}
        ></div>
      )}

      <div className="right-side" style={{ flex: showImage ? 1 : 2 }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;