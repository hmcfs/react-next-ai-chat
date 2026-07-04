export default function SideBarLoading({ loading }: { loading: boolean }) {
  return (
    <div className="flex items-center justify-center">
      {loading && (
        <div className="animate-spin h-5 w-5 border-b-2 border-solid border-gray-500 rounded-full"></div>
      )}
    </div>
  );
}
