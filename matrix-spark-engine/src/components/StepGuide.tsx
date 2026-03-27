const steps = [
  { num: "01", title: "Input", desc: "Upload Source Image A and B into the scanning zones below." },
  { num: "02", title: "Calibrate", desc: "Adjust 'Threshold Logic' to define the sparsification sensitivity." },
  { num: "03", title: "Strategy", desc: "In Phase 4, select between Array or Linked List storage models." },
  { num: "04", title: "Execute", desc: "Perform matrix addition, subtraction, or transposition commands." },
];

const StepGuide = () => (
  <div className="grid grid-cols-4 gap-3">
    {steps.map((s) => (
      <div key={s.num} className="flex gap-2">
        <span className="text-[10px] font-display text-primary/40 font-bold">Step {s.num}:</span>
        <div>
          <span className="text-[10px] font-semibold text-foreground">{s.title}</span>
          <p className="text-[9px] text-muted-foreground leading-relaxed mt-0.5">{s.desc}</p>
        </div>
      </div>
    ))}
  </div>
);

export default StepGuide;
