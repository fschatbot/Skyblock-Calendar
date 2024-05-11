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
				'mc-1': "url('/backgrounds/bg1.png')",
				'mc-2': "url('/backgrounds/bg2.png')",
				'mc-3': "url('/backgrounds/bg3.png')",
				'mc-4': "url('/backgrounds/bg4.png')",
				'mc-5': "url('/backgrounds/bg5.png')",
				'mc-6': "url('/backgrounds/bg6.png')",
				'mc-7': "url('/backgrounds/bg7.png')",
				'mc-8': "url('/backgrounds/bg8.png')",
      },
			fontFamily: {
				'sans': ['mc', 'Arial', 'sans-serif'],
				'mc': ['mc'],
      	'mc-smooth': ['mc-smooth'],
			},
		},
	},
	safelist: [
    {
      pattern: /bg-mc-(1|2|3|4|5|6|7|8)/,
    },
  ],
	plugins: [],
};
