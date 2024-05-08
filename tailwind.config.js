/** @type {import('tailwindcss').Config} */
export default {
	content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
	theme: {
		extend: {
			// Custom background are meant to go here
			backgroundImage: {
				'img-1': "url('/backgrounds/bg1.png')",
				'img-2': "url('/backgrounds/bg2.png')",
				'img-3': "url('/backgrounds/bg3.png')",
				'img-4': "url('/backgrounds/bg4.png')",
				'img-5': "url('/backgrounds/bg5.png')",
				'img-6': "url('/backgrounds/bg6.png')",
				'img-7': "url('/backgrounds/bg7.png')",
				'img-8': "url('/backgrounds/bg8.png')",
      },
			fontFamily: {
				'sans': ['mc', 'Arial', 'sans-serif'],
				'mc': ['mc'],
      	'mc-smooth': ['mc-smooth'],
			},
		},
	},
	plugins: [],
};
