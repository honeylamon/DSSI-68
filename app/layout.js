// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body style={{ fontFamily: 'sans-serif', margin: 0, backgroundColor: '#f4f4f4' }}>
        {children}
      </body>
    </html>
  )
}