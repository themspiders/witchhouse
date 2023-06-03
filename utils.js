export function toMillis(input) {
  const hms = {'d':86400000, 'h': 3600000, 'm': 60000, 's': 1000};
  const millis =
  (
    (String(input)).split(' ').map(
      x => (hms[x.slice(-1)] ? hms[x.slice(-1)]*Number(x.slice(0, -1)) : hms['s']*Number(x))
    ).reduce(((ac, a) => ac + a), 0)
  );
  return millis;
}

//parsetime returns a timestamp
export function parseTime(string, timelast) {
  let timestamp;
  const isDate = (string.split(' ')[0] === 'date');
  if (isDate) {
    const datestring = string.split(' ');
    const month = datestring[1];
    const day = datestring[2];
    timestamp = new Date(Date().getFullYear(), month-1, day);
    return timestamp;
  }
  let string1 = string;
  let add = false;
  let op = 1;
  if (timelast) {
    if (string[0] === '+' || string[0] === '-') {
      string1 = string.substring(1);
      add = true;
      op = (string[0] === '+' ? 1 : -1);
    }
  }
  const time = toMillis(string1);
  timestamp = (add ? timelast + op*time : Date.now() + time);
  return timestamp;
}

export function formathms(remainingTimeWSign) {
    const negative = (String(remainingTimeWSign)[0] === '-' ? '-' : '');
    const remainingTime = (negative ? String(remainingTimeWSign).slice(1) : String(remainingTimeWSign));
    const millis = remainingTime.split('.')[1];
    const remSeconds = Number(remainingTime.split('.')[0]);
    const hours = Math.floor(remSeconds / 3600);
    const minutes = Math.floor((remSeconds % 3600) / 60);
    const seconds = remSeconds % 60;
//    console.log('remTimeWSign: ', remainingTimeWSign, '| remTime: ', remainingTime, '| hours: ', hours, '| minutes: ', minutes, '| seconds: ', seconds);
    return (
      negative
      + (hours > 0 ? hours + ':' : '')
      + (minutes > 0 ? minutes + ':' : '')
      + seconds
//      + (millis ? '.' + millis : '')
    );
}
