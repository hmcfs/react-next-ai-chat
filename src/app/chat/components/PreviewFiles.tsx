import { useFileStore } from '@/lib/store';
import { X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
export default function PreviewFiles() {
  const fileStore = useFileStore(
    useShallow((state) => ({
      fileList: state.fileList,
      imageList: state.imageList,
      removeImage: state.removeImage,
      removeFile: state.removeFile,
    }))
  );
  const { fileList, imageList } = fileStore;
  console.log('imageUrls', fileStore);
  const previewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=`;
  return (
    (fileList.length > 0 || imageList.length > 0) && (
      <div className="flex w-full flex-col flex-wrap gap-2 h-full pt-4 overflow-y-auto">
        <div className="flex flex-wrap gap-2 w-full h-full  box-border">
          {imageList.map((file, index) => (
            <div
              key={index}
              className="w-12 cursor-pointer relative group h-12 mx-1 bg-gray-200 rounded"
            >
              <img
                src={file.url}
                alt={file.name}
                className="w-full rounded-md h-full object-cover"
              />
              <div
                onClick={() => fileStore.removeImage(file)}
                className="absolute overflow-hidden rounded-full w-4 h-4 bg-white 
              top-[-5px] font-center text-xs flex items-center justify-center
             right-[-4px] p-[1.5px] border text-gray-500 hover:text-blue-400 hover:bg-blue-50 
              group-hover:opacity-100 opacity-0 transition-opacity duration-300"
              >
                <X />
              </div>
            </div>
          ))}
        </div>
        {/* {fileList.map((file, index) => (
          <div
            key={index}
            className="w-12 cursor-pointer relative group h-14 h-12   bg-gray-200 rounded"
          >
            <iframe src={file.url} title={file.name} className="w-full rounded-md h-full object-cover" />
            <div
              onClick={() => fileStore.removeFile(file)}
              className="absolute overflow-hidden rounded-full w-4 h-4 bg-white 
              top-[-5px] font-center text-xs flex items-center justify-center
             right-[-4px] p-[1.5px] border text-gray-500 hover:text-blue-400 hover:bg-blue-50 
              group-hover:opacity-100 opacity-0 transition-opacity duration-300"
            >
              <X />
            </div>
          </div>
        ))} */}
        {fileList.map((file, index) => (
          <a
            key={index}
            href={previewUrl + encodeURIComponent(file.url)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {file.name}
          </a>
        ))}
      </div>
    )
  );
}
