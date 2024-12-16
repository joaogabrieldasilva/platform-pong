import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("screen");

const PLATFORM_WIDTH = width * 0.3;
const PLATFORM_HEIGHT = 24;
const PLATFORM_BOTTOM_SPACING = 80;
const PLATFORM_TOP_POSITION =
  height - PLATFORM_BOTTOM_SPACING - PLATFORM_HEIGHT;

export {
  PLATFORM_WIDTH,
  PLATFORM_HEIGHT,
  PLATFORM_BOTTOM_SPACING,
  PLATFORM_TOP_POSITION,
};
