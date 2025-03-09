  // Auto-connect logic
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedAddress = localStorage.getItem("accountAddress");
    
    if (storedUsername && storedAddress) {
      setUsername(storedUsername);
      // Try to login with the stored username
      handlePasskeyLogin(storedUsername).catch(err => {
        console.error("Auto-login failed:", err);
        // If auto-login fails, clear the stored data
        localStorage.removeItem("username");
        localStorage.removeItem("accountAddress");
      });
    }
  }, []);
