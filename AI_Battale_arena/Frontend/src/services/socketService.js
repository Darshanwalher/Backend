import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

// Singleton socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// --- Connection lifecycle logging ---
socket.on("connect", () => {
  console.log("⚡ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

// --- Battle helpers ---

/**
 * Emit a battle:start event to the server.
 * @param {string} problem - The coding question / problem to battle.
 */
export function startBattle(problem) {
  socket.emit("battle:start", { problem });
}

/**
 * Listen for battle:solutions (both AI solutions ready).
 * @param {function} callback - Receives { solution_1, solution_2 }
 * @returns {function} unsubscribe function
 */
export function onSolutions(callback) {
  socket.on("battle:solutions", callback);
  return () => socket.off("battle:solutions", callback);
}

/**
 * Listen for battle:judge (judge scoring ready).
 * @param {function} callback - Receives { judge }
 * @returns {function} unsubscribe function
 */
export function onJudge(callback) {
  socket.on("battle:judge", callback);
  return () => socket.off("battle:judge", callback);
}

/**
 * Listen for battle:complete (full result).
 * @param {function} callback - Receives { problem, solution_1, solution_2, judge }
 * @returns {function} unsubscribe function
 */
export function onComplete(callback) {
  socket.on("battle:complete", callback);
  return () => socket.off("battle:complete", callback);
}

/**
 * Listen for battle:error.
 * @param {function} callback - Receives { message }
 * @returns {function} unsubscribe function
 */
export function onError(callback) {
  socket.on("battle:error", callback);
  return () => socket.off("battle:error", callback);
}

/**
 * Remove all battle-specific listeners.
 */
export function removeAllBattleListeners() {
  socket.off("battle:solutions");
  socket.off("battle:judge");
  socket.off("battle:complete");
  socket.off("battle:error");
}
