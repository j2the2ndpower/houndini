export function validateSequence(sequence) {
    if (!sequence.name.trim())
        throw new Error("Sequence name required");
    if (!sequence.steps.length)
        throw new Error("At least one step required");
    for (const step of sequence.steps) {
        if (step.waitDays < 0)
            throw new Error("waitDays must be >= 0");
        if (!step.template.trim())
            throw new Error("Step template required");
    }
}
export function defaultSequence() {
    return {
        id: "default",
        name: "Default Overdue Sequence",
        active: true,
        steps: [
            {
                id: "step-1",
                waitDays: 0,
                channel: "email",
                tone: "professional",
                template: "First gentle reminder",
            },
            {
                id: "step-2",
                waitDays: 5,
                channel: "email",
                tone: "friendly",
                template: "Second reminder",
            },
            {
                id: "step-3",
                waitDays: 14,
                channel: "email",
                tone: "firm",
                template: "Final reminder",
            },
        ],
    };
}
