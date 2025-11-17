import React from 'react';
import TreasureHunt from '@site/src/components/TreasureHunt';

export default function QrScannerStandalone() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>QR Scanner</title>
        <style dangerouslySetInnerHTML={{__html: `
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            background: #ffffff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          * {
            box-sizing: border-box;
          }
        `}} />
      </head>
      <body>
        <div style={{ 
          width: '100%',
          maxWidth: '500px',
          padding: '20px',
        }}>
          <TreasureHunt />
        </div>
      </body>
    </html>
  );
}
