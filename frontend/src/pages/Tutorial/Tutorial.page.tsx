import classes from "./Tutorial.page.module.css";

export default function Tutorial() {
  return (
    <div className={classes.videoContainer}>
      <iframe
        src="https://www.youtube.com/embed/bX-1aigqSw4"
        title="YouTube video"
        allowFullScreen
      />
    </div>
  );
}
