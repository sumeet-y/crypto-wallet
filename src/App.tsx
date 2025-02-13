import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { HashRouter, Routes, Route } from "react-router-dom";

import Main from "./pages/Main";
import NotFound from "./pages/NotFound";
import CreateWallet from "./pages/CreateWallet";
import ImportWallet from "./pages/ImportWallet";
import WalletManagement from "./pages/WalletManagement";

const App = () => (
  <MantineProvider>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/manage" element={<WalletManagement />} />
        <Route path="/:walledId/mnemonic" element={<CreateWallet />} />
        <Route path="/import" element={<ImportWallet />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
    <Notifications position="top-center" />
  </MantineProvider>
);

export default App;
