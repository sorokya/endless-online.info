export function meta() {
  return [
    { title: 'EOR Database' },
    { name: 'og:title', content: 'EOR Database' },
    { name: 'og:url', content: 'https://endless-online.info' },
    { name: 'og:image', content: 'https://endless-online.info/app/icon.svg' },
    {
      name: 'og:description',
      content: 'Explore a wealth of information for Endless Online',
    },
    {
      name: 'description',
      content: 'Explore a wealth of information for Endless Online',
    },
  ];
}

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <div className="card bg-base-200 p-4 shadow-xl">
        <div className="card-body text-center">
          Welcome to the Endless Online Database! Explore a wealth of game
          information using the links above. Happy browsing!
        </div>
      </div>
    </div>
  );
}
