const axios = require('axios');
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getOpenFoodTrucks = async () => {
    try {
        const foodTrucksResponse = await axios.get('http://data.sfgov.org/resource/bbb8-hzi6.json');
        const {data: allFoodTrucks} = foodTrucksResponse;
        const dayTimeFilteredTrucks = filterTrucksByCurrentSFDayTime(allFoodTrucks);
        const alphabeticallySortedTrucks = sortTrucksAlphabetically(dayTimeFilteredTrucks);
        initiateDisplayPrompt(alphabeticallySortedTrucks, 0);
    } catch (e) {
        console.error(e);
    }
}

const filterTrucksByCurrentSFDayTime = (allFoodTrucks) => {
    const today = new Date();
    const sf_day = today.toLocaleString([], {
        timeZone: 'America/Los_Angeles',
        weekday: 'long',
    });
    const sf_time = today.toLocaleString([], {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric',
        hour12: false       //convert to 24hr format for easier comparison
    });

    //we want it in an array to iterate in prompt later - start index needed
    let filteredFoodTrucksArray = [];   
    Object.values(allFoodTrucks).forEach(truck => {
        //start24,end24 both strings as well, can be compared
        //e.g. '16:00' < '16:01' === true, '16:00' < '15:00' === false
        if (truck.dayofweekstr === sf_day && truck.start24 < sf_time && sf_time < truck.end24) {
            filteredFoodTrucksArray.push({name: truck.applicant, address: truck.location})
        }
    });

    return filteredFoodTrucksArray;
}

const sortTrucksAlphabetically = (filteredTrucks) => {
    return filteredTrucks.sort((a, b) => {
        const nameA = a.name.toUpperCase();     //ignore cases
        const nameB = b.name.toUpperCase();

        if (nameA < nameB) return -1;   // negative returns a
        if (nameA > nameB) return 1;    // positive returns b
        return 0;                       // equal returns both but sorted w/ respect to others
    })
}

const initiateDisplayPrompt = (foodTrucks, startIndex) => {
    const nextTenOrLess = startIndex + 10 <= foodTrucks.length ? 10 : foodTrucks.length - startIndex;
    const numOfTrucksToDisplay = startIndex + nextTenOrLess;

    displayHeader(numOfTrucksToDisplay, foodTrucks.length);
    displayNameAddressTable(foodTrucks.slice(startIndex, numOfTrucksToDisplay));
    
    //all displayed, end program
    if (numOfTrucksToDisplay === foodTrucks.length) rl.close();
        
    rl.question("Press enter to continue, n to exit: ", (input) => {
        if (input === 'n') {
            rl.close();
        } else {
            //loop by recursion until end reached
            initiateDisplayPrompt(foodTrucks, numOfTrucksToDisplay)
        }
    });
}

const displayHeader = (numOfTrucksToDisplay, totalFoodTrucks) => {
    console.log(`Displaying ${numOfTrucksToDisplay} of ${totalFoodTrucks} open food trucks in San Francisco:`);
}

const displayNameAddressTable = (trucksToDisplay) => {
    console.table(trucksToDisplay);
}

rl.on("close", () => {
    process.exit(0);
});

getOpenFoodTrucks();





