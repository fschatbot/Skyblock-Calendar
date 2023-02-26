const year_0 = new Date("Jun 11 2019 17:55:00 GMT").getTime() || 1.5602757e12;

let constants = {
	// Not using the API as its not updated
	events: [
		{
			key: "spookyFestival",
			name: "Spooky Festival",
			when: [{ start: { month: 8, day: 29 }, end: { month: 8, day: 31 } }],
			icon: "https://static.wikia.nocookie.net/hypixel-skyblock/images/c/ca/Fear_Mongerer_Sprite.png" || "https://static.wikia.nocookie.net/hypixel-skyblock/images/2/26/Jack_o%27_Lantern.png",
		},
		{
			key: "zoo",
			name: "Travelling Zoo",
			when: [
				{ start: { month: 4, day: 1 }, end: { month: 4, day: 3 } },
				{ start: { month: 10, day: 1 }, end: { month: 10, day: 3 } },
			],
			icon: "https://static.wikia.nocookie.net/hypixel-skyblock/images/a/a8/Traveling_Zoo.png",
		},
		{
			key: "jerryWorkshop",
			name: "Jerry's Workshop",
			when: [{ start: { month: 12, day: 1 }, end: { month: 1, day: 1 } }],
			icon: "https://static.wikia.nocookie.net/hypixel-skyblock/images/b/ba/Jerry%27s_Workshop_Sprite.png",
		},
		{
			key: "winter",
			name: "Season of Jerry",
			when: [{ start: { month: 12, day: 24 }, end: { month: 12, day: 26 } }],
			icon: "https://static.wikia.nocookie.net/hypixel-skyblock/images/c/c7/White_Gift.png",
		},
		{
			key: "newYear",
			name: "New Year Celebration",
			when: [{ start: { month: 12, day: 29 }, end: { month: 12, day: 31 } }],
			icon: "https://static.wikia.nocookie.net/hypixel-skyblock/images/6/69/Enchanted_Cake.png",
		},
		{ key: "interest", name: "Bank Interest", when: [{ start: { day: 1 }, end: { day: 1 } }], icon: "https://static.wikia.nocookie.net/hypixel-skyblock/images/f/fb/Personal_Bank.png" },
		{
			key: "electionOver",
			name: "Election Over",
			when: [{ start: { month: 3, day: 27 }, end: { month: 3, day: 27 } }],
			icon: "https://static.wikia.nocookie.net/hypixel-skyblock/images/6/65/Jukebox.png",
		},
	],
	DwarvenKing: {
		Brammor: "c83c21cb1b514d4d4e30e9eaf3bc27c8ca8ded19c0624c01f77dfd97f072c0d9",
		Emkam: "54c3268d4b475e8d5b22992357ae31689ffeb70c8fb631914dc643035f70c09f",
		Redros: "b43387146756e3fcf0291e10a94dd9b0d08b7e014c03f2600397bc8a78a8e133",
		Erren: "aec7f1b83e5aa48f2a214d8d369c4702574b05bb897a1e21dd0a3437b87c041a",
		Thormyr: "b61ede621293e1fe5f6cf72ff1267691ea61eacb6cce0fd9bb28434bd7ea777b",
		Emmor: "a3c31bd60441020af2b1939bba49a96d47880b059db0e20d5d42cfaa41a1618b",
		Grandan: "1d1f4161af6d4fdfbac17adcf9d0b6f1ffb517e7b936aad9c37b747ce64ec4c6",
	},
	year_0,
};

const calendarFetch = fetch("https://hypixel-api.inventivetalent.org/api/skyblock/calendar")
	.then((res) => res.json())
	.then((data) => {
		constants = { ...constants, ...data.real, ...data.ingame, MONTHS: data.months };
		console.log(constants);
	});

function calcDay() {
	const date = Date.now() - year_0;

	const yearDivider = constants.DAYS_IN_YEAR * constants.SECONDS_PER_DAY * 1000;
	const [year, remainer] = [Math.floor(date / yearDivider), date % yearDivider];

	const monthDivider = constants.SECONDS_PER_MONTH * 1000;
	const [month, remainer2] = [Math.floor(remainer / monthDivider), remainer % monthDivider];

	const dayDivider = constants.SECONDS_PER_DAY * 1000;
	const [day, remainer3] = [Math.floor(remainer2 / dayDivider), remainer2 % dayDivider];

	const hourDivider = constants.SECONDS_PER_HOUR * 1000;
	const [hour, remainer4] = [Math.floor(remainer3 / hourDivider), remainer3 % hourDivider];

	const minuteDivider = constants.SECONDS_PER_MINUTE * 1000;
	const [minute, remainer5] = [Math.floor(remainer4 / minuteDivider), remainer4 % minuteDivider];

	const secondDivider = 1000;
	const second = Math.floor(remainer5 / secondDivider);

	return { year: year + 1, month: month + 1, day: day + 1, monthName: constants.MONTHS[month + 1], hour, minute, second };
}

function calcEvents({ day, month, year }) {
	day += 1;
	month += 1;
	let DayEvents = [];

	constants.events.forEach((event) => {
		event.when.forEach((when) => {
			let startDay = when.start.day || day;
			let endDay = when.end.day || day;
			let startMonth = when.start.month || month;
			let endMonth = when.end.month || month;
			if (startDay <= day && day <= endDay && startMonth <= month && month <= endMonth) {
				DayEvents.push(event);
			}
		});
	});

	// The dark auction appears every 3 days
	const days = constants.DAYS_IN_YEAR * (year - 1) + constants.DAYS_IN_MONTH * (month - 1) + day;
	if (days % 3 === 0)
		DayEvents.push({
			name: "Dark Auction",
			key: "dark_auction",
			icon: "https://static.wikia.nocookie.net/hypixel-skyblock/images/d/d2/Dark_Auction_House_Sprite.png",
		});

	// Jacob's event
	if (days % 3 === 1) DayEvents.push({ name: "Jacob's Event", key: "jacob", icon: "https://static.wikia.nocookie.net/hypixel-skyblock/images/5/5c/Enchanted_Wheat.png" });

	// Calculating the drawven kings (First King was King Erren)
	const king = (5 + days) % Object.keys(constants.DwarvenKing).length;
	DayEvents.push({ name: `King ${Object.keys(constants.DwarvenKing)[king]}`, key: "dwarven_king", icon: "https://mc-heads.net/head/" + Object.values(constants.DwarvenKing)[king] });

	// Calculating if special mayor event is happening
	if ((year % 8 === 0 && month >= 6) || (year % 8 === 1 && month <= 3)) {
		DayEvents.push({
			name: "Special Mayor",
			key: "special_mayor",
		});
	}

	return DayEvents;
}

/*eslint no-extend-native: ["error", { "exceptions": ["String", "Number"] }]*/
String.prototype.title = function () {
	return this.split(" ")
		.map((word) => word[0].toUpperCase() + word.slice(1))
		.join(" ");
};

Number.prototype.rank = function () {
	const ranks = {
		1: "st",
		2: "nd",
		3: "rd",
	};
	return ranks[this] || "th";
};

export default calcDay;
export { constants, calcEvents, calcDay, calendarFetch };
