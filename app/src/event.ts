// TypeScript Type Definitions for Event Module
export interface Event { event_type: EventType, event_time: String, created_at: String, }

export type EventType = { "Meal": Meal } | { "NapStart": NapStart } | { "NapEnd": NapEnd } | { "Other": string };

export type FoodType = "BreastMilk" | "Formula" | { "TastePortion": string };

export interface Meal { quantity: number | null, food_type: FoodType, }

export interface NapStart { location: NapLocation | null, }

export interface NapEnd { location: NapLocation | null, }

export type NapLocation = "InBed" | "InBabyCarrier" | { "Other": string };