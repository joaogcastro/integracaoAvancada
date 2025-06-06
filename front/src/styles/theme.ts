    import type { SistemTheme } from "../models/sistemTheme";



    export const light = {
    colors: {
        brand: {
        blue: "#7B1FA2",
        light_blue: "#9C27B0",
        dark_blue: "#5D1A7A",
        white: "#FFFFFF",
        black: "#212E2F",
        },
        support: {
        support_01: "#BEDCE4",
        support_02: "#DEF8CB",
        support_03: "#FF8E29",
        success: "#049725",
        error: "#E14141",
        error_02: "#b81d1d",
        warning: "#F9D934",
        //light
        support_01_light: "#FBFDFD",
        support_02_light: "#FDFFFC",
        support_03_light: "#FFF8F2",
        support_04: "#354ecc",
        success_light: "#B3FFB9",
        error_light: "#FCECEC",
        warning_light: "#FEFBEB",
        //dark
        support_01_dark: "#3c7585",
        support_02_dark: "#6ea348",
        },
        ticket_status: {
        open: "#2253CF",
        on_going: "#A222CF",
        re_open: "#B01313",
        canceled: "#969696",
        waiting_approval: "#FFA500",
        impediment: "#202020",
        done: "#02BA2A",
        },
        grayscale: {
        gray_05: "#F1F1F1",
        gray_10: "#E9EAEA",
        gray_20: "#D3D5D5",
        gray_30: "#BCC0C1",
        gray_40: "#A6ABAC",
        gray_50: "#909797",
        gray_60: "#7A8282",
        gray_70: "#646D6D",
        gray_80: "#4D5859",
        gray_90: "#374344",
        },
        animation: {
        //skeleton
        skeleton_100: "rgba(255, 255, 255, 0)",
        skeleton_50: "rgba(255, 255, 255, 0.5)",
        skeleton_base: "#ededed",
        skeleton_bg: "#f9f9f9",
        },
    },

    font: {
        h1: [
        "font: 3em 'Poppins', sans-serif; font-weight: 400; line-height: 1.2em;",
        ],
        h2: [
        "font: 2.4em 'Poppins', sans-serif; font-weight: 400; line-height: 1.2em; ",
        ],
        h3: [
        "font: 2em 'Poppins', sans-serif; font-weight: 400; line-height: 1.2em; ",
        ],
        h4: [
        "font: 1.5em 'Poppins', sans-serif; font-weight: 400; line-height: 1.2em; ",
        ],
        p: {
        //normal
        large: [
            "font: 1.3em 'Poppins', sans-serif; font-weight: 400; line-height: 1.2em;",
        ],
        medium: [
            "font: 1.2em  'Poppins', sans-serif; font-weight: 400; line-height: 1.2em;",
        ],
        normal: [
            "font: 1em 'Poppins', sans-serif; font-weight: 400; line-height: 1.3em;",
        ],
        small: [
            "font: 0.9em 'Poppins', sans-serif; font-weight: 400; line-height: 1.2em;",
        ],
        extra_small: [
            "font: 0.8em 'Poppins', sans-serif; font-weight: 400; line-height: 1.2em;",
        ],
        //bold
        large_bold: [
            "font: 1.3em 'Poppins', sans-serif; font-weight: 700; line-height: 1.2em;",
        ],
        medium_bold: [
            "font: 1.2em 'Poppins', sans-serif; font-weight: 700; line-height: 1.2em;",
        ],
        normal_bold: [
            "font: 1em 'Poppins', sans-serif; font-weight: 700; line-height: 1.3em;",
        ],
        small_bold: [
            "font: 0.9em 'Poppins', sans-serif; font-weight: 700; line-height: 1.2em;",
        ],
        extra_small_bold: [
            "font: 0.8em 'Poppins', sans-serif; font-weight: 700; line-height: 1.2em;",
        ],
        },
    },
    };

    export const dark = {
    colors: {
        brand: {
        blue: "#7B1FA2",
        light_blue: "#9C27B0",
        dark_blue: "#FFFFFF",
        black: "#FFFFFF",
        white: "#212E2F",
        },
        support: {
        support_01: "#BEDCE4",
        support_02: "#DEF8CB",
        support_03: "#FF8E29",
        success: "#049725",
        error: "#E14141",
        error_02: "#b81d1d",
        warning: "#F9D934",
        //light
        support_01_light: "#003636",
        support_02_light: "#174500",
        support_03_light: "#4d2300",
        support_04: "#07124a",
        success_light: "#B3FFB9",
        error_light: "#FCECEC",
        warning_light: "#FEFBEB",
        //dark
        support_01_dark: "#3c7585",
        support_02_dark: "#6ea348",
        },
        ticket_status: {
        open: "#2253CF",
        on_going: "#A222CF",
        re_open: "#B01313",
        canceled: "#969696",
        waiting_approval: "#FFA500",
        impediment: "#202020",
        done: "#02BA2A",
        },
        grayscale: {
        gray_90: "#FAFAFA",
        gray_80: "#E9EAEA",
        gray_70: "#D3D5D5",
        gray_60: "#BCC0C1",
        gray_50: "#A6ABAC",
        gray_40: "#909797",
        gray_30: "#7A8282",
        gray_20: "#646D6D",
        gray_10: "#4D5859",
        gray_05: "#161b1c",
        },
        animation: {
        //skeleton
        skeleton_100: "rgba(100, 100, 100, 0)",
        skeleton_50: "rgba(100, 100, 100, 0.5)",
        skeleton_base: "#444",
        skeleton_bg: "#333333",
        },
    },

    font: light.font,
    };

    export const themesOptions = {
    light,
    dark,
    };

    export const theme = () => {
    const storageTheme: SistemTheme = (localStorage.getItem("gcc-theme") ||
        "light") as SistemTheme;

    return themesOptions[storageTheme];
    };