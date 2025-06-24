export default function ThemeProvider({ children }) {
    return (
        <div className="bg-white text-gray-700 min-h-screen">
            {children}
        </div>
    );
}