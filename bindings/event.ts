// TypeScript Type Definitions for Event Module
interface Event { event_type: EventType, event_time: String, created_at: String, }

type EventType = { "Meal": Meal } | { "NapStart": NapStart } | { "NapEnd": NapEnd } | { "Other": string };

type FoodType = "BreastMilk" | "Formula" | { "TastePortion": string };

interface Meal { quantity: number | null, food_type: FoodType, }

interface NapStart { location: NapLocation | null, }

interface NapEnd { location: NapLocation | null, }

type NapLocation = "InBed" | "InBabyCarrier" | { "Other": string };