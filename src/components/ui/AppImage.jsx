export default function AppImage({
  src,
  alt,
  mode = "cover",
  focalPoint = "center",
  className = "",
  imgClassName = "",
  ...props
}) {
  const fitClass = mode === "contain" ? "object-contain" : "object-cover";

  return (
    <div className={`relative ${className}`.trim()}>
      <img
        src={src}
        alt={alt}
        className={`h-full w-full ${fitClass} ${imgClassName}`.trim()}
        style={{ objectPosition: focalPoint }}
        {...props}
      />
    </div>
  );
}
