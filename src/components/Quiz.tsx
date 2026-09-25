import { useState } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { QuizQuestion } from "@/data/topics";
import { renderWithInlineCode } from "@/lib/inline-code";

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

/** Fisher-Yates shuffle of `[0, 1, ..., length - 1]`. */
function shuffledIndices(length: number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function Quiz({ questions, onComplete }: QuizProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  // Randomise option order once per mount so the answer isn't always in the
  // same position. `selected` still holds the original option index.
  const [optionOrders] = useState(() => questions.map((q) => shuffledIndices(q.options.length)));

  const question = questions[index];
  const isCorrect = submitted && selected === question.correctIndex;
  const isLast = index === questions.length - 1;

  function handleSubmit() {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === question.correctIndex) {
      setScore((s) => s + 1);
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });
    }
  }

  function handleNext() {
    if (isLast) {
      if (score === questions.length) {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      }
      onComplete(score);
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setSubmitted(false);
  }

  if (finished) {
    return (
      <div className="space-y-4" data-testid="quiz">
        <p className="font-medium">
          Quiz complete! Score: {score}/{questions.length}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="quiz">
      <p className="text-sm text-muted-foreground">
        Question {index + 1} of {questions.length}
      </p>
      <p className="font-medium">{question.question}</p>
      <RadioGroup
        value={String(selected ?? "")}
        onValueChange={(v) => !submitted && setSelected(Number(v))}
      >
        {optionOrders[index].map((i) => (
          <div key={question.options[i]} className="flex items-center space-x-2">
            <RadioGroupItem value={String(i)} id={`option-${i}`} disabled={submitted} />
            <Label htmlFor={`option-${i}`}>{question.options[i]}</Label>
          </div>
        ))}
      </RadioGroup>

      {!submitted ? (
        <Button onClick={handleSubmit} disabled={selected === null}>
          Submit
        </Button>
      ) : (
        <div className="space-y-2">
          <p className={isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {isCorrect ? "Correct!" : "Not quite."}
          </p>
          <p className="text-sm text-muted-foreground">{renderWithInlineCode(question.explanation)}</p>
          <Button onClick={handleNext}>{isLast ? "Finish" : "Next question"}</Button>
        </div>
      )}
    </div>
  );
}
