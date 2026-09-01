export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-center text-sm leading-5 text-slate-500">
            &copy; {new Date().getFullYear()} JetNext. A Jethings Company. All rights reserved.
          </p>
          <p className="text-center text-sm leading-5 text-slate-400">
            Algeria
          </p>
        </div>
      </div>
    </footer>
  );
}
