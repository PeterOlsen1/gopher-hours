/**
 * Change the time from 24 to 12 hour format
 * 
 * Only use this when displaying so we can
 * keep internal times stored in 24 hours
 * 
 * @param {stirng} time A string of time
 * @returns {string}
 */
export function to12HourTime(time) {
    let [hours, minutes] = time.split(':');
    let period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
}

/**
 * Change a 24 hour time string into minutes
 * 
 * Remember, the time is stored in 24 hour so we don't
 * need to worry about AM/PM
 * 
 * @param {string} time 
 * @returns 
 */
function timeToMinutes(time) {
    let [hours, minutes] = time.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
}

/**
 * Group office hours object by date
 * 
 * @param {object} oh 
 * @returns 
 */
export function groupOfficeHoursByDate(oh) {
    let grouped = {};
    oh.forEach(officeHour => {
        const date = officeHour.date.slice(0, 1).toUpperCase() + officeHour.date.slice(1);
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(officeHour);
    });

    Object.keys(grouped).forEach(date => {
        grouped[date].sort((a, b) => {
            return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
        });
    });

    return grouped;
}




/**
 * test data object. dont use up all the firestore reads!
 */
export const data = [
    {   
        "id": "eRUYYscZXE6MF6Dr2zP1",
        "startTime": "01:00",
        "course": "CSCI 1133",
        "date": "monday",
        "link": "",
        "endTime": "18:00",
        "location": "Keller Atrium Table 4",
        "host": {
            "email": "olse0321@umn.edu",
            "uid": "snVS969S9Uh6rgTRGsm8KiwivQr1",
            "name": "Peter Olsen",
            "lastLogin": {
                "seconds": 1738286017,
                "nanoseconds": 700000000
            },
            "photoURL": "https://lh3.googleusercontent.com/a/ACg8ocIuL83tINGEnJFzMrilbAe4pENc4c7Nu0Ki5y04i70g6dONNIg=s96-c"
        }
    },
    {   
        "id": "tTrDAqQhl3dZDMgNND29",
        "startTime": "12:00",
        "date": "wednesday",
        "location": "Lind L103",
        "endTime": "14:00",
        "course": "CSCI 4131",
        "host": {
            "lastLogin": {
                "seconds": 1738284738,
                "nanoseconds": 142000000
            },
            "email": "olse0321@umn.edu",
            "uid": "snVS969S9Uh6rgTRGsm8KiwivQr1",
            "name": "Peter Olsen",
            "photoURL": "https://lh3.googleusercontent.com/a/ACg8ocIuL83tINGEnJFzMrilbAe4pENc4c7Nu0Ki5y04i70g6dONNIg=s96-c"
        },
        "link": ""
    }
];