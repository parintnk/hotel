export type Intent =
  "check_availability" | "book" | "price" | "complaint" | "general";
export type ChatTurn = { from: "user" | "bot"; text: string };
export type IncomingMessage = {
  hotelId: string;
  text: string;
  sessionId: string;
  history?: ChatTurn[];
};
export type BotReply = {
  text: string;
  intent: Intent;
  handledBy: "ai" | "human";
};
