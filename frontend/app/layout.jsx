import './globals.css';

export const metadata = {
  title: 'EagleMart - Student Marketplace',
  description: 'Buy and sell items on campus',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
