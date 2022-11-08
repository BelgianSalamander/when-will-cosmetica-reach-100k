OFFSET = 361200

TIME_DELIM = [
    [1, "second"],
    [60, "minute"],
    [3600, "hour"],
    [86400, "day"],
    [604800, "week"],
    [2629743, "month"],
    [31556926, "year"]
];

function formatNicely(seconds) {
    terms = []

    for (i = TIME_DELIM.length - 1; i >= 0; i--) {
        if (seconds >= TIME_DELIM[i][0]) {
            const num = Math.floor(seconds / TIME_DELIM[i][0]);
            terms.push(num + " " + TIME_DELIM[i][1] + (num > 1 ? "s" : ""));
            seconds %= TIME_DELIM[i][0];
        }
    }

    if (terms.length == 0) {
        terms.push("0 seconds");
    }

    return terms.slice(0, 3).join(", ");
}

//Load week.json from the server
fetch('week.json').then(function(response) {
    response.json().then(function(week) {
        //Get "https://api.cosmetica.cc/get/servicestats" json
        fetch('https://api.cosmetica.cc/get/servicestats').then(function(response) {
            response.json().then(function(data) {
                //Get current unix time in seconds
                const now = Math.floor(Date.now() / 1000);
                const weekPos = (now - OFFSET) % 604800;
                const currTS = Math.floor(weekPos / 600);
                const tsProgress = weekPos % 600;

                let tsElapsed = 0;
                let progress = data["players"];

                progress += week[currTS] * (600 - tsProgress) / 600;
                tsElapsed += (600 - tsProgress) / 600;

                idx = currTS + 1;
                idx %= week.length;

                while (progress < 100000) {
                    needed = Math.min(1, (100000 - progress) / week[idx]);
                    progress += week[idx] * needed;
                    tsElapsed += needed;
                    idx++;
                    idx %= week.length;
                } 

                const timeNeeded = tsElapsed * 600;

                document.getElementById("elem").innerHTML = "Cosmetica will reach 100k users in " + formatNicely(timeNeeded);
            });
        });
    });
});