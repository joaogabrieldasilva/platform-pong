import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Image,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  clamp,
  runOnJS,
  runOnUI,
  useAnimatedReaction,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  PLATFORM_BOTTOM_SPACING,
  PLATFORM_HEIGHT,
  PLATFORM_TOP_POSITION,
  PLATFORM_WIDTH,
} from "./src/constants/platform";
import {
  BALL_X_END_BOUNDARY,
  BALL_Y_END_BOUNDARY,
} from "./src/constants/boundaries";
import { DELTA } from "./src/constants/game";
import { BALL_SIZE, BASE_VELOCITY, IMAGE_URL } from "./src/constants/ball";

const { width, height } = Dimensions.get("screen");

export default function App() {
  const intervalId = useRef<NodeJS.Timeout>();

  const [isStarted, setIsStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [points, setPoints] = useState(0);

  const platformWidth = useSharedValue(PLATFORM_WIDTH);
  const translateX = useSharedValue((width - PLATFORM_WIDTH) / 2);
  const translateXContext = useSharedValue(0);
  const velocity = useSharedValue(BASE_VELOCITY);

  const xDirection = useSharedValue(1);
  const yDirection = useSharedValue(1);

  const ballTranslationX = useSharedValue((width - BALL_SIZE) / 2);
  const ballTranslationY = useSharedValue((height - BALL_SIZE) / 2);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      translateXContext.value = translateX.value;
    })
    .onUpdate((e) => {
      translateX.value = clamp(
        e.translationX + translateXContext.value,
        0,
        width - platformWidth.value
      );

      console.log(translateX.value);
    });

  const platformAnimatedStyles = useAnimatedStyle(() => ({
    width: platformWidth.value,
    left: translateX.value,
  }));

  const ballAnimatedStyles = useAnimatedStyle(() => ({
    left: ballTranslationX.value,
    top: ballTranslationY.value,
  }));

  const handleStartGame = () => {
    setIsStarted(true);
  };

  const handleIncrementPoints = () => {
    setPoints((points) => {
      const newPoints = points + 1;

      if (newPoints % 4 === 0) {
        velocity.value = velocity.value + 1.2;
        platformWidth.value = clamp(
          platformWidth.value - 20,
          100,
          PLATFORM_WIDTH
        );
      }

      return newPoints;
    });
  };

  const handleResetGame = () => {
    setIsGameOver(false);
    setIsStarted(false);
    setPoints(0);
    ballTranslationX.value = (width - BALL_SIZE) / 2;
    ballTranslationY.value = (height - BALL_SIZE) / 2;
    velocity.value = BASE_VELOCITY;
    platformWidth.value = withSpring(PLATFORM_WIDTH);
    translateX.value = withSpring(0);
  };

  const handleEndGame = () => {
    setIsGameOver(true);
  };

  useEffect(() => {
    if (isStarted && !isGameOver) {
      intervalId.current = setInterval(() => {
        ballTranslationX.value = clamp(
          ballTranslationX.value + velocity.value * xDirection.value,
          0,
          BALL_X_END_BOUNDARY
        );

        ballTranslationY.value = clamp(
          ballTranslationY.value + velocity.value * yDirection.value,
          0,
          BALL_Y_END_BOUNDARY
        );

        const platformLeftEdge = translateX.value;
        const platformRightEdge = platformLeftEdge + platformWidth.value;

        const isOnPlatformRange =
          ballTranslationY.value + BALL_SIZE >= PLATFORM_TOP_POSITION &&
          ballTranslationX.value + BALL_SIZE >= platformLeftEdge &&
          ballTranslationX.value - BALL_SIZE <= platformRightEdge;

        if (isOnPlatformRange) {
          yDirection.value = -1;
        }

        if (ballTranslationX.value === BALL_X_END_BOUNDARY) {
          xDirection.value = -1;
        }

        if (ballTranslationY.value === 0) {
          yDirection.value = 1;
        }

        if (ballTranslationX.value === 0) {
          xDirection.value = 1;
        }

        if (ballTranslationY.value >= BALL_Y_END_BOUNDARY) {
          runOnJS(() => handleEndGame())();
          return;
        }
      }, DELTA);
    }

    return () => {
      clearInterval(intervalId.current);
    };
  }, [isStarted, isGameOver]);

  useEffect(() => {
    runOnUI(() =>
      yDirection.addListener(1, () => {
        if (yDirection.value === -1) {
          runOnJS(handleIncrementPoints)();
        }
      })
    )();
  }, []);

  const animatedLeftEdge = useAnimatedStyle(() => ({
    left: translateX.value,
  }));

  const animatedRightEdge = useAnimatedStyle(() => ({
    left: translateX.value + platformWidth.value,
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          hidden
        />
        <Text
          style={{
            textAlign: "center",
            fontSize: 120,
            marginTop: 24,
            color: "#4b6043",
          }}
        >
          {points}
        </Text>
        {isGameOver ? (
          <TouchableOpacity onPress={handleResetGame}>
            <Text style={{ textAlign: "center", fontSize: 32, marginTop: 24 }}>
              Reset
            </Text>
          </TouchableOpacity>
        ) : null}
        {!isStarted ? (
          <TouchableOpacity onPress={handleStartGame}>
            <Text style={{ textAlign: "center", fontSize: 32, marginTop: 24 }}>
              Start
            </Text>
          </TouchableOpacity>
        ) : null}
        {isStarted && (
          <Animated.View
            style={[
              {
                width: BALL_SIZE,
                height: BALL_SIZE,
                borderRadius: BALL_SIZE / 2,
                overflow: "hidden",
                position: "absolute",
                backgroundColor: "black",
              },
              ballAnimatedStyles,
            ]}
          >
            <Image
              style={{ flex: 1 }}
              source={{
                uri: IMAGE_URL,
              }}
              resizeMode="cover"
            />
          </Animated.View>
        )}
        {/* <Animated.View style={[styles.line, animatedLeftEdge]} />
        <Animated.View style={[styles.line, animatedRightEdge]} /> */}

        <GestureDetector gesture={panGesture}>
          <Animated.View
            hitSlop={{ left: 80, right: 80, top: 80, bottom: 80 }}
            style={[styles.platform, platformAnimatedStyles]}
          />
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a3c585",
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    width: 1,
    height: height,
    backgroundColor: "red",
    position: "absolute",
  },
  platform: {
    backgroundColor: "#000000",
    height: PLATFORM_HEIGHT,
    position: "absolute",
    alignSelf: "center",
    borderRadius: 12,
    bottom: PLATFORM_BOTTOM_SPACING,
  },
});
