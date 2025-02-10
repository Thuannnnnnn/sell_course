import { ResponseQaDto } from "@/app/type/qa/Qa";
import QAItem from "./QAItem";

interface QAListProps {
  qaData: ResponseQaDto[];
}

export default function QAList({ qaData }: QAListProps) {
  if (qaData.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500">
          No questions or answers found for this course.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {qaData.map((qa) => (
        <QAItem key={qa.qaId} qa={qa} />
      ))}
    </div>
  );
}
