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
	const [randomImage, setRandomImage] = useState(Math.floor(Math.random() * images.length));
	// Simply sets the skyDate to calcDay() every 100ms
	useEffect(() => {
		if (loading) return;
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
				.map((_, i) => <Month month={i} key={i} active={{ month, day }} />),
		[month, day, loading]
	);

	calendarFetch.then(() => setLoading(false));

	if (loading) return <h1>Loading...</h1>;

	return (
		<div style={{ "--bg": `url(${images[randomImage]})` }} className="mainContainer">
			<h1 className="Nav">Time: {TimeString}</h1>
			<h2>
				Current Events:
				{calcEvents(skyDate).map((event) => (
					<div className="chip">{event}</div>
				))}
			</h2>
			{months}
		</div>
	);
}

function Month({ month, active }) {
	const monthName = constants.MONTHS[month + 1].replace("_", " ").title();

	return (
		<div className={"month" + (active.month - 1 === month ? " active" : "")}>
			<h1>{monthName}</h1>

			<div className="days">
				{Array(constants.DAYS_IN_MONTH)
					.fill(0)
					.map((_, i) => (
						<Day day={i} month={month} key={`${month}-${i}`} active={active} />
					))}
			</div>
		</div>
	);
}

function Day({ day, month, active }) {
	const events = calcEvents({ day, month });
	const empty = events.length === 0 ? " empty" : "";
	const isActive = active.day - 1 === day && active.month - 1 === month;
	const dayRef = useRef();
	const [width, setWidth] = useState(0);

	useEffect(() => {
		if (isActive) {
			dayRef.current.scrollIntoView({ behavior: "smooth", block: "center" });

			let interval = setInterval(() => {
				const { hour, minute } = calcDay();
				setWidth((hour * 60 + minute) / (60 * 24));
			}, 100);
			return () => clearInterval(interval);
		}
	}, [isActive]);

	return (
		<div className={"day" + (isActive ? " active" : "")} ref={dayRef} style={{ "--width": `${width * 100}%` }}>
			<h1>
				{day + 1}
				{(day + 1).rank()}
			</h1>
			<div className={"events" + empty}>
				{events.length === 0 && <h2>No Events</h2>}
				{events.length !== 0 && events.map((event) => <h2 key={event.key}>{event.name}</h2>)}
			</div>
		</div>
	);
}

export default App;
