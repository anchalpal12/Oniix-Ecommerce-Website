import AnnouncementBar from '../home/AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, showAnnouncement = true }) {
  return (
    <div className="app-shell">
      {showAnnouncement && <AnnouncementBar />}
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}
