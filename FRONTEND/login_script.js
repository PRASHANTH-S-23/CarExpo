document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
  
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      alert(data.message);
  
      if (response.ok) {
        window.location.href = "home_page/home_page.html"; // Redirect on successful login
      } else {
        console.error("Login error:", data);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  });
  