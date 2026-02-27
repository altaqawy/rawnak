declare module 'animejs/lib/anime.es.js' {
  type AnimeInstance = {
    pause: () => void;
  };

  type AnimeParams = {
    targets: Element | Element[] | NodeList | null;
    duration?: number;
    delay?: number;
    easing?: string;
    autoplay?: boolean;
    opacity?: [number, number];
    translateY?: [number, number];
  };

  const anime: (params: AnimeParams) => AnimeInstance;
  export default anime;
}
