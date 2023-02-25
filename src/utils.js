let constants = {};

const calendarFetch = fetch("https://hypixel-api.inventivetalent.org/api/skyblock/calendar")
	.then((res) => res.json())
	.then((data) => {
		constants = { ...data.real, ...data.ingame, MONTHS: data.months };
		// Formatting the events a little
		data.events.yearly.forEach((event) => {
			event.when.map((when) => {
				when.start.month = data.reverseMonths[when.start.month];
				when.end.month = data.reverseMonths[when.end.month];

				return when;
			});
		});
		data.events.monthly.forEach((event) => {
			event.when.map((when) => {
				when.start = { day: when.day };
				when.end = { day: when.day };
				return when;
			});
		});
		constants.events = [...data.events.yearly, ...data.events.monthly];

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

function calcEvents({ day, month }) {
	day += 1;
	month += 1;
	let events = [];
	constants.events.forEach((event) => {
		event.when.forEach((when) => {
			let startDay = when.start.day || day;
			let endDay = when.end.day || day;
			let startMonth = when.start.month || month;
			let endMonth = when.end.month || month;
			if (startDay <= day && day <= endDay && startMonth <= month && month <= endMonth) {
				events.push(event);
			}
		});
	});

	return events;
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
