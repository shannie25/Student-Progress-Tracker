import React from "react";

const Topbar = () => {
   return (
   <div style={styles.Topbar}>
   
   <div style={styles.searchContainer}>
     <input type = "text" 
      placeholder= "Search"
      style = {styles.searchInput}
    />
   </div>

    <div style={tyles.iconContainer}>
        <span style={styles.icon}>🔔</span>
        <span style={styles.icon}>📅</span>
        <span style={styles.icon}>📥</span>
    </div>
</div>
   );
};const styles = {
  topbar: {
    height: "70px",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    borderBottom: "2px solid #2952e6"
  },

  searchContainer: {
    flex: 1
  },

  searchInput: {
    width: "300px",
    padding: "10px 15px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    outline: "none",
    fontSize: "14px"
  },

  iconContainer: {
    display: "flex",
    gap: "20px",
    fontSize: "20px",
    cursor: "pointer"
  },

  icon: {
    transition: "0.2s"
  }
};
