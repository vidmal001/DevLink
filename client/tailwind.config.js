import { createThemes } from 'tw-colors';

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        
        fontSize: {
            'sm': '12px',
            'base': '14px',
            'xl': '16px',
            '2xl': '20px',
            '3xl': '28px',
            '4xl': '38px',
            '5xl': '50px',
        },

        extend: {
            fontFamily: {
              inter: ["'Inter'", "sans-serif"],
              gelasio: ["'Gelasio'", "serif"]
            },
        },

    },
    plugins: [
        createThemes({
            light:{
                'white': '#FFFFFF',
                'black': '#242424',
                'grey': '#f5f5f5',
                'dark-grey': '#6B6B6B',
                'red': '#FF4E4E',
                'transparent': 'transparent',
                'twitter': '#1DA1F2',
                'purple': '#8B46FF',
                'purple2':'#bae6fd',
                'yellow':'#f59e0b',
                'gray3':'#d6d3d1',
                'red2':'#fecaca',
                'green':'#84E1BC',
                'green2':'#059669',
                'green3':'#d9f99d',
                'purple3':'#d946ef',
                'yellow2':'#fde68a',
                'slate':'#f8fafc',
                'custom':'#242424',
            },
            dark:{
                'white': '#27272a',
                'black': '#f5f5f4',
                'grey': '#3f3f46',
                'dark-grey': '#E7E7E7',
                'red': '#fb7185',
                'transparent': 'transparent',
                'twitter': '#0E71A8',
                'purple': '#bfdbfe',
                'purple2':'#a1a1aa',
                'yellow':'#f59e0b',
                'gray3':'#6B6B6B',
                'red2':'#fecaca',
                'green':'#22d3ee',
                'green2':'#2dd4bf',
                'green3':'#d9f99d',
                'purple3':'#d946ef',
                'yellow2':'#fde68a',
                'slate':'#242424',
                'custom':'#242424',
            }
        })
    ],
};