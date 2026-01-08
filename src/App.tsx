import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ConversationPage } from './pages/ConversationPage';
import { ConversationStudyPage } from './pages/ConversationStudyPage';
import { WordStudyPage } from './pages/WordStudyPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/conversation" element={<ConversationPage />} />
          <Route path="/study/conversation" element={<ConversationStudyPage />} />
          <Route path="/study/words" element={<WordStudyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
