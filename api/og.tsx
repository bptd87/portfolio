import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Dynamic params
    const title = searchParams.get('title') || 'Brandon PT Davis';
    const description = searchParams.get('description') || 'Scenic Designer & Creative Director';
    const image = searchParams.get('image'); // Optional background image URL

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            backgroundColor: '#000',
            backgroundImage: image ? `url(${image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          {/* Dark Overlay gradient for text readability */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0) 60%)',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '60px',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontSize: 24,
                color: '#aaa',
                letterSpacing: '0.2em',
                marginBottom: 20,
                textTransform: 'uppercase',
                fontFamily: 'sans-serif',
              }}
            >
              Brandon PT Davis
            </div>
            
            <div
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 20,
                lineHeight: 1.1,
                fontFamily: 'sans-serif',
                maxWidth: '90%',
              }}
            >
              {title}
            </div>

            {description && (
              <div
                style={{
                  fontSize: 32,
                  color: '#ddd',
                  lineHeight: 1.4,
                  fontFamily: 'sans-serif',
                  maxWidth: '80%',
                }}
              >
                {description}
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        // We can add custom fonts here later if needed
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
