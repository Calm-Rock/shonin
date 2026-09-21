import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'Shonin: human approval, delivered to any inbox';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const logo = await readFile(join(process.cwd(), 'public/logo.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0a0a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 96px',
          gap: 64,
        }}
      >
        <img src={logoSrc} width={220} height={220} alt="" style={{ borderRadius: 40 }} />
        <div style={{ display: 'flex', flexDirection: 'column', width: 730 }}>
          <div style={{ fontSize: 70, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2 }}>
            Human approval, delivered to any inbox.
          </div>
          <div style={{ fontSize: 34, color: '#888888', marginTop: 28 }}>shonin.dev</div>
        </div>
      </div>
    ),
    size
  );
}
