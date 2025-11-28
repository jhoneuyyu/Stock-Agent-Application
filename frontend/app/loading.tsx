export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
                    <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                </div>
                <p className="text-muted-foreground">Loading Stock Agent...</p>
            </div>
        </div>
    );
}
