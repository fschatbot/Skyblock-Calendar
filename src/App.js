import { useState, useEffect, useMemo, useRef } from "react";
import "./App.css";
import { constants, calcDay, calcEvents, calendarFetch } from "./utils";

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

	calendarFetch.then(() => setLoading(false));

	if (loading) return <h1>Loading...</h1>;

	return (
		<div style={{ "--bg": `url(${images[randomImage]})` }} className="mainContainer">
			<div className="jumpDay" onClick={() => currDay.current?.scrollIntoView({ behavior: "smooth", block: "center" })}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
					/>
				</svg>
			</div>
			<h1 className="Nav">Time: {TimeString}</h1>
			<h2>
				Current Events:
				{calcEvents(skyDate).map((event) => (
					<div className="chip">{event.name}</div>
				))}
			</h2>
			{months}
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

	return (
		<div className={"day" + (isActive ? " active" : "")} style={{ "--width": `${width * 100}%` }} {...props}>
			<h1>
				{day + 1}
				{(day + 1).rank()}
			</h1>
			<div className={"events" + empty}>
				{events.length === 0 && <h2>No Events</h2>}
				{events.length !== 0 &&
					events.map((event) => (
						<h2 key={event.key}>
							{event.icon && <img src={event.icon} alt={event.name} />}
							{event.name}
						</h2>
					))}
			</div>
		</div>
	);
}

export default App;
