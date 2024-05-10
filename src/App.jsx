import React, { useState, useEffect, useMemo, useContext } from "react";
import "./assets/styles/App.css";
import "./assets/styles/calendar.css";
import "./assets/styles/event.css";
import "./assets/styles/mcStyle.css";
import { Tooltip } from "react-tooltip";
import { constants, calcDay, calcEvents, calendarFetch, formatMin, AppContext } from "./assets/utils";
import { render } from "minecraft-text";
import parse from "html-react-parser";

// Importing all the background images
import image1 from "./assets/backgrounds/bg1.png";
import image2 from "./assets/backgrounds/bg2.png";
import image3 from "./assets/backgrounds/bg3.png";
import image4 from "./assets/backgrounds/bg4.png";
import image5 from "./assets/backgrounds/bg5.png";
import image6 from "./assets/backgrounds/bg6.png";
import image7 from "./assets/backgrounds/bg7.png";
import image8 from "./assets/backgrounds/bg8.png";

const images = [image1, image2, image3, image4, image5, image6, image7, image8];

function App() {
	const [loading, setLoading] = useState(true);
	const [fetchSuccess, setFetchSuccess] = useState(false);
	const [skyDate, setSkyDate] = useState(null);
	const [configActive, setConfigActive] = useState(false);
	const [config, setConfig] = useState(() => {
		return localStorage.getItem("displayConfig") ? JSON.parse(localStorage.getItem("displayConfig")) : constants.eventConfig;
	});
	const [randomImage] = useState(() => Math.floor(Math.random() * images.length));

	useEffect(() => {
		// console.log('Component mounted');
		async function fetchData() {
			const success = await calendarFetch();
			if (success) {
				setSkyDate(calcDay());
				setFetchSuccess(true);
			}
			setLoading(false);
		}

		fetchData();
		// return () => console.log('Component unmounted');
	}, []); // Empty array ensures this effect runs only once

	// console.log('Component rendered');

	useEffect(() => {
		let interval;
		if (skyDate) {
			interval = setInterval(() => {
				setSkyDate(calcDay());
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [skyDate]);

	if (loading) {
		return <h1 className="flex justify-center items-center text-4xl h-screen">Loading...</h1>;
	} else if (!fetchSuccess) {
		return <h1 className="flex justify-center items-center text-4xl h-screen">Failed to fetch API data</h1>;
	}

	const timeString = skyDate ? `${skyDate.hour.toString().padStart(2, '0')}:${skyDate.minute.toString().padStart(2, '0')}${skyDate.hour >= 12 ? 'pm' : 'am'} ${skyDate.day}/${skyDate.month}/${skyDate.year} ${skyDate.monthName?.replace("_", " ")?.title()}` : 'Loading...';

	const changeConfig = (key, value) => {
		setConfig((prevConfig) => {
			const newConfig = { ...prevConfig, [key]: value };
			localStorage.setItem("displayConfig", JSON.stringify(newConfig));
			constants.eventConfig = newConfig;
			return newConfig;
		});
		
	};

	return (
		<AppContext.Provider value={{ skyDate, configActive, setConfigActive, config, setConfig: changeConfig }}>
			<div style={{ backgroundImage: `url(${images[randomImage]})` }} className="bg-cover bg-no-repeat bg-fixed pt-[140px] bg-center">
				{configActive && <ConfigMenu />}
				<ActionBar />
				<h1 className="fixed z-50 left-1/2 -translate-x-1/2 top-5 rounded-xl overflow-hidden flex flex-col">
					<span className="py-4 px-8 bg-rose-500/80 backdrop-blur-sm text-sm sm:text-lg md:text-2xl text-white text-center font-minecraft">Time: {timeString}</span>
					<div className="gap-1 flex flex-row items-center justify-center w-full bg-white/80 px-2 py-1 rounded-b-xl">
						{calcEvents({ day: skyDate.day - 1, month: skyDate.month - 1, year: skyDate.year }).map((event) => (
							<div className="px-4 py-[2px] rounded-3xl bg-blue-600/80 text-white font-medium text-center text-sm sm:text-base" key={event.key}>
								{event.name}
							</div>
						))}
					</div>
				</h1>
				<MonthsDisplay />
				<span className="credits">
					Made by
					<a href="https://github.com/fschatbot" target="_blank" rel="noreferrer">
						FSChatBot
					</a>
				</span>
				<Tooltip anchorSelect=".day-anchor-element" />
			</div>
		</AppContext.Provider>
	);
}

const MonthsDisplay = React.memo(() => {
	useEffect(() => {
		activeScroll('fast');
	}, []);

	return (
		<>
			{Array(constants.MONTHS_IN_YEAR).fill().map((_, i) => <Month month={i} key={i} />)}
		</>
	);
});

function Month({ month }) {
	const monthName = useMemo(() => constants.MONTHS[month + 1].replace("_", " ").title(), [month]);
	return (
		<div className="month">
			<h1>{monthName}</h1>
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
				<Days month={month} />
			</div>
		</div>
	);
}

const Days = React.memo(({ month }) => {
	return (
		<>
			{Array(constants.DAYS_IN_MONTH).fill().map((_, i) => <Day day={i} month={month} key={`${month}-${i}`} />)}
		</>
	);
});

const DateFormatter = new Intl.DateTimeFormat('en-GB', {
	timeStyle: 'short',
	dateStyle: 'short',
	hour12: true
});

const Day = React.memo(({ day, month }) => {
	const { skyDate } = useContext(AppContext);

	const year = skyDate.year;
	const events = calcEvents({ day, month, year });
	const empty = events.length === 0 ? " empty" : "";
	const isActive = skyDate?.day - 1 === day && skyDate?.month - 1 === month;

	const [width, setWidth] = useState(0);
	const [ToolTip, setToolTip] = useState("");

	console.log("Day:", day, "Month:", month, "Year:", year);

	// useEffect(() => {
	// 	if (isActive) {
	// 		let interval = setInterval(() => {
	// 			const { hour, minute } = calcDay();
	// 			setWidth((hour * 60 + minute) / (60 * 24));
	// 		}, 1000);
	// 		return () => clearInterval(interval);
	// 	}
	// }, [isActive]);

	function calcDistance() {
		// Need to optime so it is not called on mouse movement.
		console.log("Year:", year, "Month:", month, "Day:", day);

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
		<div className={"day-anchor-element aw-44 h-44 md:w-52 md:h-52 shadow-lg rounded-md overflow-hidden backdrop-blur-sm bg-white/20 flex flex-col relative"} data-tooltip-html={ToolTip} onMouseOver={() => setToolTip(calcDistance())}>
			<h1 data-active={`${isActive ? 'true' : 'false'}`} className={`${isActive ? "bg-emerald-500" : "bg-blue-500"} relative text-white text-center font-bold py-2`}>
				{isActive ? <span style={{ right: `${(1-width)*100}%` }} className="absolute bg-black opacity-20 transition-[right] duration-1000 inset-0"></span> : null}
				{day + 1}
				{(day + 1).rank()}
			</h1>
			<div className={"custom-scroll flex items-center flex-grow flex-col gap-2 p-1 overflow-y-auto" + empty}>
				{events.length === 0 && <h2>No Events</h2>}
				{events.length !== 0 &&
					events.map((event) => (
						<h2 key={event.key} className={`${event.key} w-full bg-slate-500 rounded-sm px-1 text-xs font-medium text-white flex flex-row items-center gap-1`}>
							{event.icon && <img className="h-7 w-7 m-0.5" src={event.icon} alt={event.name} />}
							{event.name}
						</h2>
					))}
			</div>
		</div>
	);
});

function Github() {
	return (
		<div className="rounded-xl cursor-pointer text-blue-500 hover:text-blue-600 p-3 bg-white/60 backdrop-blur-3xl">
			<a href="https://github.com/fschatbot/Skyblock-Calendar">
				<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z" clipRule="evenodd"/>
				</svg>
			</a>
		</div>
	);
}

function activeScroll(type) {
	if (type === "fast") {
		type = "instant";
	} else { 
		type = "smooth";
	}

  const activeElement = document.querySelector('[data-active="true"]');
  activeElement?.scrollIntoView({ behavior: type, block: "center" });
}

function Goto() {
	return (
		<div onClick={activeScroll} className="rounded-xl cursor-pointer text-blue-500 hover:text-blue-600 p-3 bg-white/60 backdrop-blur-3xl jumpDay">
			<svg fill="currentColor" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
				<g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><title></title><path d="M114,74.5a19.92,19.92,0,0,0-28.5,0L57,103a9.9,9.9,0,0,0,14,14L99.5,88.5,128,117a9.9,9.9,0,0,0,14-14Z"></path><path d="M100,15a85,85,0,1,0,85,85A84.93,84.93,0,0,0,100,15Zm0,150a65,65,0,1,1,65-65A64.87,64.87,0,0,1,100,165Z"></path></g>
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
			<div className="rounded-xl cursor-pointer text-blue-600 p-2 bg-white/60 backdrop-blur-3xl mayor-anchor-element">
				<img className="w-10 h-10 rounded-lg" src={`https://mc-heads.net/avatar/${MayorSkins[constants.mayor.name]}`} alt={constants.mayor.name} />
			</div>
			<Tooltip anchorSelect=".mayor-anchor-element" place="top" className="mayorToolTip">
				{constants.mayor.perks.map((perk) => {
					return (
						<div key={perk.name}>
							<h1>{perk.name}</h1>
							<div className="text-sm">{parse(render(perk.description))}</div>							
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
		<button className="rounded-xl cursor-pointer text-blue-500 hover:text-blue-600 p-3 bg-white/60 backdrop-blur-3xl" onClick={() => setConfigActive(true)}>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
				/>
			</svg>
		</button>
	);
}

function ActionBar() {
	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-y-2">
			<Options />
			<DisplayMayor />
			<Github />
			<Goto />
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
