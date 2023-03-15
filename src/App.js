import { useState, useEffect, useMemo, useRef } from "react";
import "./styles/App.css";
import "./styles/calendar.css";
import "./styles/event.css";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { constants, calcDay, calcEvents, calendarFetch, formatMin } from "./utils";
import McText from "mctext-react";

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

function App() {
	const [loading, setLoading] = useState(true);
	const [skyDate, setSkyDate] = useState({});
	const [randomImage] = useState(Math.floor(Math.random() * images.length));
	const currDay = useRef();

	// Simply sets the skyDate to calcDay() every 100ms
	useEffect(() => {
		if (loading) return;
		currDay.current?.scrollIntoView({ behavior: "smooth", block: "center" });

		const interval = setInterval(() => {
			setSkyDate(calcDay());
		}, 100);
		return () => clearInterval(interval);
	}, [loading]);

	let { hour, minute, day, month, year } = skyDate;
	const isPM = hour >= 12;
	hour = String(hour % 12).padStart(2, "0");
	minute = String(minute).padStart(2, "0");

	const TimeString = `${hour}:${minute}${isPM ? "pm" : "am"} ${day}/${month}/${year} ${skyDate.monthName?.replace("_", " ")?.title()}`;
	const months = useMemo(
		() =>
			!loading &&
			Array(constants.MONTHS_IN_YEAR)
				.fill(0)
				.map((_, i) => <Month month={i} year={year} key={i} active={{ month, day, currDay }} />),
		[month, day, year, loading]
	);
	const mayorElem = useMemo(() => <DisplayMayor />, [month]);

	calendarFetch.then(() => setLoading(false));

	if (loading) return <h1>Loading...</h1>;

	return (
		<div style={{ "--bg": `url(${images[randomImage]})` }} className="mainContainer">
			<JumpDay activeDayRef={currDay} />
			{mayorElem}
			<h1 className="Nav">Time: {TimeString}</h1>
			<div className="currEvents">
				<h2>Current Events:</h2>
				{calcEvents(skyDate).map((event) => (
					<div className="chip" key={event.key}>
						{event.name}
					</div>
				))}
			</div>
			{months}
			<Tooltip anchorSelect=".day" />
		</div>
	);
}

function Month({ month, year, active }) {
	const monthName = constants.MONTHS[month + 1].replace("_", " ").title();

	return (
		<div className={"month" + (active.month - 1 === month ? " active" : "")}>
			<h1>{monthName}</h1>

			<div className="days">
				{Array(constants.DAYS_IN_MONTH)
					.fill(0)
					.map((_, i) => (
						<Day day={i} month={month} year={year} key={`${month}-${i}`} active={active} />
					))}
			</div>
		</div>
	);
}

function Day({ day, month, year, active }) {
	const events = calcEvents({ day, month, year });
	const empty = events.length === 0 ? " empty" : "";
	const isActive = active.day - 1 === day && active.month - 1 === month;
	const [width, setWidth] = useState(0);
	const props = isActive ? { ref: active.currDay } : {};
	const [ToolTip, setToolTip] = useState("");

	useEffect(() => {
		if (isActive) {
			active.currDay.current?.scrollIntoView({ behavior: "smooth", block: "center" });
			let interval = setInterval(() => {
				const { hour, minute } = calcDay();
				setWidth((hour * 60 + minute) / (60 * 24));
			}, 100);
			return () => clearInterval(interval);
		}
	}, [isActive, active.currDay]);

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
		return `Day starts in: ${formatMin(Math.floor(diffMin))}`;
	}

	return (
		<div className={"day" + (isActive ? " active" : "")} style={{ "--width": `${width * 100}%` }} {...props} data-tooltip-content={ToolTip} onMouseOver={() => setToolTip(calcDistance())}>
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

function JumpDay({ activeDayRef }) {
	return (
		<div className="jumpDay" onClick={() => activeDayRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}>
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
	const currMayor = constants.mayor.candidates.filter((a) => a.name === constants.mayor.winner)[0];
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
		Finnegan: "",
		Aatrox: "c1bdf505bb8c0f1f3365a03032de1931663ff71c57e022558de312b8f1b5c445",
	};
	// console.log(currMayor);
	const colorPallete = { ...McText.defaultProps.colormap, gray: "#d1d5db" }; // Changing the color of gray to better suit the css

	return (
		<>
			<div className="mayorDisplay">
				<img src={`https://mc-heads.net/avatar/${MayorSkins[currMayor.name]}`} alt={currMayor.name} />
			</div>
			<Tooltip anchorSelect=".mayorDisplay" place="top" className="mayorToolTip">
				{currMayor.perks.map((perk) => {
					return (
						<div key={perk.name}>
							<h1>{perk.name}</h1>
							<McText style={{ fontFamily: "inherit" }} colormap={colorPallete}>
								{perk.description}
							</McText>
						</div>
					);
				})}
			</Tooltip>
		</>
	);
}

export default App;
