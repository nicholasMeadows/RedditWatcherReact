import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/store.ts";
import { decreaseTimerValue } from "../redux/slice/NextPostCountdownTimerSlice.ts";

const NextPostCountdownTimer: React.FC = () => {
  const dispatch = useAppDispatch();
  const timerValue = useAppSelector(
    (state) => state.nextPostCountdownTimer.currentTimerValue
  );
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(decreaseTimerValue(1));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [dispatch]);
  return (
    <div className={"next-post-countdown-timer"}>
      <div className={"next-post-countdown-timer-text-box"}>
        <p className={"next-post-countdown-timer-text"}>
          {`Getting next posts in ${timerValue} seconds`}
        </p>
      </div>
    </div>
  );
};

export default NextPostCountdownTimer;
