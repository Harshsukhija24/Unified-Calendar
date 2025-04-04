const Footer = () => {
  return (
    <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-white text-sm md:text-base">
            © {new Date().getFullYear()} Unified Calendar
          </div>
          <div className="text-white/70 text-xs md:text-sm mt-1 md:mt-0">
            Designed & Developed by harshSukhija
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
