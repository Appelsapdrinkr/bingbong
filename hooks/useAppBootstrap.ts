import { useEffect } from "react";
import { Animated, Easing } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useAppDispatch } from "../store/hooks";
import { setAuthReady, setUser } from "../store/authSlice";
import { setShowSplash } from "../store/uiSlice";

export function useAppBootstrap(
  splashOpacity: Animated.Value,
  appOpacity: Animated.Value,
) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const holdTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(appOpacity, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => dispatch(setShowSplash(false)));
    }, 1200);

    return () => {
      clearTimeout(holdTimer);
      splashOpacity.stopAnimation();
      appOpacity.stopAnimation();
    };
  }, [appOpacity, dispatch, splashOpacity]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(
        setUser(
          user
            ? {
                uid: user.uid,
                email: user.email,
              }
            : null,
        ),
      );
      dispatch(setAuthReady(true));
    });

    return unsubscribe;
  }, [dispatch]);
}