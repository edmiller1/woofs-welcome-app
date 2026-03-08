export function useMediaQuery(query: string) {
  let matches = $state(false);

  $effect(() => {
    const mediaQuery = window.matchMedia(query);
    matches = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      matches = e.matches;
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  });

  return {
    get matches() {
      return matches;
    },
  };
}
