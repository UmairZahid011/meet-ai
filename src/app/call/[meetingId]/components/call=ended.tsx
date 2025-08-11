
export default function CallEndedUI() {
  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center text-white bg-dark-1 p-4 text-center">
      <h4 className="text-2xl font-bold mb-4 text-black">Meeting Ended</h4>
      <p className="text-lg text-gray-400 mb-8">
        Thank you for joining the meeting, You can now close the tab safely
      </p>
    </section>
  );
}