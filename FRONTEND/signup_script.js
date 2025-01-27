// Toggle input fields based on nationality
const nationalitySelect = document.getElementById("nationality");
const indiaFields = document.getElementById("india-fields");
const otherFields = document.getElementById("other-fields");

// Initially set the fields based on the selected nationality
document.addEventListener("DOMContentLoaded", () => {
  if (nationalitySelect.value === "India") {
    indiaFields.style.display = "block";
    otherFields.style.display = "none";
  } else {
    indiaFields.style.display = "none";
    otherFields.style.display = "block";
  }
});

nationalitySelect.addEventListener("change", () => {
  if (nationalitySelect.value === "India") {
    indiaFields.style.display = "block";
    otherFields.style.display = "none";
  } else {
    indiaFields.style.display = "none";
    otherFields.style.display = "block";
  }
});

// Handle form submission
document.getElementById("signup-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(this);

  try {
    const response = await fetch("http://localhost:3000/signup", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      // Store the user ID in localStorage
      localStorage.setItem("userId", data.userId);
      alert("Signup successful!");
      window.location.href = "userdetails.html"; // Redirect to user details page
    } else {
      alert(data.message); // Display error message if signup fails
    }
  } catch (error) {
    console.error("Signup error:", error);
  }
});
