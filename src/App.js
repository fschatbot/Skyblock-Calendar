import { useState, useEffect, useMemo, useRef, useContext } from "react";
import "./styles/App.css";
import "./styles/calendar.css";
import "./styles/event.css";
import "./styles/mcStyle.css";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { constants, calcDay, calcEvents, calendarFetch, formatMin, AppContext } from "./utils";
import { render } from "minecraft-text";
import parse from "html-react-parser";

// Importing all the background images
import image1 from "./backgrounds/bg1.png";
import image2 from "./backgrounds/bg2.png";
import image3 from "./backgrounds/bg3.png";
import image4 from "./backgrounds/bg4.png";
import image5 from "./backgrounds/bg5.png";
import image6 from "./backgrounds/bg6.png";
import image7 from "./backgrounds/bg7.png";
import image8 from "./backgrounds/bg8.png";

const images = [image1, image2, image3, image4, image5, image6, image7, image8];

function TopLevelLoader() {
	// This function is used to load the calendar data before rendering the app
	const [loading, setLoading] = useState(true);
	calendarFetch.then(() => setLoading(false));

	if (loading) return <h1 className="loading">Loading...</h1>;
	return <App />;
}

function App() {
	const [skyDate, setSkyDate] = useState({});
	const [configActive, setConfigActive] = useState(false);
	const [randomImage] = useState(Math.floor(Math.random() * images.length));
	const [config, setConfig] = useState(constants.eventConfig);
	function changeConfig(key, value) {
		setConfig((prevConfig) => {
			const newConfig = { ...prevConfig, [key]: value };
			localStorage.setItem("displayConfig", JSON.stringify(newConfig));
			constants.eventConfig = newConfig;
			return newConfig;
		});
	}

	const currDay = useRef();

	// Simply sets the skyDate to calcDay() every 100ms
	useEffect(() => {
		currDay.current?.scrollIntoView({ behavior: "smooth", block: "center" });

		const interval = setInterval(() => {
			setSkyDate(calcDay());
		}, 100);
		return () => clearInterval(interval);
	}, []);

	let { hour, minute, day, month, year } = skyDate;
	const isPM = hour >= 12;
	hour = String(hour % 12).padStart(2, "0");
	minute = String(minute).padStart(2, "0");

	const TimeString = `${hour}:${minute}${isPM ? "pm" : "am"} ${day}/${month}/${year} ${skyDate.monthName?.replace("_", " ")?.title()}`;
	const months = useMemo(
		() =>
			Array(constants.MONTHS_IN_YEAR)
				.fill(0)
				.map((_, i) => <Month month={i} year={year} key={i} />),
		[month, day, year] // eslint-disable-line
	);
	const actionBarMemo = useMemo(() => <ActionBar />, []);
	const ConfigMenuMemo = useMemo(() => <ConfigMenu />, []);

	return (
		<AppContext.Provider value={{ skyDate, currDay, configActive, setConfigActive, config, setConfig: changeConfig }}>
			<div style={{ "--bg": `url(${images[randomImage]})` }} className="mainContainer">
				{configActive && ConfigMenuMemo}
				{actionBarMemo}
				<h1 className="Nav">
					<span className="time">Time: {TimeString}</span>

					<div className="currEvents">
						{calcEvents(skyDate).map((event) => (
							<div className="chip" key={event.key}>
								{event.name}
							</div>
						))}
					</div>
				</h1>

				{months}

				<span className="credits">
					Made by
					<a href="https://github.com/fschatbot" target="_blank" rel="noreferrer">
						FSChatBot
					</a>
				</span>
				<Tooltip anchorSelect=".day" />
			</div>
		</AppContext.Provider>
	);
}

function Month({ month, year }) {
	const monthName = constants.MONTHS[month + 1].replace("_", " ").title();
	const { skyDate: active } = useContext(AppContext);

	return (
		<div className={"month" + (active.month - 1 === month ? " active" : "")}>
			<h1>{monthName}</h1>

			<div className="days">
				{Array(constants.DAYS_IN_MONTH)
					.fill(0)
					.map((_, i) => (
						<Day day={i} month={month} year={year} key={`${month}-${i}`} />
					))}
			</div>
		</div>
	);
}

const DateFormatter = new Intl.DateTimeFormat("en-GB", { timeStyle: "short", dateStyle: "short", hour12: true });

function Day({ day, month, year }) {
	const events = calcEvents({ day, month, year });
	const empty = events.length === 0 ? " empty" : "";
	const { currDay: activeDayRef, skyDate: active } = useContext(AppContext);
	const isActive = active.day - 1 === day && active.month - 1 === month;
	const [width, setWidth] = useState(0);
	const props = isActive ? { ref: activeDayRef } : {};
	const [ToolTip, setToolTip] = useState("");

	useEffect(() => {
		if (isActive) {
			activeDayRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
			let interval = setInterval(() => {
				const { hour, minute } = calcDay();
				setWidth((hour * 60 + minute) / (60 * 24));
			}, 100);
			return () => clearInterval(interval);
		}
	}, [isActive, activeDayRef]);

	function calcDistance() {
		// Calculating the Date instance when the day started
		const totalDays = (year - 1) * constants.DAYS_IN_YEAR + month * constants.DAYS_IN_MONTH + day;
		const timePassed = totalDays * constants.SECONDS_PER_DAY * 1000;
		const dayDate = new Date(constants.year_0 + timePassed);

		// Calculating the difference in now V/S dayDate in minutes
		const diff = dayDate - Date.now();
		const diffMin = diff / 1000 / 60;
		if (diffMin < -constants.MINUTES_PER_DAY) return `Day ended ${formatMin(Math.floor(diffMin + constants.MINUTES_PER_DAY))} ago`;
		if (-constants.MINUTES_PER_DAY <= diffMin && diffMin <= 0) return `Day ACTIVE`;
		return `Day starts in: ${formatMin(Math.floor(diffMin))}<label>${DateFormatter.format(dayDate)}</label>`;
	}

	return (
		<div className={"day" + (isActive ? " active" : "")} style={{ "--width": `${width * 100}%` }} {...props} data-tooltip-html={ToolTip} onMouseOver={() => setToolTip(calcDistance())}>
			<h1>
				{day + 1}
				{(day + 1).rank()}
			</h1>
			<div className={"events" + empty}>
				{events.length === 0 && <h2>No Events</h2>}
				{events.length !== 0 &&
					events.map((event) => (
						<h2 key={event.key} className={event.key}>
							{event.icon && <img src={event.icon} alt={event.name} />}
							{event.name}
						</h2>
					))}
			</div>
		</div>
	);
}

function JumpDay() {
	const { currDay } = useContext(AppContext);

	return (
		<div className="jumpDay actionItem" onClick={() => currDay.current?.scrollIntoView({ behavior: "smooth", block: "center" })}>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
				/>
			</svg>
		</div>
	);
}

function DisplayMayor() {
	const MayorSkins = {
		Foxy: "3485a717fa0f51d7fadc66a5d5e9853905bef914e3b2848a2f128e63d2db87",
		Marina: "807fc9bee8d3344e840e4031a37249a4c3c87fc80cf16432cc5c2153d1f9c53d",
		Paul: "1b59c43d8dbccfd7ec6e6394b6304b70d4ed315add0494ee77c733f41818c73a",
		Derpy: "f450d12692886c47b078a38f4d492acfe61216e2d0237ab82433409b3046b464",
		Jerry: "45f729736996a38e186fe9fe7f5a04b387ed03f3871ecc82fa78d8a2bdd31109",
		Scorpius: "8f26fa0c47536e78e337257d898af8b1ebc87c0894503375234035ff2c7ef8f0",
		Cole: "16422de08848952d1cbead66bbbad6f07191bdcc952f3d1036aeb0c22938f39b",
		Diana: "83cc1cf672a4b2540be346ead79ac2d9ed19d95b6075bf95be0b6d0da61377be",
		Diaz: "9cf4737cd444b590545734a6408cbe23c182f4283f167a3e3c09532ccbef17f9",
		Finnegan: "e7747fbee9fb39be39b00d3d483eb2f88b4bae82417ab5cb1b1aa930dd7b6689",
		Aatrox: "c1bdf505bb8c0f1f3365a03032de1931663ff71c57e022558de312b8f1b5c445",
	};

	return (
		<>
			<div className="mayorDisplay actionItem">
				<img src={`https://mc-heads.net/avatar/${MayorSkins[constants.mayor.name]}`} alt={constants.mayor.name} />
			</div>
			<Tooltip anchorSelect=".mayorDisplay" place="top" className="mayorToolTip">
				{constants.mayor.perks.map((perk) => {
					return (
						<div key={perk.name}>
							<h1>{perk.name}</h1>
							{parse(render(perk.description))}
						</div>
					);
				})}
			</Tooltip>
		</>
	);
}

function Options() {
	const { setConfigActive } = useContext(AppContext);

	return (
		<div className="optionDisplay actionItem" onClick={() => setConfigActive(true)}>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
				/>
			</svg>
		</div>
	);
}

function ActionBar() {
	return (
		<div className="actionBar">
			<Options />
			<DisplayMayor />
			<JumpDay />
		</div>
	);
}

function ConfigMenu() {
	const { config, setConfig, setConfigActive } = useContext(AppContext);

	function Item({ name, icon, enabled }) {
		enabled = enabled ?? config[name] ?? true;
		return (
			<div className="listItem">
				<input type="checkbox" id={name} defaultChecked={enabled} onClick={() => setConfig(name, !enabled)} />
				{icon && <img src={icon} className="h-4 w-4" alt={name} />}
				<span htmlFor={name}>{name}</span>
			</div>
		);
	}

	function EventList() {
		return (
			<>
				{constants.events.map((event) => (
					<Item key={event.name} name={event.name} icon={event.icon} enabled={config[event.name] ?? true} />
				))}
				<Item name="Dwarven Kings" />
				<Item name="Dark Auction" icon="https://mc-heads.net/head/7ab83858ebc8ee85c3e54ab13aabfcc1ef2ad446d6a900e471c3f33b78906a5b" />
				<Item name="Jacob's Event" icon="https://static.wikia.nocookie.net/hypixel-skyblock/images/5/5c/Enchanted_Wheat.png" />
				<Item name="Bingo Event" icon="https://mc-heads.net/head/d4cd9c707c7092d4759fe2b2b6a713215b6e39919ec4e7afb1ae2b6f8576674c" />
			</>
		);
	}

	const eventListMemo = useMemo(EventList, [config]);

	return (
		<div className="ConfigContainer">
			<div className="ConfigMenu">
				<h1>Config</h1>
				<div className="Options">
					<div className="Option">
						<h2>Display Events</h2>
						{eventListMemo}
					</div>
					<div className="Option !hidden md:!flex">
						<h2>Notify Me For</h2>
						<span>Under Construction 🚧</span>
					</div>
				</div>
				<button className="closeIcon" onClick={() => setConfigActive(false)}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
						<path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</button>
			</div>
		</div>
	);
}

export default App;
export { TopLevelLoader };
