<!-- src/views/Home.vue -->
<template>
  <div class="home-container">
    <span id="title"><h1>trader Journal</h1></span>
    
  </div>
</template>

<script>
export default {
  name: "Home",
};
</script>

<style scoped>
/* Set the background image for the entire page */
.home-container {
  background-image: url("@/assets/images/background.jpg"); /* Replace with your image path */
  background-size: cover; /* Ensures the image spans the entire width */
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Prevent repeating the image */
  height: 100vh; /* Makes the container take up the full viewport height */
  display: flex; /* Align content in the center */
  justify-content: center;
  align-items: center;
  color: white; /* Adjust text color for visibility */
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6); /* Optional text shadow for contrast */
  font-size: 2.5rem; /* Adjust font size */
  margin-top: -60px;
}
h1 {
    opacity: 0.75;
    text-transform: uppercase;
    padding: 0;
    margin: 0 auto;
}
#title {
    text-transform: uppercase;
    background-color: rgba(44, 1, 83,0.09);
    border: none;
    padding: 0px 50px;
    margin: 0 auto;
    border: 1px solid rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(2px);

}
</style>