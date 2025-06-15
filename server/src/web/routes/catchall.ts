import express from "express";

export const router = express.Router();

// Handle routes not matched
router.get("*", (_, res) => {
  res.sendStatus(403);
});
