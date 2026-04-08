import React from 'react';
import { Composition } from 'remotion';
import { ColorshopPresentation } from './ColorshopPresentation';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="ColorshopPresentation"
        component={ColorshopPresentation}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
