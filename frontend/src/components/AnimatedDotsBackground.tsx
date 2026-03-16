
export function AnimatedDotsBackground() {
    return (
        <div className="absolute inset-0 flex flex-col justify-around py-4 opacity-20 pointer-events-none z-0">
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className="bg-dot-row animate-dots"
                    style={{
                        animationDelay: `${i * 0.2}s`,
                        backgroundPositionX: `${(i % 3) * 60}px`
                    }}
                />
            ))}
        </div>
    );
}