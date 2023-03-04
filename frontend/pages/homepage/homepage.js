import react from "react";
import styles from "./homepage.module.css";

const homepage = () => {
   return (
      <div>
         <div className={styles.container}>
            <div className={styles.wrapper}>
               <logo/>
               <camera/>
               <button/>
            </div>
         </div>
      </div>  
   )
}

export default homepage;