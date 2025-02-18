import { ResponseQaDto } from '@/app/type/qa/Qa';
import Image from 'next/image';

interface QAItemProps {
  qa: ResponseQaDto;
}

export default function QAItem({ qa }: QAItemProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 ${
        qa.parentId ? 'ml-12 bg-gray-50' : ''
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Image
            src={qa.avatarImg || '/default-avatar.png'}
            alt={qa.username}
            width={40}
            height={40}
            className="rounded-full"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = '/default-avatar.png';
            }}
          />
        </div>
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold">{qa.username}</h3>
              <p className="text-sm text-gray-500">{qa.userEmail}</p>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(qa.createdAt).toLocaleString()}
            </span>
          </div>
          {qa.parentId && (
            <div className="text-sm text-gray-500 mb-2">
              Replying to question #{qa.parentId}
            </div>
          )}
          <p className="text-gray-700 whitespace-pre-wrap">{qa.text}</p>
        </div>
      </div>
    </div>
  );
}
