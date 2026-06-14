// iOS launch screens for the installed PWA. iOS does not generate a splash from
// the web manifest (unlike Android), so without these the app shows a blank white
// screen while it loads. Each entry maps an exact device resolution to a branded
// splash image generated at that pixel size.
//
// React 19 hoists these <link> tags into <head>.

type SplashEntry = {
  /** CSS (logical) width in px */
  w: number;
  /** CSS (logical) height in px */
  h: number;
  /** device pixel ratio */
  dpr: number;
  file: string;
};

const SPLASH: SplashEntry[] = [
  { w: 375, h: 667, dpr: 2, file: "iphone-se" },
  { w: 414, h: 736, dpr: 3, file: "iphone-8plus" },
  { w: 375, h: 812, dpr: 3, file: "iphone-x" },
  { w: 414, h: 896, dpr: 2, file: "iphone-xr" },
  { w: 414, h: 896, dpr: 3, file: "iphone-xsmax" },
  { w: 390, h: 844, dpr: 3, file: "iphone-12" },
  { w: 428, h: 926, dpr: 3, file: "iphone-14plus" },
  { w: 393, h: 852, dpr: 3, file: "iphone-14pro" },
  { w: 430, h: 932, dpr: 3, file: "iphone-15promax" },
  { w: 768, h: 1024, dpr: 2, file: "ipad" },
  { w: 834, h: 1194, dpr: 2, file: "ipadpro11" },
  { w: 1024, h: 1366, dpr: 2, file: "ipadpro129" },
];

export function AppleSplashLinks() {
  return (
    <>
      {SPLASH.map((s) => (
        <link
          key={s.file}
          rel="apple-touch-startup-image"
          media={`(device-width: ${s.w}px) and (device-height: ${s.h}px) and (-webkit-device-pixel-ratio: ${s.dpr}) and (orientation: portrait)`}
          href={`/splash/${s.file}.png`}
        />
      ))}
    </>
  );
}
