import AppImage from "../ui/AppImage";

export default function ChapterHero({ src, alt, focalPoint = "top" }) {
  if (!src) return null;

  return (
    <div className="relative rounded-xl overflow-hidden border border-sprawl-yellow/20 mb-6">
      <AppImage
        src={src}
        alt={alt}
        mode="cover"
        focalPoint={focalPoint}
        className="w-full h-48 md:h-64"
        imgClassName="opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-sprawl-deep-blue/90 via-sprawl-deep-blue/30 to-transparent pointer-events-none" />
    </div>
  );
}
