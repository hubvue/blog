declare const __PATH_PREFIX__: string

declare module '*.scss';
declare module '*.scss' {
  const content: {
    [className: string]: string
  };
  export default content;
}

declare module '*.png' {
  const name: string
  export default name
}