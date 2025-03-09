import React from 'react';
import { Button, TextInput } from 'flowbite-react';

const UploadBanner = () => {
  return (
    <div className="flex flex-col items-center w-full mt-20">
      {/* 제목 */}
      <h3 className="text-2xl text-center mb-10">배너 업로드</h3>

      {/* 입력창과 버튼을 감싸는 div (가운데 정렬) */}
      <div className="w-1/3 min-w-[300px] flex flex-col items-center gap-4">
        <TextInput
          id="banner"
          type="text"
          placeholder="배너 이미지 url을 입력하세요"
          className="w-full"
          required
        />
        <Button type="submit" className="bg-blue-900 w-full">
          Submit
        </Button>
      </div>
    </div>
  );
};

export default UploadBanner;
