import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { initializeDatabase } from "./lib/pglite";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

// Initialize database when the app loads
const initDb = async () => {
  try {
    await initializeDatabase();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
};

function Router() {
  useEffect(() => {
    initDb();
  }, []);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
