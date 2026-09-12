export function Glass({ className = '', style, children }) {
  return (
    <div className={`glass-hud rounded-3xl ${className}`} style={style}>
      {children}
    </div>
  );
}

export function LiveDot({ color = 'bg-cyan-400' }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-70 animate-ping`} />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
    </span>
  );
}
