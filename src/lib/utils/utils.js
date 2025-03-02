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
    let today = new Date();

    let grouped = {};
    oh.forEach(officeHour => {
        let exceptionFlag = false; //signifies that we already added an exception

        //load exceptions
        if (officeHour.exceptions) {
            for (let exception of officeHour.exceptions) {
                if (exceptionFlag) {
                    continue;
                }

                let dateChanged = exception.dateChanged.toDate();
                let diff = (dateChanged - today) / (1000 * 60 * 60 * 24);
                
                if (diff < 7) {
                    const date = exception.date.slice(0, 1).toUpperCase() + exception.date.slice(1);
                    if (!grouped[date]) {
                        grouped[date] = [];
                    }

                    grouped[date].push({
                        ...officeHour,
                        date: exception.date,
                        startTime: exception.startTime,
                        endTime: exception.endTime,
                        description: exception.description,
                        location: exception.location,
                        queueEnabled: exception.queueEnabled,
                        link: exception.link,
                        exception: true
                    });

                    exceptionFlag = true;
                }
            }
        }

        if (!exceptionFlag) {
            const date = officeHour.date.slice(0, 1).toUpperCase() + officeHour.date.slice(1);
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(officeHour);
        }
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
        "courseNumber": "1133",
        "queue": [],
        "location": "Keller Atrium",
        "startTime": "14:00",
        "queueEnabled": true,
        "color": [
            47,
            5,
            31
        ],
        "host": "snVS969S9Uh6rgTRGsm8KiwivQr1",
        "endTime": "16:00",
        "description": "My old office hours",
        "department": "CSCI",
        "date": "tuesday",
        "link": "",
        "id": "LWKZjusoryMTa1EyLDBS"
    },
    {
        "location": "Keller Basement Somewhere",
        "startTime": "16:15",
        "endTime": "20:15",
        "queue": [],
        "color": [
            123,
            233,
            12
        ],
        "date": "monday",
        "department": "CSCI",
        "queueEnabled": true,
        "description": "Binary bomb!",
        "courseNumber": "2021",
        "link": "",
        "host": "snVS969S9Uh6rgTRGsm8KiwivQr1",
        "id": "MnBRc472SJhsOYyt2O4t"
    },
    {
        "host": "snVS969S9Uh6rgTRGsm8KiwivQr1",
        "startTime": "10:00",
        "location": "Lind L103",
        "link": "",
        "description": "Some 1933 office hours",
        "queueEnabled": true,
        "courseNumber": "1933",
        "department": "CSCI",
        "queue": [],
        "endTime": "12:00",
        "color": [
            98,
            160,
            120
        ],
        "date": "wednesday",
        "id": "hmTVNraHner7jtUAPiXc"
    },
    {
        "courseNumber": "4131",
        "description": "My regular office hours",
        "endTime": "16:00",
        "queueEnabled": true,
        "host": "snVS969S9Uh6rgTRGsm8KiwivQr1",
        "startTime": "14:00",
        "department": "CSCI",
        "link": "",
        "location": "Lind L103",
        "color": [
            246,
            76,
            27
        ],
        "queue": [],
        "date": "wednesday",
        "id": "pNb33Kj71goPyyV2qZ8e"
    }
]