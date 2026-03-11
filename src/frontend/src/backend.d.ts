import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Score {
    completionTime: bigint;
    deaths: bigint;
    playerName: string;
}
export interface backendInterface {
    getTopScores(): Promise<Array<Score>>;
    submitScore(playerName: string, completionTime: bigint, deaths: bigint): Promise<void>;
}
