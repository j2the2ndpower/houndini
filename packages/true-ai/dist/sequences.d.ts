export type Channel = "email" | "sms" | "whatsapp";
export type SequenceStep = {
    id: string;
    waitDays: number;
    channel: Channel;
    tone?: "friendly" | "professional" | "firm";
    template: string;
};
export type Sequence = {
    id: string;
    name: string;
    steps: SequenceStep[];
    active: boolean;
};
export declare function validateSequence(sequence: Sequence): void;
export declare function defaultSequence(): Sequence;
