import { FC } from "react";
import style from "../theme/not-found-page.module.scss";

const NotFound: FC = () => {
  return (
    <div className={style.notFoundBody}>
      <div className={style.notFoundContent}>
        <h1 className={style.notFoundHeader}>404</h1>
        <p className={style.notFoundText}>Page not found</p>
      </div>
    </div>
  );
};
export default NotFound;
