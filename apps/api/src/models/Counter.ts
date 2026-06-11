import { Schema, model } from 'mongoose';

// One document per sequence key, e.g. _id "order:2026".
const counterSchema = new Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

export const Counter = model('Counter', counterSchema);
