import { createContext } from "react";

const year_0 = new Date("Jun 11 2019 17:55:00 GMT").getTime() || 1.5602757e12;

let constants = {
	// Not using the API as its not updated
	events: [
		{
			key: "spookyFestival",
			name: "Spooky Festival",
			when: [{ start: { month: 8, day: 29 }, end: { month: 8, day: 31 } }],
			icon:
				"https://mc-heads.net/head/856645744bfca6af03c23e297e6ede79b528d1d24ec50d3a64abec3a0834b945" ||
				"https://static.wikia.nocookie.net/hypixel-skyblock/images/c/ca/Fear_Mongerer_Sprite.png" ||
				"https://static.wikia.nocookie.net/hypixel-skyblock/images/2/26/Jack_o%27_Lantern.png",
		},
		{
			key: "zoo",
			name: "Travelling Zoo",
			link: "https://hypixel-skyblock.fandom.com/wiki/Traveling_Zoo/Events",
			when: [
				{ start: { month: 4, day: 1 }, end: { month: 4, day: 3 } },
				{ start: { month: 10, day: 1 }, end: { month: 10, day: 3 } },
			],
			icon: "https://mc-heads.net/head/e49fe595c6a08adec8b9dab0986853271c6b87d897d7318b1badad2c34bd5a0e",
		},
		{
			key: "jerryWorkshop",
			name: "Jerry's Workshop",
			when: [{ start: { month: 12, day: 1 }, end: { month: 12, day: 31 } }],
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
		{
			key: "fishing_festival",
			name: "Fishing Festival",
			when: [{ start: { day: 1 }, end: { day: 3 } }],
			mayor: "Marina",
			icon: "https://static.wikia.nocookie.net/hypixel-skyblock/images/c/c7/Fishing_Rod.png" || "https://assets.mcasset.cloud/1.19.3/assets/minecraft/textures/item/fishing_rod.png",
		},
		{
			key: "mining_fiesta",
			name: "Mining Fiesta",
			when: [
				{ start: { month: 5, day: 1 }, end: { month: 5, day: 8 } },
				{ start: { month: 6, day: 1 }, end: { month: 6, day: 8 } },
				{ start: { month: 7, day: 1 }, end: { month: 7, day: 8 } },
				{ start: { month: 8, day: 1 }, end: { month: 8, day: 8 } },
				{ start: { month: 9, day: 1 }, end: { month: 9, day: 8 } },
			],
			mayor: "Cole",
			icon: "https://assets.mcasset.cloud/1.19.3/assets/minecraft/textures/item/iron_pickaxe.png",
		},
		{
			key: "cotfs",
			name: "Cult of the Fallen Star",
			when: [
				{ start: { day: 7 }, end: { day: 7 } },
				{ start: { day: 14 }, end: { day: 14 } },
				{ start: { day: 21 }, end: { day: 21 } },
				{ start: { day: 28 }, end: { day: 28 } },
			],
			icon: "https://mc-heads.net/head/57b3552c5af2ab2dc4e1f84d78ca4c4d676dec068157225a3c2674e5574d2348",
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
	eventConfig: localStorage.getItem("displayConfig") ? JSON.parse(localStorage.getItem("displayConfig")) : {},
};

const calendarFetch = fetch("https://hypixel-api.inventivetalent.org/api/skyblock/calendar")
	.then((res) => res.json())
	.then((data) => {
		constants = { ...constants, ...data.real, ...data.ingame, MONTHS: data.months };
	})
	.then(() => fetch("https://api.hypixel.net/resources/skyblock/election"))
	.then((res) => res.json())
	.then((data) => {
		constants.mayor = data.mayor;
	})
	.finally(() => process.env.NODE_ENV === "development" && console.log((window.constants = constants)));

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
		if (event.mayor) {
			if (event.mayor !== constants.mayor.name) return;
			if (constants.mayor.perks.every((perk) => perk.name !== event.name)) return;
		}
		event.when.forEach((when) => {
			let startDay = when.start.day || day;
			let endDay = when.end.day || day;
			let startMonth = when.start.month || month;
			let endMonth = when.end.month || month;
			if (startDay <= day && day <= endDay && startMonth <= month && month <= endMonth && (constants.eventConfig[event.name] ?? true)) {
				DayEvents.push(event);
			}
		});
	});

	// The dark auction appears every 3 days
	const days = constants.DAYS_IN_YEAR * (year - 1) + constants.DAYS_IN_MONTH * (month - 1) + day;
	if (days % 3 === 0 && (constants.eventConfig["Dark Auction"] ?? true))
		DayEvents.push({
			name: "Dark Auction",
			key: "dark_auction",
			icon: "https://mc-heads.net/head/7ab83858ebc8ee85c3e54ab13aabfcc1ef2ad446d6a900e471c3f33b78906a5b",
		});

	// Jacob's event
	if (days % 3 === 1 && (constants.eventConfig["Jacob's Event"] ?? true))
		DayEvents.push({ name: "Jacob's Event", key: "jacob", icon: "https://static.wikia.nocookie.net/hypixel-skyblock/images/5/5c/Enchanted_Wheat.png", link: "https://jacobs.strassburger.org/" });

	// Calculating the drawven kings (First King was King Erren)
	const king = (5 + days) % Object.keys(constants.DwarvenKing).length;
	(constants.eventConfig["Dwarven Kings"] ?? true) &&
		DayEvents.push({ name: `King ${Object.keys(constants.DwarvenKing)[king]}`, key: "dwarven_king", icon: "https://mc-heads.net/head/" + Object.values(constants.DwarvenKing)[king] });

	// Calculating if special mayor event is happening
	if ((year % 8 === 0 && month >= 6) || (year % 8 === 1 && month <= 3)) {
		DayEvents.push({
			name: "Special Mayor",
			key: "special_mayor",
		});
	}

	// Bingo Event
	// Calculating the Date instance when the day started
	const totalDays = (year - 1) * constants.DAYS_IN_YEAR + month * constants.DAYS_IN_MONTH + day;
	const timePassed = totalDays * constants.SECONDS_PER_DAY * 1000;
	const dayDate = new Date(constants.year_0 + timePassed);
	if (dayDate.getDate() <= 7 && (constants.eventConfig["Bingo Event"] ?? true)) {
		DayEvents.push({
			name: "Bingo Event",
			key: "bingo",
			icon: "https://mc-heads.net/head/d4cd9c707c7092d4759fe2b2b6a713215b6e39919ec4e7afb1ae2b6f8576674c",
		});
	}

	// Just for testing purposes
	// const DummyEvent = {
	// 	name: "Dummy Event",
	// 	key: "dummy",
	// 	icon: "https://static.wikia.nocookie.net/hypixel-skyblock/images/0/01/Island_NPC.png",
	// };
	// for (let i = 0; i < 2; i++) DayEvents.push(DummyEvent)

	return DayEvents;
}

/*eslint no-extend-native: ["error", { "exceptions": ["String", "Number", "Date"] }]*/
String.prototype.title = function () {
	return this.split(" ")
		.map((word) => word[0].toUpperCase() + word.slice(1))
		.join(" ");
};

const english_ordinal_rules = new Intl.PluralRules("en", { type: "ordinal" });
const suffixes = {
	one: "st",
	two: "nd",
	few: "rd",
	other: "th",
};

Number.prototype.rank = function () {
	return suffixes[english_ordinal_rules.select(this)];
};
/*
 * A simple function for formating string with a date
 * @param {string} format - The format of the date
 * @returns {string} - The formatted date
 */
Date.prototype.preset = function (preset) {
	const t = (e) => ("0" + e).slice(-2);
	return preset
		.replace(/MMMM/g, this.getFullMonth())
		.replace(/MMM/g, this.getFullMonth().slice(0, 3))
		.replace(/MM/g, t(this.getMonth() + 1))
		.replace(/YYYY/g, this.getFullYear())
		.replace(/DD/g, t(this.getDate()))
		.replace(/hh/g, t(this.getHours()))
		.replace(/HH/g, t(this.getHours() > 12 ? this.getHours() - 12 : this.getHours()))
		.replace(/Hh/g, this.getHours() >= 12 ? "PM" : "AM")
		.replace(/mm/g, t(this.getMinutes()))
		.replace(/ss/g, t(this.getSeconds()));
};
/*
 * Returns the month name
 * returns {string} - The name of the month
 */
Date.prototype.getFullMonth = function () {
	return ["Janurary", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][this.getMonth()];
};

function formatMin(min) {
	min = Math.abs(min);
	let days = Math.floor(min / (24 * 60));
	min %= 24 * 60;

	let hours = Math.floor(min / 60);
	min %= 60;

	let string = "";
	if (days) string += `${days}d `;
	if (hours) string += `${hours}h `;
	if (min) string += `${min}m `;
	return string;
}

const AppContext = createContext();

export default calcDay;
export { constants, calcEvents, calcDay, calendarFetch, formatMin, AppContext };
