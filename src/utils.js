let constants = {
	// Not using the API as its not updated
	events: [
		{ key: "spookyFestival", name: "Spooky Festival", when: [{ start: { month: 8, day: 29 }, end: { month: 8, day: 31 } }] },
		{
			key: "zoo",
			name: "Travelling Zoo",
			when: [
				{ start: { month: 4, day: 1 }, end: { month: 4, day: 3 } },
				{ start: { month: 10, day: 1 }, end: { month: 10, day: 3 } },
			],
		},
		{ key: "jerryWorkshop", name: "Jerry's Workshop", when: [{ start: { month: 12, day: 1 }, end: { month: 1, day: 1 } }] },
		{ key: "winter", name: "Season of Jerry", when: [{ start: { month: 12, day: 24 }, end: { month: 12, day: 26 } }] },
		{ key: "newYear", name: "New Year Celebration", when: [{ start: { month: 12, day: 29 }, end: { month: 12, day: 31 } }] },
		{ key: "interest", name: "Bank Interest", when: [{ start: { day: 1 }, end: { day: 1 } }] },
		{ key: "electionOver", name: "Election Over", when: [{ start: { month: 3, day: 27 }, end: { month: 3, day: 27 } }] },
	],
	DwarvenKing: ["Brammor", "Brammor", "Brammor", "Emkam", "Redros", "Erren", "Thormyr", "Emmor", "Grandan"],
};

const calendarFetch = fetch("https://hypixel-api.inventivetalent.org/api/skyblock/calendar")
	.then((res) => res.json())
	.then((data) => {
		constants = { ...constants, ...data.real, ...data.ingame, MONTHS: data.months };
		console.log(constants);
	});

const year_0 = new Date("Jun 11 2019 17:55:00 GMT").getTime() || 1.5602757e12;

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
	const [second, remainer6] = [Math.floor(remainer5 / secondDivider), remainer5 % secondDivider];

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
	if (days % 3 === 0) DayEvents.push({ name: "Dark Auction", key: "dark_auction" });

	// Calculating the drawven kings (First King was King Erren)
	const king = constants.DwarvenKing[(5 + days) % constants.DwarvenKing.length];
	DayEvents.push({ name: `King ${king}`, key: "dwarven_king" });

	return DayEvents;
}

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
