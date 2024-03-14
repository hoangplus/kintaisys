const Loading = () => {
  return (
    <div className="absolute z-50 inset-0 bg-loading-color flex items-center justify-center">
      <div className="text-center">
        <div className="loader"></div>
        <h1 className="text-white text-[2.4rem]">Loading</h1>
      </div>
    </div>
  );
};

export default Loading;
