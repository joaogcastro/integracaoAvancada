import "styled-components";
interface IPalette {
  main: string;
  contrastText: string;
}
declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      default: any;
      brand: {
        blue: string;
        dark_blue: string;
        light_blue: string;
        white: string;
        black: string;
      };
      support: {
        support_01: string;
        support_02: string;
        support_03: string;
        support_04: string;
        success: string;
        error: string;
        error_02: string;
        warning: string;
        //light
        support_01_light: string;
        support_02_light: string;
        support_03_light: string;
        success_light: string;
        error_light: string;
        warning_light: string;
        //dark
        support_01_dark: string;
        support_02_dark: string;
      };
      ticket_status: {
        open: string;
        on_going: string;
        re_open: string;
        canceled: string;
        waiting_approval: string;
        impediment: string;
        done: string;
      };
      grayscale: {
        gray_05: string;
        gray_10: string;
        gray_20: string;
        gray_30: string;
        gray_40: string;
        gray_50: string;
        gray_60: string;
        gray_70: string;
        gray_80: string;
        gray_90: string;
      };
      animation: {
        skeleton_100: string;
        skeleton_50: string;
        skeleton_base: string;
        skeleton_bg: string;
      };
    };
    font: {
      h1: string[];
      h2: string[];
      h3: string[];
      h4: string[];
      p: {
        large: string[];
        medium: string[];
        normal: string[];
        small: string[];
        extra_small: string[];
        large_bold: string[];
        medium_bold: string[];
        normal_bold: string[];
        small_bold: string[];
        extra_small_bold: string[];
      };
    };
  }
}