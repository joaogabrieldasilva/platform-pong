import { Dimensions, StatusBar } from "react-native";
import { BALL_SIZE } from "./ball";

const { width, height } = Dimensions.get("screen");

const STATUS_BAR_HEIGHT = StatusBar?.currentHeight || 0;

const BALL_X_END_BOUNDARY = width - BALL_SIZE;

const BALL_Y_END_BOUNDARY = height - (STATUS_BAR_HEIGHT * 2 + BALL_SIZE);

export { BALL_X_END_BOUNDARY, BALL_Y_END_BOUNDARY };
