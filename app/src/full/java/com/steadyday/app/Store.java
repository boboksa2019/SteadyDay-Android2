package com.steadyday.app;

/** Full edition: everything is already unlocked, so there is nothing to buy. */
final class Store {
 static void init(MainActivity a) {}
 static void buy(MainActivity a) { a.js("window.ascendNativeEvent&&ascendNativeEvent('purchase','owned')"); }
 static void restore(MainActivity a) { a.js("window.ascendNativeEvent&&ascendNativeEvent('restore','owned')"); }
 static String state(MainActivity a) { return "{\"state\":\"full\",\"owned\":true,\"price\":\"\"}"; }
 private Store() {}
}
