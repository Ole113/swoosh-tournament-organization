export function formatISODate(isoString: string) {
  const date = new Date(isoString);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  const daySuffix = (day: number) => {
    if (day >= 11 && day <= 13) {
      return "th";
    }

    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  return `${month} ${day}${daySuffix(day)}, ${year} @ ${hours}:${minutes} ${ampm}`;
}

export function isFutureDate(isoString: string) {
  const inputDate = new Date(isoString);
  const currentDate = new Date();

  return inputDate > currentDate;
}
