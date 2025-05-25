import { Loader } from "@mantine/core";
import classes from "./Loading.module.css";

export default function Loading() {
  return (
    <div className={classes.loadingContainer}>
      <Loader color="orange" />
    </div>
  );
}
