import React from "react";
import styles from "./Header.module.css";
import Logo from "../../img/Logo.png"

const Header = () => {
   return (
      <>
         <div className={styles.wrapper}>
            <a href="/" className={styles.logo}>
               <img src={Logo} alt="Logo"/>
            </a>
         </div>
      </>
   )
}

export default Header;