const Loading = () => {
  return (
    <div className="fixed z-50 inset-0 bg-loading-color flex items-center justify-center">
      <div className="text-center">
        <dotlottie-player
          src="https://lottie.host/f64d39d0-de68-4b46-b7b7-f387ad070735/VPxjOwSBH9.json"
          background="transparent"
          speed="1"
          style={{ width: '100px', height: '100px' }}
          loop
          autoplay
        ></dotlottie-player>
        <h1 className="text-white text-[2.4rem]">Loading</h1>
      </div>
    </div>
  );
};

export default Loading;
